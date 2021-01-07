import Koa from "koa";
import { Middleware } from "koa";

import jwt from "jsonwebtoken";
import cheerio from "cheerio";

import { transaction } from "objection";
import LRUCache from "lru-cache";

import CoreProtectUser from "../model/CoreProtectUser";
import User from "../model/User";
import * as authApi from "./auth-api";
import schemas from "../ajv-schemas";
import { sessionMiddleware } from "../session";
import redis from "../redis";

export let jwtPublicKey = `
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE2/NW5Jc1zyq+wrLaZ2doJUgS4Utx
KIuDP7pYrXQ2Wz4cnTqOGsknAEhLkVAS9zT4Cxcn7X9at2155cObymun0w==
-----END PUBLIC KEY-----
`;
if (process.env.VAULTJWT_KEY != null)
    process.env.VAULTJWT_KEY = jwtPublicKey = process.env.VAULTJWT_KEY.split("\\n").join("\n");

declare module "koa" {
    interface BaseContext {
        coreProtectUser?: CoreProtectUser;
        user?: User;
    }
}

export function ultravanillaSession(
    filter: (input: { roles?: string[]; uuid?: string }) => boolean,
    errorString = "Error",
): Middleware[] {
    return [
        sessionMiddleware,
        async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
            let allowed = false;
            let user;
            if (ctx.session?.uuid == null || (user = await getCachedUser(ctx.session!.uuid)) == null) {
                allowed = filter({});
                ctx.session = null;
            } else {
                const roles = user.userAccount.roles;

                ctx.coreProtectUser = user;
                ctx.user = user.userAccount;

                allowed = filter({ roles, uuid: ctx.session!.uuid });
            }

            if (allowed) await next();
            else ctx.throw(403, errorString);
        },
    ];
}

export const accountInfo = [
    sessionMiddleware,
    ...ultravanillaSession(() => true),
    async (ctx: Koa.Context, _next: Koa.Next): Promise<void> => {
        if (ctx.coreProtectUser != null && ctx.user != null) {
            ctx.body = {
                name: ctx.coreProtectUser.user,
                uuid: ctx.coreProtectUser.uuid,
                roles: ctx.user.roles,
            };
        }
    },
];

export const updateRoles = async (ctx: Koa.Context): Promise<void> => {
    if (ctx.params == null) throw new TypeError();

    const rawToken = ctx.params.token;
    let bulkToken: authApi.BulkAuthToken;
    try {
        bulkToken = <authApi.BulkAuthToken>jwt.verify(rawToken, jwtPublicKey, {
            ignoreExpiration: process.env.NODE_ENV !== "production",
        });
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            ctx.throw(403, "JSON web token is invalid");
        } else if (err instanceof jwt.TokenExpiredError) {
            ctx.throw(403, "JSON web token has expired, generate a new one");
        } else if (err instanceof jwt.NotBeforeError) {
            ctx.throw(403, "JSON web token doesn't exist yet");
        } else throw err;
    }

    if (!schemas.validate("bulkAuthToken", bulkToken)) ctx.throw(400, "Malformed token payload");

    await transaction(User, CoreProtectUser, async (User, CoreProtectUser) => {
        for (const token of bulkToken.players) {
            const coreProtectUser = await CoreProtectUser.query()
                .findOne({ uuid: token.uuid })
                .withGraphFetched("userAccount");

            if (coreProtectUser == null) continue;
            if (coreProtectUser.userAccount == null) coreProtectUser.userAccount = new User();

            coreProtectUser.userAccount.roles = token.groups;

            const user = await CoreProtectUser.query().upsertGraphAndFetch(coreProtectUser, { relate: true });
        }
    });
    userCache.reset();
};

export const login = [
    sessionMiddleware,
    async (ctx: Koa.Context): Promise<void> => {
        if (ctx.params == null) throw new TypeError();

        const rawToken = ctx.params.token;
        let token: authApi.AuthToken;
        try {
            token = <authApi.AuthToken>jwt.verify(rawToken, jwtPublicKey, {
                ignoreExpiration: process.env.NODE_ENV !== "production",
            });
        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                ctx.throw(403, "JSON web token is invalid");
            } else if (err instanceof jwt.TokenExpiredError) {
                ctx.throw(403, "JSON web token has expired, generate a new one");
            } else if (err instanceof jwt.NotBeforeError) {
                ctx.throw(403, "JSON web token doesn't exist yet");
            } else throw err;
        }

        if (!schemas.validate("authToken", token)) ctx.throw(400, "Malformed token payload");

        await transaction(User, CoreProtectUser, async (User, CoreProtectUser) => {
            const coreProtectUser = await CoreProtectUser.query()
                .findOne({ uuid: token.uuid })
                .withGraphFetched("userAccount");

            if (ctx.method === "GET") {
                const $ = cheerio.load(`
                    <!doctype html>
                    <html>
                        <head>
                            <meta charset="utf8">
                            <title>Login</title>
                        </head>
                        <body>
                            <p>Logging in as: <span id="uuid"/></p>
                            <form method="post">
                                <label for="duration-input">How long to stay logged in for?</label>
                                <select id="duration-input" name="duration">
                                    <option value="86400000">1 day</option>
                                    <option value="604800000">1 week</option>
                                    <option value="2592000000" selected>1 month</option>
                                    <option value="31536000000">1 year</option>
                                    <option value="157680000000">5 years</option>
                                </select>
                                <input type="submit" value="Login"/>
                            </form>
                        </body>
                    </html>
                `);

                $("#uuid").text(coreProtectUser.user);

                ctx.body = $.root().html();
            } else if (ctx.method === "POST") {
                let maxSessionAge = 2592000;
                if (ctx.request.body.duration !== null) {
                    maxSessionAge = parseInt(ctx.request.body.duration);
                }

                if (coreProtectUser.userAccount == null) {
                    coreProtectUser.userAccount = new User();
                }

                coreProtectUser.userAccount.roles = token.groups;

                const user = await CoreProtectUser.query().upsertGraphAndFetch(coreProtectUser, { relate: true });

                userCache.del(token.uuid);

                ctx.session!.maxAge = maxSessionAge;
                ctx.session!.uuid = token.uuid;

                await ctx.session!.manuallyCommit();

                ctx.redirect("/");
            }
        });
    },
];

export const logout = [
    sessionMiddleware,
    ...ultravanillaSession(() => true),
    async (ctx: Koa.Context): Promise<void> => {
        if (ctx.coreProtectUser != null) {
            const activeSessionsKey = `activeSessions:${ctx.coreProtectUser.uuid}`;
            const sessions = await redis.smembers(activeSessionsKey);
            await redis.del(sessions);
            await redis.del(activeSessionsKey);
        }

        ctx.session = null;
        ctx.redirect("back", "/");
    },
];

// give the current redis key to the server plugin
export const redisUrl = async (ctx: Koa.Context): Promise<void> => {
    try {
        const token: authApi.RedisUrlToken = <authApi.RedisUrlToken>(
            jwt.verify(ctx.get("x-uvdynmap-token"), jwtPublicKey)
        );
        if (!token.getRedisLink) throw jwt.JsonWebTokenError;

        ctx.body = process.env.REDIS_URL || "redis://localhost";
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            ctx.throw(403, "JSON web token is invalid");
        } else if (err instanceof jwt.TokenExpiredError) {
            ctx.throw(403, "JSON web token has expired, generate a new one");
        } else if (err instanceof jwt.NotBeforeError) {
            ctx.throw(403, "JSON web token doesn't exist yet");
        } else throw err;
    }
};

const userCache: LRUCache<string, CoreProtectUser> = new LRUCache({
    max: 500,
    maxAge: 1000 * 60 * 60,
});

async function getCachedUser(uuid: string): Promise<CoreProtectUser> {
    const cached = userCache.get(uuid);
    if (cached != null) return cached;
    const user = await CoreProtectUser.query().findOne({ uuid }).withGraphFetched("userAccount");
    userCache.set(uuid, user);
    return user;
}

export { isStaff } from "./auth-api";
