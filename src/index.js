const gridDivs = document.querySelectorAll(".grid div");
gridDivs.forEach(function (div) {
  div.addEventListener("click", async function () {
    let text;

    if (confirm("Er du sikker?") == true) {
      // Hent id-verdien fra bildets id-attributt
      window.location.href = "/auth";
      localStorage.setItem("parti", div.getAttribute("dbid"));
    } else {
      console.log("det virker ikke");
    }
  });
});
