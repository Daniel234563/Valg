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
  const kommune = $("#kommune-select").val();
  $.post(`/updateValue/${partiId}`, { kommune: kommune }, function (response) {
    if (response.success) {
      alert("Stemmen din er registrert!");
    } else {
      alert("Noe gikk galt. Vennligst prøv igjen.");
    }
  });
});

$("#kommune-select").change(function () {
  const kommune = $(this).val();
  $.get(`/getVotesByKommune?kommune=${kommune}`, function (data) {
    $("#results").html("<h2>Stemmer per Parti i " + kommune + "</h2>");
    data.forEach(function (parti) {
      $("#results").append("<p>" + parti.PartiNavn + ": " + parti);
    });
  });
});
