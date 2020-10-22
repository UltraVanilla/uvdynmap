const GetGoogleFonts = require("get-google-fonts");
const fs = require("fs");
const path = require("path");
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);
const fetch = require("node-fetch");

process.on("unhandledRejection", function (err) {
    console.error(err);
    process.exit(1);
});

(async () => {
    try {
        await fs.promises.stat("vendor");
    } catch (err) {
        await fs.promises.mkdir("vendor");
    }

    const ggf = new GetGoogleFonts({
        outputDir: "./vendor/",
        verbose: true,
    });

    await Promise.all([
        // download google fonts
        ggf.download([
            {
                Rubik: [400, 500],
            },
        ]),

        // copy jspanel to `vendor`
        fs.promises.copyFile("node_modules/jspanel4/dist/jspanel.min.css", "vendor/jspanel.min.css"),

        // get windows XP wallpaper
        (async () => {
            const res = await fetch("https://i.imgur.com/uGRFZEs.jpg");
            if (res.ok) {
                return streamPipeline(res.body, fs.createWriteStream("./vendor/windows-xp.jpg"));
            } else {
                throw new Error(`Could not download assets: ${res.statusText}`);
            }
        })(),
    ]);

    console.log("Finished preparing vendor assets");
})();
