import { generateStars } from "../utils/utils.js";
import { contactFormListener, contactForm } from "./contactForm.js";
export let allTutors = []; // contiene tutti i tutor ricevuti dal backend, cosi che evitiamo di chiamare il server ogni volta che chiamiamo un filtro
export let utenteLoggato = false;
export let isTutor = false;
export let studentId;
let preferredSubjects;

const tutorListDiv = document.getElementById("tutorListContainer");

/*===============================================EVENT LISTENER CARICAMENTO PAGINA==========================================================================*/
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  const loginButton = document.getElementById("openModalBtn");
  tutorListDiv.innerHTML = `
      <div class="loading-spinner"></div>
  `;
  try {
    if (!token) {
      document.getElementById("user-area").style.display = "none";
      const resInfo = await fetch(`http://localhost:3000/user/fetchTutor/0`, {
        // se non siamo loggati prendiamo tutti i tutor dal backend e li mostriamo
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await resInfo.json();
      preferredSubjects = null;
      console.log(result);
      allTutors = result.tutors;
      renderTutors(result.tutors);
      return;
    }
    // chiamata a server per verificare se esiste il token
    const res = await fetch("http://localhost:3000/user/profilo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // il middleware sul server prende il token da qua
      },
    });
    const data = await res.json();
    if (data.hasAccess) {
      utenteLoggato = true;
      //logica per quando l'utente è loggato correttamente
      document.getElementById("user-area").classList.remove("hidden");
      document.getElementById("openModalBtn").classList.add("hidden");
      document.getElementById("userName").innerText =
        data.user.firstName.length > 20
          ? data.user.firstName.substring(0, 20) + "..." //tronca dopo 20 caratteri
          : data.user.firstName;
      document.getElementById("userProfile").src =
        data.user?.profilePicture || "../assets/icons/icone_img.svg";
      if (data.user.role == "student") {
        isTutor = false;
        studentId = data.user.id;
      } else {
        isTutor = true;
      }
      const resInfo = await fetch(
        `http://localhost:3000/user/fetchTutor/${data.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await resInfo.json();
      preferredSubjects = result.preferredSubjects;
      console.log(result);
      allTutors = result.tutors;
      renderTutors(result.tutors);
    } else {
      // Il token è invalido o scaduto, lo togliamo dal local storage
      localStorage.removeItem("authToken");
      location.reload();
    }
  } catch (error) {
    document.getElementById("user-area").classList.add("hidden");
    loginButton.style.display = "none";
    console.error("Errore:", error);
  }
});

// Funzione per renderizzare i tutor sulla pagina
export function renderTutors(tutors) {
  console.log(tutors);
  tutorListDiv.innerHTML = ""; // svuota prima
  if (tutors.length === 0) {
    tutorListDiv.innerHTML = "<p>Nessun tutor trovato.</p>";
    return;
  }
  // Ordina i tutor: prima quelli con materie preferite
  const sortedTutors = [...tutors].sort((a, b) => {
    if (!preferredSubjects || preferredSubjects.length === 0) return 0;

    const aMatches = a.taughtSubjects.filter((subj) =>
      preferredSubjects.includes(subj)
    ).length;
    const bMatches = b.taughtSubjects.filter((subj) =>
      preferredSubjects.includes(subj)
    ).length;
    return bMatches - aMatches; // Ordine decrescente
  });

  sortedTutors.forEach((tutor) => {
    const hasPreferredSubjects =
      preferredSubjects &&
      preferredSubjects.length > 0 &&
      tutor.taughtSubjects.some((subj) => preferredSubjects.includes(subj));

    const tutorCard = document.createElement("div");
    tutorCard.classList.add("tutor-card");
    tutorCard.setAttribute("data-aos", "fade-up");
    if (hasPreferredSubjects) {
      tutorCard.classList.add("preferred-tutor");
    }

    tutorCard.innerHTML = `
  <div class="tutor-card-header">
      ${
        hasPreferredSubjects
          ? '<div class="recommended-badge">Consigliato</div>'
          : ""
      }
      <img src='${
        tutor.profilePicture
          ? tutor.profilePicture
          : "../assets/icons/icone_img.svg"
      }' 
           alt="Foto profilo di ${tutor.firstName}">
  </div>
  <div class="tutor-info">
      <div class="tutor-header">
          <h2>${tutor.firstName} ${tutor.lastName}</h2>
          <p class="rate">€${tutor.rate}/h</p>
      </div>
      <div class="tutor-rating">
          <span class="stars">${generateStars(tutor.rating || 0)} ${
      tutor.rating > 0 ? Math.round(tutor.rating * 10) / 10 : ""
    }</span>
          <span class="review-count">(${tutor.reviewCount || 0})</span>
      </div>
      <p class="subjects">
          ${tutor.taughtSubjects
            .map((subj) =>
              preferredSubjects && preferredSubjects.includes(subj)
                ? `<strong class="preferred-subject">${subj}</strong>`
                : subj
            )
            .join(", ")}
      </p>
      <div class="details">
          <span><strong>Livello:</strong> ${tutor.level.toUpperCase()}</span>
          <span><strong>Modalità:</strong> ${tutor.mode}</span>
      </div>
      <p class="bio">${tutor.bio}</p>
      <button class="contact-btn">Contatta</button>
  </div>
`;
    tutorListDiv.appendChild(tutorCard);

    contactForm(tutorCard, tutor)
  });

  // SUBMIT DEL CONTACT FORM
  const inviaRichiestaBtn = document.getElementById("inviaRichiestaBtn");
  inviaRichiestaBtn.addEventListener("click", contactFormListener);
}
