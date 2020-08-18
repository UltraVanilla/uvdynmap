window.addEventListener("load", function() {
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

  function loadJsPanel() {

  }

  loadAnimationController.load("firstupdate");
  $(dynmap).one("worldupdating", async () => {
    loadAnimationController.finish("firstupdate");
    await loadUltraVanilla();
  });

  $(dynmap).bind("load-from-center", () => {
    loadAnimationController.load("tiles");
  });
  $(dynmap).bind("tile-queue-loaded", () => {
    loadAnimationController.finish("tiles");
  });
});


async function loadUltraVanilla() {
  const headerCheckbox = document.getElementById("header-checkbox");
  const header = document.getElementsByClassName("header")[0];

  if (localStorage.enableHeader != null) {
    headerCheckbox.checked = localStorage.enableHeader === 'true';
    update();
  }

  headerCheckbox.addEventListener("input", () => {
    localStorage.enableHeader = headerCheckbox.checked;
    update();
  });

  function update() {
    if (headerCheckbox.checked) {
      header.classList.remove("header-disabled");
    } else {
      header.classList.add("header-disabled");
    }
  }

  $('.tools-jump-to-old-spawn').click(() => {
    dynmap.panToLocation({
      world: dynmap.world,
      x: -144, y: 64, z: 241
    });
  });

  $('.tools-jump-to-new-spawn').click(() => {
    dynmap.panToLocation({
      world: dynmap.world,
      x: -2002400, y: 64, z: -1995513
    });
  });

  {
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
