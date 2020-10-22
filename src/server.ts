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
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    ),
    transports: [new winston.transports.Console()],
});

const app = new Koa();

app.use(serve(pkgPath + "/dynmap"));
app.use(mount("/assets", serve(pkgPath + "/assets")));
app.use(mount("/assets", serve(pkgPath + "/vendor")));

// start of our routes middleware

const router = new Router();

import pageModifier from "./page-modifier";
router.get("/", pageModifier);
// TODO: separate this out into staff.ts
router.get("/staff/coreprotect-tools", (ctx) => {
    ctx.body = `
        <!doctype html>
        <html>
            <head>
                <meta charset="utf-8"/>
                <title>Coreprotect log tools</title>
                <link href="/assets/codemirror.css" rel="stylesheet">
                <link href="/assets/ultravanilla.css" rel="stylesheet">
            </head>
            <body>
                <form id="coreprotect-delta" class="coreprotect-delta">
                    <div><label for="coreprotect-delta-options">Coreprotect-delta options:</label></div>
                    <div><textarea id="coreprotect-delta-options"></textarea></div>
                    <div><label for="coreprotect-delta-logs">Coreprotect logs:</label></div>
                    <p>Place <code>[main/INFO]: [CHAT] ------ Current Lag ------</code> to ignore all of the logs above it (i.e. run <code>/lag</code> ingame before paging). Why <code>/lag</code>? I don't know</p>
                    <div><textarea id="coreprotect-delta-logs"></textarea></div>
                    <div><input type="submit" value="Compute delta" id="coreprotect-delta-submit" /></div>
                    <div><label for="coreprotect-delta-output">Results:</label></div>
                    <div><textarea id="coreprotect-delta-output"></textarea></div>
                </form>
                <script type="application/javascript" src="/assets/coreprotect-tools.js"></script>
            </body>
        </html>
    `;
});

app.use(router.routes());
app.use(router.allowedMethods());

// end of our routes middleware

app.use(
    proxy("/", {
        target: process.env.DYNMAP_BACKEND || "http://104.238.205.145:8123/",
        changeOrigin: true,
    }),
);

app.listen(process.env.PORT || 8080);
logger.log("info", "App has started");
