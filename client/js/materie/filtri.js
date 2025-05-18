import { regioniCittà } from "../data/data.js";
import { renderTutors,allTutors } from "./materie.js";
/*===================================================SET UP DEI FILTRI (REGIONE, CITTA, MODALITA)==========================================================================*/
const modalitaSelect = document.getElementById("modalitaSelect");
const regioneSelect = document.getElementById("regioneSelect");
const cittàSelect = document.getElementById("cittàSelect");

for (let regione in regioniCittà) {
  const option = document.createElement("option");
  option.value = regione;
  option.textContent = regione;
  regioneSelect.appendChild(option);
}
/*===================================================EVENT LISTENER FILTRI==========================================================================*/
// EVENT LISTENER MODALITà :
modalitaSelect.addEventListener("change", () => {
  const value = modalitaSelect.value;
  const showLocation = value === "presenza" || value === "entrambe";
  regioneSelect.classList.toggle("hidden", !showLocation); //se showLocation=true-->!showLocation=false e allora toglie la classe hidden se no la mette
  cittàSelect.classList.toggle("hidden", !showLocation);
});
// EVENT LISTENER REGIONE :
regioneSelect.addEventListener("change", () => {
  const selected = regioneSelect.value;
  cittàSelect.innerHTML = "<option value=''>Seleziona città</option>";
  if (regioniCittà[selected]) {
    regioniCittà[selected].forEach((città) => {
      const opt = document.createElement("option");
      opt.value = città;
      opt.textContent = città;
      cittàSelect.appendChild(opt);
    });
  }
});


// FILTRI
const materiaInput = document.getElementById("materiaInput");
const livelloSelect = document.getElementById("livelloSelect");
const prezzoSelect = document.getElementById("prezzoSelect");
const ratingSelect = document.getElementById("ratingSelect");

// Aggiungiamo gli event listener
materiaInput.addEventListener("input", filtraTutor);
livelloSelect.addEventListener("change", filtraTutor);
prezzoSelect.addEventListener("change", filtraTutor);
modalitaSelect.addEventListener("change", filtraTutor);
regioneSelect.addEventListener("change", filtraTutor);
cittàSelect.addEventListener("change", filtraTutor);
ratingSelect.addEventListener("change", filtraTutor);

function filtraTutor() {
  const materia = document.getElementById("materiaInput").value.toLowerCase();
  const livello = document.getElementById("livelloSelect").value;
  const prezzo = document.getElementById("prezzoSelect").value;
  const modalità = document.getElementById("modalitaSelect").value;
  const regione = document.getElementById("regioneSelect").value;
  const città = document.getElementById("cittàSelect").value;
  const rating = document.getElementById("ratingSelect").value;

  const tutorFiltrati = allTutors.filter((tutor) => {
    const materiaMatch =
      materia === "" ||
      tutor.taughtSubjects.some((s) => s.toLowerCase().includes(materia));
    const livelloMatch = livello === "" || tutor.level === livello;
    const modalitàMatch =
      modalità === "" || tutor.mode === modalità || tutor.mode === "entrambe";

    let prezzoMatch = true;
    if (prezzo === "0-15") prezzoMatch = tutor.rate <= 15;
    else if (prezzo === "15-30")
      prezzoMatch = tutor.rate > 15 && tutor.rate <= 30;
    else if (prezzo === "30+") prezzoMatch = tutor.rate > 30;

    const cittàMatch =
      modalità === "presenza" || modalità === "entrambe"
        ? (!regione || tutor.region === regione) &&
          (!città || tutor.city === città)
        : true;
    const ratingMatch = rating === "" || tutor.rating >= parseFloat(rating);
    return (
      materiaMatch &&
      livelloMatch &&
      modalitàMatch &&
      prezzoMatch &&
      cittàMatch &&
      ratingMatch
    );
  });

  renderTutors(tutorFiltrati);
}