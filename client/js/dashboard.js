let currentUser
function renderStars(rating) {
  const fullStar = "★";
  const emptyStar = "☆";
  return fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
}
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("authToken");
    const loginButton = document.getElementById("openModalBtn");
  
    if (!token) {
      document.getElementById("user-area").style.display = "none";
      window.location.href = "/client/index.html"; // Se non sono loggato mi porta alla pagina principale
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
          if(data.user.role == "student"){
            document.getElementById("dashboard").innerText = "I miei tutor"
            // SEI UNO STUDENTE
            document.getElementById("student-dashboard").classList.remove("hidden");
          }else{
            document.getElementById("dashboard").innerText = "I miei studenti"
            // SEI UN TUTOR
            document.getElementById("tutor-dashboard").classList.remove("hidden");  
          }
          currentUser = data.user;
          fetchLessonsByRole(data.user);
      }
    } catch (error) {
      document.getElementById("user-area").classList.add("hidden");
      loginButton.style.display = "none";
      console.error("Errore:", error);
    }
 
  });


  async function fetchLessonsByRole(user) {
    const endpoint = user.role === "student"
      ? `http://localhost:3000/lessons/student/${user.id}`
      : `http://localhost:3000/lessons/tutor/${user.id}`;  
    try {
      const res = await fetch(endpoint,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const lessons = await res.json();
  
      let lezioniAccettate = [];
      let lezioniPending = [];
      let lezioniRecensite = [];
      
      if (user.role === "student") {
        lezioniAccettate = lessons.filter(lez => lez.status === "accepted");
        lezioniPending = lessons.filter(lez => lez.status === "pending" || lez.status === "cancelled");
        lezioniRecensite = lessons.filter(lez => lez.status === "reviewed");
      } else {
        lezioniAccettate = lessons.filter(lez => lez.status === "accepted");
        lezioniPending = lessons.filter(lez => lez.status === "pending");
        lezioniRecensite = lessons.filter(lez => lez.status === "reviewed");
      }
      
  
      console.log("Accettate:", lezioniAccettate);
      console.log("Pending o cancellate:", lezioniPending);
      console.log("Già recensite:", lezioniRecensite);
  
      renderLessons(lezioniAccettate, lezioniPending, user.role, lezioniRecensite);

  
    } catch (err) {
      console.error("Errore nel recupero delle lezioni:", err);
    }
  }
  function renderLessons(lezioniAccettate, lezioniPending, role, lezioniRecensite = []) {
    const acceptedContainer = role === "student" 
      ? document.getElementById("student-confirmed-lessons") 
      : document.getElementById("tutor-confirmed-lessons");
    const studentReviewContainer = role === "student" 
      ? document.getElementById("student-review-container") 
      : null;
  
    const studentPendingContainer = document.getElementById("student-pending-lessons");
    const tutorPendingContainer = role === "tutor" 
      ? document.getElementById("tutor-pending-lessons") 
      : null;
    const reviewPendingContainer = role === "tutor" 
      ? document.getElementById("tutor-reviews-container") 
      : null;
  
    // Svuotiamo i contenitori
    acceptedContainer.innerHTML = "";
    studentPendingContainer.innerHTML = "";
    if (role === "tutor" && tutorPendingContainer) tutorPendingContainer.innerHTML = "";
  
    // Icone
    const icons = {
      online: "💻",
      inPerson: "📍",
      price: "💶",
      time: "🕒",
      pending: "⏳",
      cancelled: "❌"
    };
  
    // Richieste pendenti per tutor
    if (role === "tutor" && tutorPendingContainer) {
      lezioniPending.forEach(lez => {
        const lessonCard = document.createElement("div");
        lessonCard.classList.add("lesson-card");
        lessonCard.innerHTML = `
          <p><strong>${lez.student.nome} ${lez.student.cognome}</strong> – ${lez.subject}</p>
          <p>${icons.time} ${new Date(lez.date).toLocaleDateString('it-IT', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short',
          })} – ${lez.mode === "online" ? `${icons.online} Online` : `${icons.inPerson} In presenza`} – ${icons.price} ${lez.price}€</p>
          <p class="message">"${lez.message}"</p>
          <p><small>${lez.student.email}</small></p>
          <div class="actions">
            <button class="btn-accept" onclick="acceptLesson('${lez._id}')">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              Accetta
            </button>
            <button class="btn-decline" onclick="rejectLesson('${lez._id}')">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              Rifiuta
            </button>
          </div>
        `;
        tutorPendingContainer.appendChild(lessonCard);
      });
    }
    // Recensioni per tutor
    if (role === "tutor" && reviewPendingContainer) {
      lezioniRecensite.forEach(lez => {
        const { subject, date, mode, price, student, review } = lez;
    
        const lessonCard = document.createElement("div");
        lessonCard.classList.add("lesson-card-reviewed");
    
        const formattedDate = new Date(date).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
    
        lessonCard.innerHTML = `
          <h3>${subject} (${mode === "inPresenza" ? icons.inPerson + " In presenza" : icons.online + " Online"})</h3>
          <p><strong>${icons.time} Data:</strong> ${formattedDate}</p>
          <p><strong>${icons.price} Prezzo:</strong> €${price}</p>
          <p><strong>Studente:</strong> ${student.nome} ${student.cognome} (${student.email})</p>
          <div class="review">
            <h4>Recensione</h4>
            <p><strong>Commento:</strong> ${review.comment}</p>
            <ul class="ratings">
              <li><strong>Puntualità:</strong> <span class="stars">${renderStars(review.ratings.puntualita)}</span></li>
              <li><strong>Chiarezza:</strong> <span class="stars">${renderStars(review.ratings.chiarezza)}</span></li>
              <li><strong>Competenza:</strong> <span class="stars">${renderStars(review.ratings.competenza)}</span></li>
              <li><strong>Empatia:</strong> <span class="stars">${renderStars(review.ratings.empatia)}</span></li>
            </ul>
            <p class="review-date"><em>Inviata il ${new Date(review.createdAt).toLocaleDateString("it-IT")}</em></p>
          </div>
        `;
    
        reviewPendingContainer.appendChild(lessonCard);
      });
    }
    
  
    // Lezioni accettate
    lezioniAccettate.forEach(lez => {
      const lessonCard = document.createElement("div");
      lessonCard.classList.add("lesson-card");
      lessonCard.innerHTML = `
        <p><strong>${role === "student" ? `${lez.tutor.nome} ${lez.tutor.cognome}` : `${lez.student.nome} ${lez.student.cognome}`}</strong> – ${lez.subject}</p>
        <p>${icons.time} ${new Date(lez.date).toLocaleDateString('it-IT', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short',
        })} – ${lez.mode === "online" ? `${icons.online} Online` : `${icons.inPerson} In presenza`} – ${icons.price} ${lez.price}€</p>
        ${role === "student" && new Date(lez.date) <= new Date() ? `
  <div class="actions">
    <button class="btn-review" onclick="openReviewModal('${lez._id}', '${lez.tutor._id}', '${currentUser.id}')">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z">
        </path>
      </svg>
      Recensisci
    </button>
  </div>
` : ''}

      `;
      acceptedContainer.appendChild(lessonCard);
    });
  
   // Richieste pendenti per studente & recensioni
if (role === "student") {
  // Inserisci lezioni pending
  lezioniPending.forEach(lez => {
    const lessonCard = document.createElement("div");
    lessonCard.classList.add("lesson-card");

    let statusHTML = "";
    if (lez.status === "pending") {
      statusHTML = `
        <p class="status-pending">
          ${icons.pending} In attesa di conferma
        </p>
        <button class="cancel-request-btn" data-id="${lez._id}">
           Annulla richiesta
        </button>
      `;
    } else {
      statusHTML = `
        <p class="status-cancelled">
          ${icons.cancelled} Cancellata
        </p>
      `;
    }

    lessonCard.innerHTML = `
      <p><strong>${lez.tutor.nome} ${lez.tutor.cognome}</strong> – ${lez.subject}</p>
      <p>${icons.time} ${new Date(lez.date).toLocaleDateString('it-IT', { 
        weekday: 'short', 
        day: 'numeric',   
        month: 'short',
      })} – ${lez.mode === "online" ? `${icons.online} Online` : `${icons.inPerson} In presenza`} – ${icons.price} ${lez.price}€</p>
      ${statusHTML}
    `;
    studentPendingContainer.appendChild(lessonCard);
  });
// Inserisci recensioni dello studentE
lezioniRecensite.forEach(lez => {
  const lessonCard = document.createElement("div");
  lessonCard.classList.add("lesson-card-student-reviewed");
  const { subject, date, mode, price, tutor, review } = lez;
  const { puntualita, chiarezza, competenza, empatia } = review.ratings;

  const formattedDate = new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  lessonCard.innerHTML = `
    <h3>${subject}</h3>
    <p>${icons[mode] || ""} ${mode === "inPresenza" ? "In presenza" : "Online"}</p>
    <p>${icons.time} ${formattedDate}</p>
    <p>${icons.price} ${price} €</p>
    <p><strong>Tutor:</strong> ${tutor.nome} ${tutor.cognome}</p>
    <p><strong>Commento:</strong>${lez.review.comment}</p>

    <div class="stars-group">
      <p>Puntualità: <span class="stars">${renderStars(puntualita)}</span></p>
      <p>Chiarezza: <span class="stars">${renderStars(chiarezza)}</span></p>
      <p>Competenza: <span class="stars">${renderStars(competenza)}</span></p>
      <p>Empatia: <span class="stars">${renderStars(empatia)}</span></p>
    </div>
  `;

  studentReviewContainer.appendChild(lessonCard);
});
}
}
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("cancel-request-btn")) {
    const lessonId = e.target.dataset.id;

    // Conferma utente
    if (!confirm("Sei sicuro di voler annullare questa richiesta?")) return;
    try {
    // Chiamata al backend per eliminare la richiesta
    const res = await fetch(`http://localhost:3000/lessons/cancel/${lessonId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) throw new Error("Errore nella cancellazione.");
      // Rimuovi la card dal DOM
      e.target.closest(".lesson-card").remove();  
    } catch (error) {
      alert("Errore: impossibile annullare la richiesta.");
      console.error(error);
    }
  }
});

// Gestione menu laterale studente per la dashboard degli studenti
document.querySelectorAll('.student-nav button').forEach(button => {
  button.addEventListener('click', () => {
    // Rimuovi classe active da tutti i pulsanti e sezioni
    document.querySelectorAll('.student-nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.student-content-section').forEach(section => section.classList.remove('active'));
    
    // Aggiungi classe active al pulsante cliccato
    button.classList.add('active');
    
    // Mostra la sezione corrispondente
    const sectionId = button.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');
  });
});
// Gestione menu laterale tutor per la dashboard degli tutor
document.querySelectorAll('.tutor-nav button').forEach(button => {
  button.addEventListener('click', () => {
    // Rimuovi classe active da tutti i pulsanti e sezioni
    document.querySelectorAll('.tutor-nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tutor-content-section').forEach(section => section.classList.remove('active'));
    
    // Aggiungi classe active al pulsante cliccato
    button.classList.add('active');
    
    // Mostra la sezione corrispondente
    const sectionId = button.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');
  });
});

  async function acceptLesson(lessonId) {
    try {
      const res = await fetch(`http://localhost:3000/lessons/accept/${lessonId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();
      if (result.success) {
        alert("Lezione accettata!");
        // Ricarica la dashboard per aggiornare le lezioni
        fetchLessonsByRole(currentUser);
      } else {
        alert("Errore nell'accettare la lezione.");
      }
    } catch (err) {
      console.error("Errore nell'accettare la lezione:", err);
    }
  }
  
  async function rejectLesson(lessonId) {
    try {
      const res = await fetch(`http://localhost:3000/lessons/reject/${lessonId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();
      if (result.success) {
        alert("Lezione rifiutata!");
        // Ricarica la dashboard per aggiornare le lezioni
        fetchLessonsByRole(currentUser);
      } else {
        alert("Errore nel rifiutare la lezione.");
      }
    } catch (err) {
      console.error("Errore nel rifiutare la lezione:", err);
    }
  }
  
// Apri finestra modale per lasciare una recensione
function openReviewModal(lessonId, tutorId, studentId) {
  const modal = document.getElementById("review-modal");
  modal.style.display = "block";

  // Salva gli ID nei data-* per usarli al submit
  modal.dataset.lessonId = lessonId;
  modal.dataset.tutorId = tutorId;
  modal.dataset.studentId = studentId;

  // Reset del form
  document.getElementById("review-text").value = "";
}
// funzione per chiuder il modale
function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
}


// FUNZIONE PER MANDARE RICHIESTA DI RECENSIONE AL SERVER
async function submitReview() {
  const modal = document.getElementById('review-modal');
  const lessonId = modal.dataset.lessonId;
  const tutorId = modal.dataset.tutorId;
  const studentId = modal.dataset.studentId;

  const reviewText = document.getElementById('review-text').value.trim();
  const ratingPuntualita = document.getElementById('rating-puntualita').value;
  const ratingChiarezza = document.getElementById('rating-chiarezza').value;
  const ratingCompetenza = document.getElementById('rating-competenza').value;
  const ratingEmpatia = document.getElementById('rating-empatia').value;

  // Validazione semplice
  if (!reviewText || !ratingPuntualita || !ratingChiarezza || !ratingCompetenza || !ratingEmpatia) {
    alert('Per favore compila tutti i campi prima di inviare la recensione.');
    return;
  }

  const reviewData = {
    lessonId: lessonId,
    tutorId: tutorId,
    studentId: studentId,
    comment: reviewText,
    ratings: {
      puntualita: parseInt(ratingPuntualita),
      chiarezza: parseInt(ratingChiarezza),
      competenza: parseInt(ratingCompetenza),
      empatia: parseInt(ratingEmpatia),
    }
  };

  try {
    const response = await fetch(`http://localhost:3000/reviews/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      throw new Error('Errore durante l\'invio della recensione');
    }

    alert('Recensione inviata con successo!');
    closeReviewModal();
  } catch (error) {
    console.error(error);
    alert('Si è verificato un errore. Riprova più tardi.');
  }
}

