import { knownIcons } from "./data/data.js";
//per la faq
document.addEventListener("DOMContentLoaded", function () {
  const questions = document.querySelectorAll(".faq-question");
  questions.forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      answer.classList.toggle("open");
    });
  });
});

// cerca una sessione:

document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = document.getElementById("openModalBtn");
  const token = localStorage.getItem("authToken");
  getMostFrequentSubjects();
  if (token) {
    try {
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
        //logica per quando l'utente è loggato
        let welcome = `Sei loggato come: ${data.user.email}`;
        console.log(welcome);

        document.getElementById("user-area").classList.remove("hidden");
        document.getElementById("openModalBtn").classList.add("hidden");
        document.getElementById("userName").innerText =
          data.user.firstName.length > 20
            ? data.user.firstName.substring(0, 20) + "..." //tronca dopo 20 caratteri
            : data.user.firstName;
        console.log(data.user);
        document.getElementById("userProfile").src =
          data.user?.profilePicture || "assets/icons/icone_img.svg";
      } else {
        document.getElementById("user-area").style.display = "none";
      }
    } catch (error) {
      console.log(error);
      document.getElementById("user-area").classList.add("hidden");
      loginButton.style.display = "none";
      console.error("Errore:", error);
    }
  } else {
    document.getElementById("user-area").style.display = "none";
  }
});

async function getMostFrequentSubjects() {
  try {
    const res = await fetch(
      "http://localhost:3000/lessons/getFrequentSubjects",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();
    if (!result.success) throw new Error("Errore nel recupero dei dati");

    const subjectsData = result.data;
    const subjectGrid = document.querySelector(".subject-grid");

    // Pulisce la griglia
    subjectGrid.innerHTML = "";

    Object.keys(subjectsData).forEach((subject) => {
      console.log(subject);
      
      // Crea l'elemento button
      const button = document.createElement("button");
      button.className = "subject-card";

      // Nome del file icona (tutto minuscolo, senza spazi, senza accenti)
      const iconName = subject
        .toLowerCase()
        .normalize("NFD") // rimuove accenti
        .replace(/[^a-z0-9]/g, ""); // rimuove spazi e caratteri speciali

      // Verifica se il file esiste? Se no, fallback. (opzionalmente lato backend o lista whitelist)
      

      const iconFile = knownIcons.includes(iconName)
        ? `${iconName}.svg`
        : "default.svg";

      // Inserisce HTML nel button
      button.innerHTML = `
        <img src="../client/assets/icons/${iconFile}" alt="${subject}" />
        <span>${ subject.toLowerCase() == "cpp" ? "C++" : subject}</span>
      `;

      subjectGrid.appendChild(button);
    });
  } catch (error) {
    console.error(
      "Errore durante il recupero delle materie più popolari:",
      error
    );
  }
}
