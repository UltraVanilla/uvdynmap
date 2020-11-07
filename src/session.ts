import Koa from "koa";
import session from "koa-session";

import redisStore from "koa-redis";
import redis from "./redis";

export let sessionMiddleware: Koa.Middleware;

import * as uuid from "uuid";

import * as crypto from "crypto";

declare module "koa-session" {
    interface opts {
        autoCommit: boolean;
    }
}

export function configureSessions(app: Koa): Koa.Middleware {
    const store = redisStore({
        client: redis,
    });

    sessionMiddleware = session(
        {
            store,
            signed: false,
            autoCommit: false,
            prefix: "session:",
            genid() {
                const buf = Buffer.alloc(32);
                crypto.randomFillSync(buf);
                return "session:" + buf.toString("hex");
            },
            async beforeSave(ctx: Koa.Context, session: session.Session) {
                if (session.uuid != null) {
                    redis.sadd(`activeSessions:${session.uuid}`, session._sessCtx.externalKey);
                }
            },
        },
        app,
    );

    return sessionMiddleware;
}
