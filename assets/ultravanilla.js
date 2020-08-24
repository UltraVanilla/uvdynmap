window.addEventListener("load", function() {
  // a way to handle multiple things loading to indicate it with only one spinner
  const loadAnimationController = {
    thingsLoading: new Set,
    load(thing) {
      this.thingsLoading.add(thing);
      this.logo.setAttribute("src", "assets/load.gif");
    },
    finish(thing) {
      this.thingsLoading.delete(thing)
      if (this.thingsLoading.size === 0) {
        this.logo.setAttribute("src", this.originalSrc);
      }
    },
    logo: document.getElementsByClassName("uv-logo")[0],
    originalSrc: document.getElementsByClassName("uv-logo")[0].getAttribute("src")
  };

  // jspanel is quite big, so only load when needed
  async function loadJsPanel() {
    if (window.jsPanel != null) return Promise.resolve(window.jsPanel);
    loadAnimationController.load("jspanel");

    await Promise.all([
      new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.onload = resolve;
        script.src = "assets/jspanel.min.js";
        document.head.appendChild(script);
      }),
      new Promise((resolve, reject) => {
        $("<link rel='stylesheet' type='text/css' href='assets/jspanel.min.css'>")
          .on("load", resolve)
          .on("error", reject)
          .appendTo($("head"));
      })
    ]);

    jsPanel.defaults.theme = "dark";

    loadAnimationController.finish("jspanel");

    return window.jsPanel;
  }

  loadAnimationController.load("firstupdate");
  $(dynmap).one("worldupdating", () => {
    loadAnimationController.finish("firstupdate");
    // once dynmap starts, we can start our extensions
    loadUltraVanilla();
  });

  $(dynmap).bind("load-from-center", () => {
    loadAnimationController.load("tiles");
  });
  $(dynmap).bind("tile-queue-loaded", () => {
    loadAnimationController.finish("tiles");
  });

  async function loadUltraVanilla() {
    const header = document.getElementsByClassName("header")[0];

    // inject crosshairs
    $(`
      <div class="xcrosshair crosshair"></div>
      <div class="ycrosshair crosshair"></div>
    `).appendTo($(".dynmap"));

    // set up toggle checkboxes
    {
      const headerCheckbox = $(".header-checkbox");
      const crosshairCheckbox = $(".crosshair-checkbox");

      if (localStorage.enableHeader == null) {
        localStorage.enableHeader = true;
      }

      if (localStorage.enableCrosshair == null) {
        localStorage.enableCrosshair = false;
      }
      headerCheckbox.prop("checked", localStorage.enableHeader === 'true');
      crosshairCheckbox.prop("checked", localStorage.enableCrosshair === 'true');

      updateHeader();
      updateCrosshair();

      headerCheckbox.change(() => {
        localStorage.enableHeader = headerCheckbox.prop("checked");
        updateHeader();
      });

      crosshairCheckbox.change(() => {
        localStorage.enableCrosshair = crosshairCheckbox.prop("checked");
        updateCrosshair();
      });

      function updateHeader() {
        if (headerCheckbox.prop("checked")) {
          header.classList.remove("header-disabled");
        } else {
          header.classList.add("header-disabled");
        }
      }
      function updateCrosshair() {
        if (crosshairCheckbox.prop("checked")) {
          $(".dynmap .crosshair").show();
        } else {
          $(".dynmap .crosshair").hide();
        }
      }

    }


    // settings panel
    {
      let panel;

      $(".tools-settings").hover(() => {
        loadJsPanel();
      }).click(async () => {
        const jsPanel = await loadJsPanel();

        if (panel != null) {
          panel.normalize();
          panel.front();
          return;
        }

        const contents = $(`
          <div>
            <h3>Configure UI</h3>
            <div class="settings-list-of-elements" />
          </div>
        `);

        // generate a toggle checkbox for each thing that can be disabled
        $("[data-toggle]").each((_, elem) => {
          const name = $(elem).data("toggle");
          let enabled = localStorage[`elementEnabled.${name}`] !== "false";

          const checkbox = $(`
            <div>
              <input type="checkbox" id="element-toggle-checkbox-${name}" class="element-toggle-checkbox">
              <label for="element-toggle-checkbox-${name}">Show this thing?</label>
              <div class="element-toggle-preview" />
            </div>
          `);

          // show a non-interactive copy of the element
          const previewElem = $(elem)
            .clone()
            .show()
            .css("float", "none")
            .css("position", "static")
            .css("pointerEvents", "none")
            .removeAttr("data-toggle");

          previewElem.find("*").unbind("click");

          checkbox.find(".element-toggle-preview").append(previewElem);

          const checkboxInput = checkbox.find("input");
          checkboxInput.prop("checked", enabled);

          checkboxInput.change(() => {
            enabled = checkboxInput.prop("checked");
            localStorage[`elementEnabled.${name}`] = enabled;
            if (enabled) {
              $(elem).show();
            } else {
              $(elem).hide();
            }
          });

          contents.find(".settings-list-of-elements").append(checkbox);
        });

        panel = jsPanel.create({
          content: contents[0],
          headerTitle: "Settings",
          position: "center",
          panelSize: "340 95%",
          onclosed() {
            panel = undefined;
          }
        });
      });
    }

    function getCenterCoords() {
      return dynmap.maptype.getProjection().fromLatLngToLocation(map.getBounds().getCenter(), 64)
    }

    let coords = getCenterCoords();

    // display crosshair location and distance from mouse, and logic for copying coordinates
    {
      $(".coord-control-label").text("Mouse Location:");
      $(".coord-control").attr("data-toggle", "mouse-location");

      const centerCoords = $(`
        <div class="coord-control coord-control-center leaflet-control" data-toggle="center-coords">
          <span class="coord-control-label">Crosshair Location: </span><br><span class="coord-control-value">---,---,---</span>
          <div>Click to copy to clipboard</div>
        </div>
      `);
      const distanceIndicator = $(`
        <div class="coord-control leaflet-control" data-toggle="distance-indicator">
          <span class="coord-control-label">Distance: </span><br><span class="coord-control-value">---</span>
        </div>
      `);

      distanceIndicator.appendTo($(".leaflet-top.leaflet-left"));
      centerCoords.appendTo($(".leaflet-top.leaflet-left"));

      const distanceValue = distanceIndicator.find(".coord-control-value");
      const centerCoordsValue = centerCoords.find(".coord-control-value");

      function updateCoords() {
        coords = getCenterCoords();
        coords.x = Math.round(coords.x);
        coords.z = Math.round(coords.z);

        const distance = Math.floor(Math.sqrt());

        centerCoordsValue
          .text(`${coords.x},${coords.y},${coords.z}`)

        // attempt to guess the world from the string
        if (dynmap.world.name === "world") coords.world = "overworld";
        if (dynmap.world.name === "world_the_end") coords.world = "the end";
        if (dynmap.world.name === "world_nether") coords.world = "the nether";
      }

      updateCoords();
      map.on("move", updateCoords);
      map.on("mousemove", event => {
        const mouse = dynmap.getProjection().fromLatLngToLocation(event.latlng, 64);
        // calculate distance
        distanceValue
          .text(`${Math.floor(Math.sqrt(
            (coords.x - mouse.x)**2
            + (coords.z - mouse.z)**2))}`)
      });

      // coordinates copying
      centerCoords.hover(() => {
        loadJsPanel();
      }).click(async () => {
        const jsPanel = await loadJsPanel();

        const panel = getPanel();
        panel.normalize();
        panel.front();

        $(panel.content).find(`#copy-coordinates0`)
          .val(`${coords.x}, ${coords.z} in ${coords.world}`);

        $(panel.content).find(`#copy-coordinates1`)
          .val(`x${coords.x}/y${coords.y}/z${coords.z}`);

        $(panel.content).find(`#copy-coordinates2`)
          .val(`/tp ${coords.x} ${coords.y} ${coords.z}`);

        $(panel.content).find(`#copy-coordinates3`)
          .val(`${coords.x} ${coords.y} ${coords.z}`);

        $(panel.content).find(`#copy-coordinates4`)
          .val(`${coords.x},${coords.y},${coords.z}`);

        // automatically copy to clipboard
        $(panel.content).find(`#copy-coordinates${localStorage.copyPreference}`)
          .select();

        document.execCommand("copy");
      });

      let panel;

      function getPanel() {
        if (panel != null) return panel;
        const contents = $(`
          <div class="copy-coordinates-window">
            <table>
              <tr>
                <td><label for="copy-coordinates0">Human</label></td>
                <td><input type="text" id="copy-coordinates0" class="copy-coordinates"></td>
                <td><button data-option="0">Set as default</button></td>
              </tr>
              <tr>
                <td><label for="copy-coordinates1">Human2</label>
                <td><input type="text" id="copy-coordinates1" class="copy-coordinates"></td>
                <td><button data-option="1">Set as default</button></td>
              </tr>
              <tr>
                <td><label for="copy-coordinates2">Teleport</label></td>
                <td><input type="text" id="copy-coordinates2" class="copy-coordinates"></td>
                <td><button data-option="2">Set as default</button></td>
              </tr>
              <tr>
                <td><label for="copy-coordinates3">Spaces</label></td>
                <td><input type="text" id="copy-coordinates3" class="copy-coordinates"></td>
                <td><button data-option="3">Set as default</button></td>
              </tr>
              <tr>
                <td><label for="copy-coordinates4">Commas</label></td>
                <td><input type="text" id="copy-coordinates4" class="copy-coordinates"></td>
                <td><button data-option="4">Set as default</button></td>
              </tr>
            </table>
          </div>
        `);

        if (localStorage.copyPreference == null) localStorage.copyPreference = "0";

        // save format preference
        contents.find("button").show().click(evt => {
          contents.find("button").show();
          const copyPreference = $(evt.currentTarget).attr("data-option");
          localStorage.copyPreference = copyPreference
          contents.find(`button[data-option=${localStorage.copyPreference}]`).hide();
        });
        contents.find(`button[data-option=${localStorage.copyPreference}]`).hide();

        panel = jsPanel.create({
          content: contents[0],
          headerTitle: "Copy Coordinates",
          resizeit: false,
          position: "left-bottom",
          contentSize: "440 205",
          headerControls: {
            maximize: "remove"
          },
          onclosed() {
            panel = null;
          }
        })

        return panel;
      }
    }

    // a simple command to go to the same coordinates in the nether/end
    $(".tools-nether-portal").click(() => {
      const coords = getCenterCoords();

      if (dynmap.world.name === "world_nether") {
        coords.world = dynmap.worlds.world;
        coords.x *= 8;
        coords.z *= 8;
      } else {
        coords.world = dynmap.worlds.world_nether;
        coords.x /= 8;
        coords.z /= 8;
      }

      dynmap.panToLocation(coords);
    });

    $(".tools-jump-to-old-spawn").click(() => {
      dynmap.panToLocation({
        world: dynmap.worlds.world,
        x: -1334, y: 64, z: -29
      });
    });

    $(".tools-jump-to-new-spawn").click(() => {
      dynmap.panToLocation({
        world: dynmap.worlds.world,
        x: -2002407, y: 64, z: -1995441
      });
    });

    $(".tools-go-to-coordinates").hover(() => {
      loadJsPanel();
    }).click(async () => {
      const jsPanel = await loadJsPanel();

      const contents = $(`
        <form>
          <div>
            <label for="input-coordinates">Coordinate string:</label>
            <input type="text" id="input-coordinates" class="input-coordinates">
          </div>
          <div>
            <label for="input-coordinates-format">Format: </label>
            <select id="input-coordinates-format" class="input-coordinates-format">
              <option value="xyz" selected>XYZ (Press F3+C ingame)</option>
              <option value="xzy">XZ (VoxelMap)</option>
            </select>
            <div>
              <label for="input-coordinates-world">World: </label>
              <select id="input-coordinates-world" class="input-coordinates-world">
                <option value="world">Overworld</option>
                <option value="world_nether">Nether</option>
                <option value="world_the_end">End</option>
              </select>
            </div>
          </div>
          <div>
            <div><label for="input-coordinates-x">X:</label>
            <input type="number" id="input-coordinates-x" class="input-coordinates-x" step="any"></div>
            <div><label for="input-coordinates-z">Z:</label>
            <input type="number" id="input-coordinates-z" class="input-coordinates-z" step="any"></div>
          </div>
          <div>
            <input type="submit" class="input-coordinates-go" value="Goto Location"/>
            <input type="submit" class="input-coordinates-ok" value="Goto Location and Dismiss"/>
          </div>
        </form>
      `)

      // avoid form submission to webserver
      contents.submit(event => {
        event.preventDefault();
        return false;
      });

      const inputStringCoordinates = contents.find(".input-coordinates");
      const inputFormat = contents.find(".input-coordinates-format");

      const inputX = contents.find(".input-coordinates-x");
      const inputZ = contents.find(".input-coordinates-z");

      const inputWorld = contents.find(".input-coordinates-world");

      // default to currently selected world
      inputWorld.val(dynmap.world.name);

      // grab format preference from localStorage
      if (localStorage.formatPreference != null) {
        inputFormat.val(localStorage.formatPreference);
      }

      // write format preference to localStorage
      inputFormat.change(() => {
        localStorage.formatPreference = inputFormat.val();
      });

      inputStringCoordinates.change(() => {
        const str = inputStringCoordinates.val();

        try {
          if (inputFormat.val() === "xyz") {
            const matches = str.match(/[^\d\.\-]*([\d\.\-]+)[^\d\-\.]+([\d\.\-]+)[^\d\-\.]+([\d\.\-]+)/)
            inputX.val(matches[1])
            inputZ.val(matches[3])
          } else {
            const matches = str.match(/[^\d\.\-]*([\d\.\-]+)[^\d\-\.]+([\d\.\-]+)/)
            inputX.val(matches[1])
            inputZ.val(matches[2])
          }
        } catch(e) {
          return;
        }

        if (str.includes("nether")) inputWorld.val("world_nether");
        if (str.includes("the end")) inputWorld.val("world_the_end");
        if (str.includes("overworld")) inputWorld.val("world");
      });

      const coords = { world: dynmap.world, x: 0, y: 64, z: 0 };

      contents.find(".input-coordinates-go").click(() => {
        coords.world = dynmap.worlds[inputWorld.val()];
        coords.x = parseFloat(inputX.val());
        coords.z = parseFloat(inputZ.val());
        dynmap.panToLocation(coords);
      });

      contents.find(".input-coordinates-ok").click(() => {
        coords.world = dynmap.worlds[inputWorld.val()];
        coords.x = parseFloat(inputX.val());
        coords.z = parseFloat(inputZ.val());
        dynmap.panToLocation(coords);
        panel.close();
      });

      const panel = jsPanel.create({
        content: contents[0],
        headerTitle: "Go To Coordinates",
        resizeit: false,
        position: "center-bottom",
        contentSize: "380 210",
        headerControls: {
          maximize: "remove"
        }
      });

      inputStringCoordinates.focus();
    });

    {
      // store the state of sidebar pinning
      const pinnedObserver = new MutationObserver((mutationsList) => {
        mutationsList.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            const isPinned = mutation.target.classList.contains("pinned");

            if (isPinned) {
              $(".tools-buttons").addClass("sidebar-pinned");
            } else {
              $(".tools-buttons").removeClass("sidebar-pinned");
            }
            localStorage.pinSidebar = isPinned;
          }
        });
      });

      pinnedObserver.observe($(".dynmap .sidebar")[0], { attributes: true });

      if (localStorage.pinSidebar === "true") $(".dynmap .sidebar").addClass("pinned");
    }
  }

  {
    const pageObserver = new MutationObserver(mutationsList => {

      Object.entries(localStorage).forEach(([key, value]) => {
        const crumbs = key.split(".");
        if (crumbs[0] === "elementEnabled") {
          const name = crumbs[1];

          if (value === "false") {
            $(`[data-toggle='${name}']`).hide();
          }
        };
      });
    })

    pageObserver.observe($("body")[0], { subtree: true, childList: true });
  }
});
