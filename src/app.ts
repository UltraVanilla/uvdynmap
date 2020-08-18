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

app.use(serve(pkgPath + "/dynmap"));
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

        $(`
            <span class='header-info-container'>
                <div class='header-part server-info'>
                    <strong class='server-info-label'>server address: </strong> play.ultravanilla.world</div>
                <div class='header-part server-info server-info-version'>
                    <strong class='server-info-label'>version: </strong> 1.16.1</div>
            </span>
        `).appendTo(newHeader);

        $("<span>")
            .addClass("header-separator")
            .appendTo(newHeader);

        $("<a href='https://discord.gg/kU4dkzk' target='blank' rel='noreferrer'>discord</a>")
            .addClass("header-part server-social server-discord")
            .appendTo(newHeader);

        $("<a href='https://www.reddit.com/r/UltraVanilla/' target='blank' rel='noreferrer'>reddit</a>")
            .addClass("header-part server-social server-reddit")
            .appendTo(newHeader);

        $("<a href='https://uv.miraheze.org/wiki/Main_Page' target='blank' rel='noreferrer'>community wiki</a>")
            .addClass("header-part server-social server-wiki")
            .appendTo(newHeader);

        newContainer.append(newHeader);

        // move the dynmap container element inside our container
        $("body #mcmap").appendTo(newContainer);

        newContainer.appendTo($("body"));

        $(`
            <div class="tools-buttons">
                <button class="tools-button tools-go-to-coordinates">Go to coordinates</button>
                <button class="tools-button tools-nether-portal">Go through nether portal</button>
                <button class="tools-button tools-jump-to-old-spawn">Jump to Old Spawn</button>
                <button class="tools-button tools-jump-to-new-spawn">Jump to Spawn</button>
                <div class="toggles">
                    <div><label for='header-checkbox'>Enable header? </label><input type='checkbox' id='header-checkbox' class='header-checkbox' checked></div>
                    <div><label for='crosshair-checkbox'>Enable crosshair? </label><input type='checkbox' id='crosshair-checkbox' class='crosshair-checkbox'></div>
                </div>
            </div>
        `).appendTo($("body"));

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
