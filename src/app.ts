import Koa from "koa";
import proxy from "koa-proxies";
import serve from "koa-static";
import mount from "koa-mount";

import winston from "winston";
import fetch from "node-fetch";
import cheerio from "cheerio";
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

// TODO: remove this
app.use(require("koa-basic-auth")({
    realm: "experimental ultravanilla thing, please enter password",
    name: "doofus",
    pass: "c41e3c629b83",
}));

app.use(mount("/assets", serve(pkgPath + "/assets")));
app.use(mount("/assets", serve(pkgPath + "/vendor")));

app.use(async (ctx, next) => {
    if (ctx.path === "/") {
        const res = await fetch(process.env.DYNMAP_BACKEND || "http://104.238.205.145:8123/");
        const body = await res.text();

        // we use cheerio to modify the page in-transit
        const $ = cheerio.load(body);

        const newContainer = $("<div class=box>");

        const newHeader = $("<div>")
            .addClass("header");

        $("<div>")
            .text("UltraVanilla")
            .addClass("header-part uv-logo-name")
            .appendTo(newHeader);

        $("<img>")
            .attr("src", "assets/416.png")
            .addClass("header-part uv-logo")
            .appendTo(newHeader);

        $("<div><strong>server address:</strong> play.ultravanilla.world</div>")
            .addClass("header-part server-info")
            .appendTo(newHeader);

        $("<div><strong>version:</strong> 1.16.1</div>")
            .addClass("header-part server-info")
            .appendTo(newHeader);

        $("<a href='https://discord.gg/kU4dkzk'>discord")
            .addClass("header-part server-social server-discord")
            .appendTo(newHeader);

        $("<a href='https://www.reddit.com/r/UltraVanilla/'>reddit")
            .addClass("header-part server-social server-reddit")
            .appendTo(newHeader);

        $("<a href='https://ultravanilla.wiki'>community wiki")
            .addClass("header-part server-social server-wiki")
            .appendTo(newHeader);

        newContainer.append(newHeader);

        // move the dynmap container element inside our container
        $("body #mcmap").appendTo(newContainer);

        newContainer.appendTo($("body"));

        $("<div><label for='header-checkbox'>Enable header? </label><input type='checkbox' id='header-checkbox' checked></div>")
            .addClass("header-checkbox")
            .appendTo($("body"));

        $("<link>")
            .attr("href", "assets/fonts.css")
            .attr("rel", "stylesheet")
            .appendTo($("head"));

        $("<link>")
            .attr("href", "assets/ultravanilla.css")
            .attr("rel", "stylesheet")
            .appendTo($("head"));

        $("<script>")
            .attr("type", "application/javascript")
            .attr("src", "assets/ultravanilla.js")
            .appendTo($("head"));

        ctx.body = $.root().html();
    } else {
        await next();
    }
});

app.use(proxy("/", {
    target: process.env.DYNMAP_BACKEND || "http://104.238.205.145:8123/",
    changeOrigin: true,
}));

app.listen(process.env.PORT || 8080)
logger.log("info", "App has started");
