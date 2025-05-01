
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
          if(data.user.role == "student"){
            document.getElementById("dashboard").innerText = "I miei tutor"
            // SEI UNO STUDENTE
            document.getElementById("student-dashboard").classList.remove("hidden");
          }else{
            document.getElementById("dashboard").innerText = "I miei studenti"
            // SEI UN TUTOR
            document.getElementById("tutor-dashboard").classList.remove("hidden");  
          }
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
  
      if (user.role === "student") {
        lezioniAccettate = lessons.filter(lez => lez.status === "accepted");
        lezioniPending = lessons.filter(lez => lez.status === "pending" || lez.status === "cancelled");
      } else {
        lezioniAccettate = lessons.filter(lez => lez.status === "accepted");
        lezioniPending = lessons.filter(lez => lez.status === "pending");
      }
  
      console.log("Accettate:", lezioniAccettate);
      console.log("Pending o cancellate:", lezioniPending);
  
      renderLessons(lezioniAccettate, lezioniPending, user.role);
  
    } catch (err) {
      console.error("Errore nel recupero delle lezioni:", err);
    }
  }
  
  function renderLessons(lezioniAccettate, lezioniPending, role) {
    const acceptedContainer = role === "student" 
      ? document.getElementById("student-confirmed-lessons") 
      : document.getElementById("tutor-confirmed-lessons");
  
    const studentPendingContainer = document.getElementById("student-pending-lessons") 
      
  
    const tutorPendingContainer = role === "tutor" 
      ? document.getElementById("tutor-requests") 
      : null;
  
      
    // Svuotiamo i contenitori prima di aggiungere i nuovi elementi
    acceptedContainer.innerHTML = "";
    studentPendingContainer.innerHTML = "";
  
    if (role === "tutor" && tutorPendingContainer) {
      tutorPendingContainer.innerHTML = ""; // Svuotiamo il contenitore delle richieste per il tutor  
      // Aggiungiamo le richieste pendenti (per i tutor)
      lezioniPending.forEach(lez => {
        const lessonCard = document.createElement("div");
        lessonCard.classList.add("lesson-card");
        const lessonDetails = `
          <p><strong>${lez.student.nome} ${lez.student.cognome}</strong> – ${lez.subject}</p>
          <p>🕒 ${new Date(lez.date).toLocaleDateString()} – ${lez.mode === "online" ? "💻 Online" : "📍 In presenza"} – 💶 ${lez.price}€</p>
          <p>'${lez.message}'</p>
          <i>${lez.student.email}</i>
          <button class="accept-btn" onclick="acceptLesson('${lez._id}')">Accetta</button>
          <button class="reject-btn" onclick="rejectLesson('${lez._id}')">Rifiuta</button>
        `;
        lessonCard.innerHTML = lessonDetails;
        tutorPendingContainer.appendChild(lessonCard);
      });
    }
  
    // Aggiungiamo le lezioni accettate per entrambi (studenti e tutor)
    lezioniAccettate.forEach(lez => {
      const lessonCard = document.createElement("div");
      lessonCard.classList.add("lesson-card");
  
      const lessonDetails = `
        <p><strong>${lez.tutor.nome} ${lez.tutor.cognome}</strong> – ${lez.subject}</p>
        <p>🕒 ${new Date(lez.date).toLocaleDateString()} – ${lez.mode === "online" ? "💻 Online" : "📍 In presenza"} – 💶 ${lez.price}€</p>
      `;
  
      lessonCard.innerHTML = lessonDetails;
      acceptedContainer.appendChild(lessonCard);
    });
  
    // Aggiungiamo le lezioni pending per studenti (richieste inviate)
    if (role === "student") {
      lezioniPending.forEach(lez => {
        const lessonCard = document.createElement("div");
        lessonCard.classList.add("lesson-card");
  
        const lessonDetails = `
          <p><strong>${lez.tutor.nome} ${lez.tutor.cognome}</strong> – ${lez.subject}</p>
          <p>🕒 ${new Date(lez.date).toLocaleDateString()} – ${lez.mode === "online" ? "💻 Online" : "📍 In presenza"} – 💶 ${lez.price}€</p>
          <p>Stato: ${lez.status === "pending" ? "In attesa" : "Cancellata"}</p>
        `;
  
        lessonCard.innerHTML = lessonDetails;
        studentPendingContainer.appendChild(lessonCard);
      });
    }
  }
  
/*
  async function acceptLesson(lessonId) {
    try {
      const res = await fetch(`http://localhost:3000/lessons/accept/${lessonId}`, {
        method: "PUT",
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
        method: "PUT",
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
  */