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
$(".partier").click(function () {
  const partiId = $(this).data("id");
  document.getElementById("choose").addEventListener("change", function () {
    const FylkeID = this.options[this.selectedIndex].id;

    console.log("Valgt kommuneID:", FylkeID);
    console.log("Valgt ID:", partiId);
  
    fetch(`/updateValue/${partiId}/${FylkeID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ FylkeID: FylkeID, Id: partiId }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data mottatt:", data);
        lagChart(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });
})
