document.getElementById("choose").addEventListener("change", function () {
  const KommuneID = this.options[this.selectedIndex].id;
  console.log("Valgt kommuneID:", KommuneID);

  fetch("/ValgtKommune", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ KommuneID: KommuneID }),
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
let myChart = null; // Lagrer referansen til det eksisterende diagrammet

function lagChart(data) {
  const formattedData = [
    { parti: "Rødt", count: data[0].AntallStemmer },
    { parti: "Arbeiderpartiet", count: data[1].AntallStemmer },
    { parti: "Høyre", count: data[2].AntallStemmer },
    { parti: "Fremskrittspartiet", count: data[3].AntallStemmer },
    { parti: "Venstre", count: data[4].AntallStemmer },
    { parti: "KRF", count: data[5].AntallStemmer },
    { parti: "MDG", count: data[6].AntallStemmer },
    { parti: "Senterpartiet", count: data[7].AntallStemmer },
    { parti: "SV", count: data[8].AntallStemmer },
  ];

  console.log("Formatted data:", formattedData);

  // Sjekker om det eksisterende diagrammet må ødelegges
  if (myChart) {
    myChart.destroy();
  }

  // Opprett et nytt diagram
  myChart = new Chart(document.getElementById("myChart"), {
    type: "bar",
    options: {
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
    data: {
      labels: formattedData.map((row) => row.parti),
      datasets: [
        {
          label: "Valgresultater",
          data: formattedData.map((row) => row.count),
          barPercentage: 0.5,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
  });
}
