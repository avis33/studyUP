import { getTodayDate } from "../utils/utils.js";
import { utenteLoggato, isTutor, studentId } from "./materie.js";
export function contactForm(tutorCard, tutor){
     // MODAL WINDOW DEL CONTACT
    const contactButton = tutorCard.querySelector(".contact-btn");
    const selectContatta = document.getElementById("contattaMaterie");

    contactButton.addEventListener("click", () => {
      if (!utenteLoggato) {
        // Mostra il modal di login
        document.getElementById("modal").style.display = "flex";
        return; // Non aprire il modal di contatto
      }
      if (isTutor) {
        // mostra una schermata
        alert("Per contattare un tutor è necessario essere uno studente!");
        return;
      }
      document.getElementById("contattaModal").style.display = "flex";
      selectContatta.innerHTML = "";
      // Imposta data del form a oggi
      const dateInput = document.getElementById("data");
      if (dateInput) {
        dateInput.min = getTodayDate();
        dateInput.value = getTodayDate();
      }
      tutor.taughtSubjects.forEach((materia) => {
        const option = document.createElement("option");
        option.value = materia;
        option.textContent = materia;
        selectContatta.appendChild(option);
      });
      document.getElementById("tutorIdInput").value = tutor._id; //Imposta l'id del tutor nell'input hidden
      document.getElementById("tutorModeInput").value = tutor.mode;
      document.getElementById("tutorPriceInput").value = tutor.rate;

      const divModalita = document.getElementById("sceltaModalita");
      divModalita.innerHTML = "";
      if (tutor.mode == "entrambe") {
        const selectModalita = document.createElement("select");
        const optionPresenza = document.createElement("option");
        const optionOnline = document.createElement("option");
        const labelModalita = document.createElement("label");

        labelModalita.setAttribute("for", "selectModalita"); // collega la label a un input con id="selectModalita"
        labelModalita.textContent = "Seleziona modalità:";
        optionPresenza.value = "inPresenza";
        optionPresenza.textContent = "In presenza";
        optionOnline.value = "online";
        optionOnline.textContent = "Online";
        selectModalita.appendChild(optionOnline);
        selectModalita.appendChild(optionPresenza);
        divModalita.appendChild(labelModalita);
        divModalita.appendChild(selectModalita);
      }
    });
}
// SUBMIT LISTENER DEL CONTACT FORM
export async function contactFormListener(e){
    e.preventDefault();
    const materia = document.getElementById("contattaMaterie").value;
    const data = document.getElementById("data").value;
    const note = document.getElementById("note").value.trim();
    const modalitaSelect = document.querySelector("#sceltaModalita select");
    const tutorMode = document.getElementById("tutorModeInput").value;
    const modalita = modalitaSelect ? modalitaSelect.value : tutorMode;
    const tutorId = document.getElementById("tutorIdInput").value;
    const tutorRate = document.getElementById("tutorPriceInput").value;

    const inputDate = new Date(data);
    // Data di oggi (mezzanotte UTC)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      alert("Data della lezione invalida");
      return;
    }

    // Validazione
    if (!materia || !data || !modalita) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }

    if (note.length > 500) {
      alert("La nota è troppo lunga. Massimo 500 caratteri.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/lessons/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId: tutorId,
          studentId: studentId,
          subject: materia,
          date: data,
          mode: modalita,
          message: note,
          price: tutorRate,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Richiesta inviata con successo!");
        document.getElementById("contattaModal").style.display = "none";
      } else {
        alert(result.message || "Errore durante l'invio della richiesta.");
      }
    } catch (err) {
      console.error("Errore nella richiesta:", err);
      alert("Si è verificato un errore imprevisto.");
    }
  }

// CHIUSURA MODAL DI CONTATTA
document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("contattaModal").style.display = "none";
});

window.onclick = function (event) {
  if (event.target === document.getElementById("contattaModal")) {
    document.getElementById("contattaModal").style.display = "none";
  }
};
