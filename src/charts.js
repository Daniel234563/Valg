fetch("/getparti")
  .then((response) => response.json())
  .then((data) => {
    lagChart(data);
  });

const data = [];
function lagChart(data) {
  data = [
    { parti: "rødt", count: data[0].stemmer },
    { parti: "sv", count: data[1].stemmer },
    { parti: "ap", count: data[2].stemmer },
    { parti: "sp", count: data[3].stemmer },
    { parti: "mdg", count: data[4].stemmer },
    { parti: "krf", count: data[5].stemmer },
    { parti: "venstre", count: data[6].stemmer },
    { parti: "høyre", count: data[7].stemmer },
    { parti: "frp", count: data[8].stemmer },
  ];

  console.log(data);
  new Chart(document.getElementById("myChart"), {
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
      labels: data.map((row) => row.parti),
      datasets: [
        {
          label: "Valgresultater",
          data: data.map((row) => row.count),
          barPercentage: 0.5,
        },
      ],
    },
  });
}
