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
});

