const GetGoogleFonts = require("get-google-fonts");
const fs = require("fs").promises;
const path = require("path");

let waitingFor = [];

fs.stat("vendor").catch(() => {
  return fs.mkdir("vendor");
}).then(() => {
  const ggf = new GetGoogleFonts({
    outputDir: './vendor/',
    verbose: true
  });

  waitingFor.push(ggf.download([
    {
      Rubik: [400, 500]
    }
  ]));

  waitingFor = [ ...waitingFor, [
    "node_modules/jspanel4/dist/jspanel.min.js",
    "node_modules/jspanel4/dist/jspanel.min.css",
  ].map(file => fs.copyFile(file, path.join("vendor", path.basename(file))))];

  return Promise.all(waitingFor)
}).then(() => {
  console.log("Finished preparing vendor assets")
}).catch(() => {
  throw err;
});
