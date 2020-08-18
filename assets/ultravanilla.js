
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

  document.getElementsByClassName("tools-jump-to-old-spawn")[0].addEventListener("click", () => {
    dynmap.panToLocation({
      world: dynmap.world,
      x: -144, y: 64, z: 241
    });
  });

  document.getElementsByClassName("tools-jump-to-new-spawn")[0].addEventListener("click", () => {
    dynmap.panToLocation({
      world: dynmap.world,
      x: -2002400, y: 64, z: -1995513
    });
  });
});

