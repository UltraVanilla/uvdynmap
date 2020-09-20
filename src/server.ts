import Koa from "koa";
import proxy from "koa-proxies";
import serve from "koa-static";
import mount from "koa-mount";
import Router from "koa-router";

import winston from "winston";
import pkgDir from "pkg-dir";

const pkgPath = pkgDir.sync() || process.cwd();

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
    transports: [
        new winston.transports.Console(),
    ]
});

const app = new Koa;

app.use(serve(pkgPath + "/dynmap"));
app.use(mount("/assets", serve(pkgPath + "/assets")));
app.use(mount("/assets", serve(pkgPath + "/vendor")));

// start of our routes middleware

const router = new Router();

import pageModifier from "./page-modifier";
router.get("/", pageModifier);

app.use(router.routes());
app.use(router.allowedMethods());

// end of our routes middleware

app.use(proxy("/", {
    target: process.env.DYNMAP_BACKEND || "http://104.238.205.145:8123/",
    changeOrigin: true,
}));

app.listen(process.env.PORT || 8080)
logger.log("info", "App has started");
