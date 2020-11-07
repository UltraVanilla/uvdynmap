import Koa from "koa";
import proxy from "koa-proxies";
import serve from "koa-static";
import mount from "koa-mount";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";

import winston from "winston";
import pkgDir from "pkg-dir";

import { configureSessions } from "./session";

const pkgPath = pkgDir.sync() || process.cwd();

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
    transports: [new winston.transports.Console()],
});

const app = new Koa();

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

router.get("/account-info", ...auth.accountInfo);
router.get("/login/:token", ...auth.login);
router.post("/login/:token", bodyParser(), ...auth.login);
router.get("/logout", ...auth.logout);
router.get("/updateroles/:token", auth.updateRoles);

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
        target: process.env.DYNMAP_BACKEND || "http://104.238.205.145:8123/",
        changeOrigin: true,
    }),
);

import { dbReady } from "./knex";

dbReady.then(() => {
    app.listen(process.env.PORT || 8080);
    logger.log("info", "App has started");
});
