// Selettori
const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.querySelector(".close");

// Mostra la modale
openBtn.onclick = function () {
  modal.style.display = "flex";
};

// Chiudi cliccando sulla X
closeBtn.onclick = function () {
  modal.style.display = "none";
};

// Chiudi cliccando fuori dalla modale
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
