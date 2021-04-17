import { EventEmitter, once } from "events";
import TypedEmitter from "typed-emitter";

import Koa from "koa";
import { Middleware } from "koa";

import fetch from "node-fetch";
import LRUCache from "lru-cache";

import { sleep } from "./util";
import DmMap from "./model/DmMap";
import DmTile from "./model/DmTile";
import * as api from "./auth/auth-api";

import redis from "./redis";

const mapCache: LRUCache<string, DmMap> = new LRUCache({
    maxAge: 1000 * 60 * 60 * 2,
});

const tileCache: LRUCache<string, DmTile> = new LRUCache({
    max: 18000,
});

const worldUpdateCachers = new Map();

export async function getMap(match: { worldID: string; mapID: string }): Promise<DmMap> {
    const cacheKey = `${match.worldID},${match.mapID}`;
    const cached = mapCache.get(cacheKey);
    if (cached != null) return cached;

    const map = await DmMap.query().findOne(match);

    if (map != null) mapCache.set(cacheKey, map);

    return map;
}

export const tileServer = async (ctx: Koa.Context): Promise<void> => {
    const { worldID, mapID, coords } = ctx.params;

    const cacheId = `tile:${worldID}:${mapID}:${coords}`;

    let tile = tileCache.get(cacheId);
    if (tile == null) {
        const map = await getMap({ worldID, mapID });

        if (map == null) ctx.throw(404);

        const matches = coords.match(/(z+)?_?([-+]?[0-9]+)_([-+]?[0-9]+)/);

        const zoom = (matches[1] || "").length;
        const x = parseInt(matches[2]);
        const y = parseInt(matches[3]);

        tile = await map.$relatedQuery("tiles").findOne({ x, y, zoom });

        if (tile == null) ctx.throw(404);

        tileCache.set(cacheId, tile);
    }

    const roundedDate = new Date(Math.floor(tile.lastUpdate.getTime() / 1000) * 1000);

    ctx.type = "image/png";
    ctx.lastModified = roundedDate;
    ctx.set("Cache-Control", "private, must-revalidate, max-age=0");

    if (ctx.headers["if-modified-since"] != null && new Date(ctx.headers["if-modified-since"]) >= roundedDate) {
        ctx.throw(304);
    } else {
        ctx.body = tile.image;
    }
};

export const worldUpdates = async (ctx: Koa.Context): Promise<void> => {
    const { world } = ctx.params;

    const cacher = worldUpdateCachers.get(world);
    if (cacher == null) ctx.throw(404);

    const [update] = await once(cacher, "update");
    ctx.body = update;
};

interface WorldUpdateCacherEvents {
    update: (ping: api.WorldPing) => void;
}

class WorldUpdateCacher extends (EventEmitter as new () => TypedEmitter<WorldUpdateCacherEvents>) {
    worldName: string;

    constructor(worldName: string) {
        super();

        this.worldName = worldName;
        this.loop();
    }

    async loop() {
        while (true) {
            let lateby = 1000;
            try {
                const res = (await (
                    await fetch(`${process.env.DYNMAP_BACKEND!}up/world/${this.worldName}/1`, {
                        timeout: 7500,
                    })
                ).json()) as api.WorldPing;
                this.processUpdates(res.updates);
                this.emit("update", res);

                lateby = Math.max(0, Date.now() - res.timestamp);
            } catch (err) {
                // silent fail
            }
            await sleep(Math.max(1000 - lateby, 200));
        }
    }

    processUpdates(updates: api.WorldUpdate[]) {
        for (const update of updates) {
            if (update.type == "tile") tileCache.del(`/tiles/${this.worldName}/${update.name}`);
        }
    }
}

async function configureWorldUpdateCachers() {
    try {
        const res = await (
            await fetch(`${process.env.DYNMAP_BACKEND!}up/configuration`, {
                timeout: 7500,
            })
        ).json();

        for (const world of res.worlds) {
            world.name;
            worldUpdateCachers.set(world.name, new WorldUpdateCacher(world.name));
        }

        tileCache.reset();
    } catch (err) {
        await sleep(1000);
        configureWorldUpdateCachers();
    }
}

configureWorldUpdateCachers();
