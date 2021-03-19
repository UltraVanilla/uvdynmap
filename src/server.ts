import { format } from "util";

import Koa from "koa";
import proxy from "koa-proxies";
import serve from "koa-static";
import mount from "koa-mount";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";

import winston from "winston";
import pkgDir from "pkg-dir";

import { configureSessions } from "./session";
import { tileServer, worldUpdates } from "./tiles-server";

const pkgPath = pkgDir.sync() || process.cwd();

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
    transports: [new winston.transports.Console()],
});

const app = new Koa();

app.use(async (ctx, next) => {
    try {
        await next();
    } finally {
        const logFormat = '%s - - [%s] "%s %s HTTP" %d %s (%s)\n';

        // eslint-disable-next-line unicorn/explicit-length-check
        const length = ctx.length ? ctx.length.toString() : "-";

        process.stdout.write(
            format(
                logFormat,
                ctx.ip,
                new Date().toISOString(),
                ctx.method,
                ctx.path,
                ctx.status,
                length,
                ctx.headers["user-agent"],
            ),
        );
    }
});

const sessionMiddleware = configureSessions(app);

app.use(serve(pkgPath + "/dynmap"));
app.use(mount("/assets", serve(pkgPath + "/assets")));
app.use(mount("/assets", serve(pkgPath + "/vendor")));

// start of our routes middleware

import * as auth from "./auth/";

const router = new Router();

import pageModifier from "./page-modifier";

import staffRouter from "./staff";

router.get("/", pageModifier);

router.get("/tiles/:worldID/:mapID/:region/:coords", tileServer);
router.get("/up/world/:world/:time", worldUpdates);
router.get("/account-info", ...auth.accountInfo);
router.get("/login/:token", ...auth.login);
router.post("/login/:token", bodyParser(), ...auth.login);
router.get("/logout", ...auth.logout);
router.get("/updateroles/:token", auth.updateRoles);
router.get("/redisurl", auth.redisUrl);

router.use(
    "/staff",
    ...auth.ultravanillaSession(auth.isStaff, "Only staff may access this page, run /token to login"),
    staffRouter.routes(),
    staffRouter.allowedMethods(),
);

app.use(router.routes());
app.use(router.allowedMethods());

// end of our routes middleware

app.use(
    proxy("/", {
        target: process.env.DYNMAP_BACKEND || "http://199.127.63.229:8123/",
        changeOrigin: true,
    }),
);

import { dbReady } from "./knex";

dbReady
    .catch((err) => {
        console.error(err);
        logger.log("warn", "Database does not exist or could not migrate!");
    })
    .then(() => {
        const server = app.listen(process.env.PORT || 8080);
        server.keepAliveTimeout = 90 * 1000;
        logger.log("info", "App has started");
    });
