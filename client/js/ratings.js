function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  let html = "";
  for (let i = 0; i < fullStars; i++) {
    html += `<span class="star full">&#9733;</span>`;
  }
  if (halfStar) {
    html += `<span class="star half">&#9733;</span>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    html += `<span class="star empty">&#9733;</span>`;
  }
  return html;
}
// Funzione per generare avatar colorati basati sulle iniziali
function getAvatarColor(name) {
  const colors = [
    "#4361ee",
    "#3f37c9",
    "#4895ef",
    "#4cc9f0",
    "#4895ef",
    "#3a0ca3",
    "#7209b7",
    "#b5179e",
    "#f72585",
    "#560bad",
    "#480ca8",
    "#3a0ca3",
  ];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colorIndex = initials.charCodeAt(0) % colors.length;
  return {
    initials: initials.substring(0, 2),
    color: colors[colorIndex],
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  const loginButton = document.getElementById("openModalBtn");

  if (!token) {
    document.getElementById("user-area").style.display = "none";
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
      if (data.user.role == "student") {
        document.getElementById("dashboard").innerText = "I miei tutor";
      } else {
        document.getElementById("dashboard").innerText = "I miei studenti";
      }
      getTutorOfTheWeek();
      getTutorsBySubject()
    }
  } catch (error) {
    document.getElementById("user-area").classList.add("hidden");
    loginButton.style.display = "none";
    console.error("Errore:", error);
  }
});

async function getTutorOfTheWeek() {
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

    const topTutorsContainer = document.getElementById("top-tutors");

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


// Funzione principale che viene chiamata quando cambia la materia selezionata
async function getTutorsBySubject() {
  const subjectSelect = document.getElementById('subject-filter');
  const selectedSubject = subjectSelect.value;
  const tutorListContainer = document.querySelector('#subject-filter').closest('.ranking-section').querySelector('.tutor-list');
  
  // Mostra uno stato di caricamento
  tutorListContainer.innerHTML = '<div class="loading">Caricamento tutor...</div>';
  try {
    const res = await fetch(`http://localhost:3000/reviews/tutorBySubject/${selectedSubject}`, {
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
      const tutorListContainer = document.getElementById("top-subject-tutors")
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
      tutorListContainer.innerHTML = '<div class="no-results">Nessun tutor trovato per questa materia</div>';
    }
  } catch (error) {
    console.error('Errore nel caricamento dei tutor:', error);
    tutorListContainer.innerHTML = '<div class="error">Errore nel caricamento dei tutor</div>';
  }
}
// Aggiungi l'event listener al select
document.getElementById('subject-filter').addEventListener('change', getTutorsBySubject);
