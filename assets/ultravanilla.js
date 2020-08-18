function loadJsPanel() {

}

window.addEventListener("load", function() {
  const headerCheckbox = document.getElementById("header-checkbox");
  const header = document.getElementsByClassName("header")[0];
  console.log(headerCheckbox)

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

  setTimeout(() => {
    const pinnedObserver = new MutationObserver((mutationsList, observer) => {
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
  }, 1000);
});

