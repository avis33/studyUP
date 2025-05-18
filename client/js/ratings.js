import { getAvatarColor,generateStars } from "./utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  const loginButton = document.getElementById("openModalBtn");
  if (!token) {
    document.getElementById("user-area").style.display = "none";
      getTutorOfTheWeek();
      getFilteredTutors()
    return;
  }
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
      //logica per quando l'utente è loggato correttamente
      document.getElementById("user-area").classList.remove("hidden");
      document.getElementById("openModalBtn").classList.add("hidden");
      document.getElementById("userName").innerText =
        data.user.firstName.length > 20
          ? data.user.firstName.substring(0, 20) + "..." //tronca dopo 20 caratteri
          : data.user.firstName;
      document.getElementById("userProfile").src =
        data.user?.profilePicture || "../assets/icons/icone_img.svg";
      getTutorOfTheWeek();
      getFilteredTutors()
    }else{
      localStorage.removeItem("authToken")
      location.reload() 
    }
  } catch (error) {
    document.getElementById("user-area").classList.add("hidden");
    loginButton.style.display = "none";
    console.error("Errore:", error);
  }
});

async function getTutorOfTheWeek() {
    const topTutorsContainer = document.getElementById("top-tutors");
   // Mostra la spinner di caricamento
  topTutorsContainer.innerHTML = `
      <div class="loading-spinner"></div>
  `;

  try {
    const res = await fetch("http://localhost:3000/reviews/tutorOfWeek", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data2 = await res.json();
    const tutors = data2.tutors;
    console.log(tutors);
    topTutorsContainer.innerHTML = tutors
      .slice(0, 10) // Mostra solo i primi 10
      .map((tutor) => {
        const avatar = getAvatarColor(tutor.name);
        const stars = generateStars(tutor.rating);
        const mainSubject = tutor.subjects[0];
        return `
              <div class="tutor-card">
              ${
                tutor.profilePicture
                  ? "<img src=" +
                    tutor.profilePicture +
                    ' class="tutor-avatar">'
                  : '<div class="tutor-avatar" style="background-color:' +
                    avatar.color +
                    '">' +
                    avatar.initials +
                    "</div>"
              }
                <div class="tutor-info">
                  <h3>${tutor.name}</h3>
                  <div class="tutor-meta">
                    
                    ${
                      tutor.subjects[1]
                        ? '<span class="subject-badge">' +
                          mainSubject +
                          ", " +
                          tutor.subjects[1] +
                          "</span>"
                        : '<span class="subject-badge">' +
                          mainSubject +
                          "</span>"
                    }
                    <span class="level-badge">${tutor.level}</span>
                  </div>
                  <div class="tutor-stats">
                    <div class="rating">
                      <div class="stars-cont">${stars}</div>
                      <span>${tutor.rating.toFixed(1)}</span>
                    </div>
                    <div class="lessons">${tutor.lessonsCount} lezioni</div>
                  </div>
                </div>
                <div class="tutor-score">
                  <div class="score-value">${tutor.score}</div>
                  <div class="score-label">Punteggio</div>
                </div>
              </div>
            `;
      })
      .join("");
  } catch (error) {
    console.error("Errore:", error);
  }
}

// Funzione principale che viene chiamata quando cambia la selezione
async function getFilteredTutors() {
  const subjectSelect = document.getElementById('subject-filter');
  const levelSelect = document.getElementById('level-filter');
  const selectedSubject = subjectSelect.value;
  const selectedLevel = levelSelect.value;
  const tutorListContainer = document.getElementById('top-subject-tutors');
  
 // Mostra la spinner di caricmento
  tutorListContainer.innerHTML = `
      <div class="loading-spinner"></div>
  `;

  try {
    // Chiamata al backend con entrambi i filtri
    const res = await fetch(`http://localhost:3000/reviews/tutorBySubject/${selectedSubject}?level=${selectedLevel}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await res.json();
    console.log(data);
    
    const tutors = data.tutors;
    
    // Se ci sono tutor, li mostra
    if (tutors.length > 0) {
      tutorListContainer.innerHTML = tutors
        .slice(0, 10) // Mostra solo i primi 10
        .map((tutor) => {
          const avatar = getAvatarColor(tutor.name);
          const stars = generateStars(tutor.rating);
          const mainSubject = selectedSubject;
          
          return `
            <div class="tutor-card">
              ${
                tutor.profilePicture
                  ? '<img src="' + tutor.profilePicture + '" class="tutor-avatar" alt="' + tutor.name + '">'
                  : '<div class="tutor-avatar" style="background-color:' + avatar.color + '">' + avatar.initials + '</div>'
              }
              <div class="tutor-info">
                <h3>${tutor.name}</h3>
                <div class="tutor-meta">
                  <span class="subject-badge">${mainSubject}</span>
                  <span class="level-badge">${tutor.level}</span>
                </div>
                <div class="tutor-stats">
                  <div class="rating">
                    <div class="stars-cont">${stars}</div>
                    <span>${tutor.rating.toFixed(1)}</span>
                  </div>
                  <div class="lessons">${tutor.lessonsCount} lezioni</div>
                </div>
              </div>
              <div class="tutor-score">
                <div class="score-value">${tutor.score}</div>
                <div class="score-label">Punteggio</div>
              </div>
            </div>
          `;
        })
        .join("");
    } else {
      tutorListContainer.innerHTML = '<div class="no-results">Nessun tutor trovato con questi filtri</div>';
    }
  } catch (error) {
    console.error('Errore nel caricamento dei tutor:', error);
    tutorListContainer.innerHTML = '<div class="error">Errore nel caricamento dei tutor</div>';
  }
}

// Aggiungi gli event listener a entrambi i select
document.getElementById('subject-filter').addEventListener('change', getFilteredTutors);
document.getElementById('level-filter').addEventListener('change', getFilteredTutors);
