import fs from "fs";
import path from "path";
import stream from "stream";

import msgpack from "msgpack-lite";

import { Model } from "objection";

import CoreProtectWorld from "../model/CoreProtectWorld";
import CoreProtectUser from "../model/CoreProtectUser";
import CoreProtectEntity from "../model/CoreProtectEntity";
import CoreProtectBlock from "../model/CoreProtectBlock";
import CoreProtectContainer from "../model/CoreProtectContainer";
import CoreProtectItem from "../model/CoreProtectItem";
import CoreProtectUsernameChange from "../model/CoreProtectUsernameChange";
import CoreProtectBlockDataMap from "../model/CoreProtectBlockDataMap";
import CoreProtectEntityMap from "../model/CoreProtectEntityMap";
import CoreProtectMaterialMap from "../model/CoreProtectMaterialMap";
import CoreProtectArtMap from "../model/CoreProtectArtMap";
import CoreProtectSession from "../model/CoreProtectSession";
import CoreProtectSkull from "../model/CoreProtectSkull";
import CoreProtectSign from "../model/CoreProtectSign";

const { ZSTDCompress } = require("simple-zstd");

const args = process.argv.slice(2);

const dir = args[0];

const resumeLocations = new Map<string, number>();

const fileSize = 262144;

let totalWork = 0;
let workDone = 0;

async function table(table: typeof Model, name: string) {
    const max = ((await table.query().orderBy("rowid", "desc").limit(1))[0] as any).rowid || 0;

    const resumeFrom = resumeLocations.get(name) || 0;

    totalWork += max - resumeFrom;

    for (let start = resumeFrom; ; start += fileSize) {
        const finish = start + fileSize;

        if (start > max) break;

        const results = await table.query().where("rowid", ">=", start).andWhere("rowid", "<", finish);
        const encoded = msgpack.encode(results);

        await stream.promises.pipeline(
            stream.Readable.from(encoded),
            ZSTDCompress(19),
            fs.createWriteStream(`${dir}/${name}.${start.toString().padStart(19, "0")}.zst`),
        );
        console.log(`Wrote ${name} ${start}-${finish}`);
        workDone += fileSize;
        console.log(`Percent complete: ${(100 * workDone) / totalWork}%`);
    }

    console.log(`Finished ${name}`);
}

async function backup() {
    for (let filename of (await fs.promises.readdir(dir)).sort()) {
        const split = filename.split(".");
        resumeLocations.set(split[0], parseInt(split[1], 10));
    }

    await Promise.all([
        table(CoreProtectUsernameChange, "username_change"),
        table(CoreProtectBlockDataMap, "blockdata_map"),
        table(CoreProtectEntityMap, "entity_map"),
        table(CoreProtectMaterialMap, "material_map"),
        table(CoreProtectArtMap, "art_map"),
        table(CoreProtectSession, "session"),
        table(CoreProtectSkull, "skull"),
        table(CoreProtectSign, "sign"),
        table(CoreProtectWorld, "world"),
        table(CoreProtectUser, "user"),
        table(CoreProtectEntity, "entity"),
        table(CoreProtectBlock, "block"),
        table(CoreProtectContainer, "container"),
        table(CoreProtectItem, "item"),
    ]);
    console.log("Successfully backed up CoreProtect");

    process.exit(0);
}

backup();
