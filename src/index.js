const gridDivs = document.querySelectorAll(".grid div");
gridDivs.forEach(function (div) {
  div.addEventListener("click", async function () {
    let text;

    if (confirm("Er du sikker?") == true) {
      const partiId = div.getAttribute("dbid");
      localStorage.setItem("parti", partiId);
      window.location.href = "/auth";
    }
  });
});
