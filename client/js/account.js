document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  const loginButton = document.getElementById("openModalBtn");

  if (!token) {
    window.location.href = "index.html";
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
      console.log("UTENTE LOGGATO",data);
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
        }else{
          document.getElementById("dashboard").innerText = "I miei studenti"
        }
      const resInfo = await fetch(
        `http://localhost:3000/user/getUserInfo/${data.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const userInfo = await resInfo.json();
      if (!userInfo.error) {
        const user = userInfo.user;
        console.log("USER:", user);

        // Popola i campi base
        document.getElementById("userId").value = user._id;
        document.getElementById("emailUpdate").value = user.email;
        document.getElementById("firstName").value = user.firstName || "";
        document.getElementById("lastName").value = user.lastName || "";
        document.getElementById("birthDate").value = user.birthDate
          ? user.birthDate.substring(0, 10)
          : "";
        document.getElementById("ruolo").value = user.role || "";

        // Gestione dinamica dei campi in base al ruolo
        const extraFieldsContainer = document.getElementById("extraFields");
        extraFieldsContainer.innerHTML = ""; // Reset

        if (user.role == "tutor") { 
          extraFieldsContainer.innerHTML = `
          
                 <div class="form-group">
              <label for="taughtSubjects">📗 Materie che vuoi insegnare</label>
              <div class="subject-input-wrapper">
                <input type="text" id="taughtSubjects" placeholder="Inizia a digitare una materia..." >
                <div id="taughtSuggestions" class="suggestions-list"></div>
                <div id="selectedTaughtSubjects" class="chips-container"></div>
              </div>
                <div class="form-group">
                 <label for="rate">Prezzo orario (€)</label>
              <input 
                type="number" 
                id="rate" 
                name="rate" 
                placeholder="25.00"
                step="0.1"  
                inputmode="decimal" 
                value="${user.rate || ""}"
              >
              <div class="error-message" id="rateError"></div>
                </div>
                <div class="form-group">
                 <label for="bio">Breve descrizione</label>
              <textarea id="bio" name="bio" rows="4" placeholder="Scrivi qualcosa su di te...">${
                user.bio || ""
              }</textarea>
              <div class="error-message" id="bioError"></div>

                </div>
              `;
                 // Inserisci chip iniziali se ci sono
                 const selectedTaughtSubjectsDiv =
                 document.getElementById("selectedTaughtSubjects");
     
                 user.taughtSubjects.forEach((subject) => {
                 if (subject.trim()) {
                   const chip = document.createElement("div");
                   chip.classList.add("chip");
                   chip.dataset.subject = subject.trim();
                   chip.innerHTML = `${subject.trim()} <span class="remove-chip">&times;</span>`;
                   // ➕ Aggiungi questo blocco per far funzionare la rimozione
   chip.querySelector(".remove-chip").addEventListener("click", () => {
     chip.remove();
   });
   selectedTaughtSubjectsDiv.appendChild(chip);
                 }
               });
               const allSubjects = [
                 "Matematica", "Fisica", "Chimica", "Biologia", "Inglese", "Francese", "Cinese", "Storia",
                 "Filosofia", "Geografia", "Italiano", "Economia", "Latino", "Greco", "Python", "Java", "C++",
                 "Javascript", "SQL", "Statistica", "Robotica", "Design"
               ];
               
               const input = document.getElementById("taughtSubjects");
               const suggestions = document.getElementById("taughtSuggestions");
               
               input.addEventListener("input", () => {
                 const value = input.value.toLowerCase();
                 suggestions.innerHTML = "";
                 if (!value) {
                   suggestions.style.display = "none";
                   return;
                 }
                 const filtered = allSubjects.filter(s => s.toLowerCase().includes(value));
                 filtered.forEach(s => {
                   const div = document.createElement("div");
                   div.textContent = s;
                   div.addEventListener("click", () => {
                     addSubjectChip(s);
                     input.value = "";
                     suggestions.style.display = "none";
                   });
                   suggestions.appendChild(div);
                 });
                 suggestions.style.display = filtered.length ? "block" : "none";
               });
               
               function addSubjectChip(subject) {
                 if ([...selectedTaughtSubjectsDiv.children].some(chip => chip.dataset.subject === subject)) return;
               
                 const chip = document.createElement("div");
                 chip.className = "chip";
                 chip.dataset.subject = subject;
                 chip.innerHTML = `${subject} <span>&times;</span>`;
               
                 chip.querySelector("span").addEventListener("click", () => chip.remove());
                 selectedTaughtSubjectsDiv.appendChild(chip);
                 
               }
       
        } else if (user.role == "student") {
          extraFieldsContainer.innerHTML = `
          <div class="form-group">
            <label for="materieDaRecuperare">📘 Materie da recuperare</label>
            <div class="subject-input-wrapper">
              <input type="text" id="materieDaRecuperare" placeholder="Inizia a digitare una materia...">
              <div id="subjectSuggestions" class="suggestions-list"></div>
              <div id="selectedSubjects" class="chips-container"></div>
            </div>
          </div>
          <input type="hidden" name="materieSelezionate" id="materieSelezionate">
        `;
                  // Inserisci chip iniziali se ci sono
                  const selectedSubjectsDiv =
                  document.getElementById("selectedSubjects");
      
                  user.preferredSubjects.forEach((subject) => {
                  if (subject.trim()) {
                    const chip = document.createElement("div");
                    chip.classList.add("chip");
                    chip.dataset.subject = subject.trim();
                    chip.innerHTML = `${subject.trim()} <span class="remove-chip">&times;</span>`;
                    // ➕ Aggiungi questo blocco per far funzionare la rimozione
    chip.querySelector(".remove-chip").addEventListener("click", () => {
      chip.remove();
    });
                    selectedSubjectsDiv.appendChild(chip);
                  }
                });
                const allSubjects = [
                  "Matematica", "Fisica", "Chimica", "Biologia", "Inglese", "Francese", "Cinese", "Storia",
                  "Filosofia", "Geografia", "Italiano", "Economia", "Latino", "Greco", "Python", "Java", "C++",
                  "Javascript", "SQL", "Statistica", "Robotica", "Design"
                ];
                
                const input = document.getElementById("materieDaRecuperare");
                const suggestions = document.getElementById("subjectSuggestions");
                
                input.addEventListener("input", () => {
                  const value = input.value.toLowerCase();
                  suggestions.innerHTML = "";
                  if (!value) {
                    suggestions.style.display = "none";
                    return;
                  }
                  const filtered = allSubjects.filter(s => s.toLowerCase().includes(value));
                  filtered.forEach(s => {
                    const div = document.createElement("div");
                    div.textContent = s;
                    div.addEventListener("click", () => {
                      addSubjectChip(s);
                      input.value = "";
                      suggestions.style.display = "none";
                    });
                    suggestions.appendChild(div);
                  });
                  suggestions.style.display = filtered.length ? "block" : "none";
                });
                
                function addSubjectChip(subject) {
                  if ([...selectedSubjectsDiv.children].some(chip => chip.dataset.subject === subject)) return;
                
                  const chip = document.createElement("div");
                  chip.className = "chip";
                  chip.dataset.subject = subject;
                  chip.innerHTML = `${subject} <span>&times;</span>`;
                
                  chip.querySelector("span").addEventListener("click", () => chip.remove());
                  selectedSubjectsDiv.appendChild(chip);
                }
        }
      }
    } else {
      window.location.href = "index.html";
    }
  } catch (error) {
    console.log(error);
    document.getElementById("user-area").classList.add("hidden");
    loginButton.style.display = "none";
    console.error("Errore:", error);
  }
});
// Mostra errore sotto l'input
function showError(inputId, message) {
  const errorElement = document.getElementById(`${inputId}Error`); //nel codice register.html ci sono le classi con id ad esempio 'emailError'
  errorElement.textContent = message;
  errorElement.classList.add("show");
  // aggiungi classe error all'input che ha dato errore cosi da avere contorno rosso su css
  const inputField = document.getElementById(inputId);
  if (inputField) inputField.classList.add("error");
}
document
  .getElementById("profileForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = this;

    // Pulisci gli errori precedenti
    document
      .querySelectorAll(".error-message")
      .forEach((el) => el.classList.remove("show"));
    document
      .querySelectorAll(".error")
      .forEach((el) => el.classList.remove("error"));

    // Raccogli dati dal form
    const userId = document.getElementById("userId").value;
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("emailUpdate").value.trim();
    const birthDate = document.getElementById("birthDate").value;

    // Campi extra dinamici (tutor o student)
    let preferredSubjects = null, taughtSubjects = null;
    if(document.getElementById("selectedSubjects")){
      preferredSubjects = [...document.getElementById("selectedSubjects").children].map(chip => chip.dataset.subject);        
    }else{
      taughtSubjects = [...document.getElementById("selectedTaughtSubjects").children].map(chip => chip.dataset.subject);  
    }
    
    
    const rate = document.getElementById("rate")
      ? parseFloat(document.getElementById("rate").value)
      : null;
    const bio = document.getElementById("bio")?.value.trim() || null;
    const role = rate !== null ? "tutor" : "student";

    // Immagine del profilo
    const profilePictureInput = document.getElementById("profileImage");
    const file = profilePictureInput.files[0];
    let imageUrl = null;

    // Mini validazione
    if (firstName.length > 100)
      return showError(
        "firstName",
        "Il nome deve contenere meno di 100 caratteri."
      );
    if (lastName.length > 100)
      return showError(
        "lastName",
        "Il cognome deve contenere meno di 100 caratteri."
      );

    if (calculateAge(birthDate) < 13)
      return showError("birthDate", "Devi avere almeno 13 anni.");

    if (role === "tutor") {
      if (!rate || rate <= 0)
        return showError(
          "rate",
          "Il prezzo orario non può essere negativo o nullo."
        );
      if (bio && bio.length > 1000)
        return showError("bio", "La bio è troppo lunga (max 1000 caratteri).");
    }
    try {
      if (file) {
        console.log(file);

        imageUrl = await uploadImageToImgBB(file); // ⬆️ URL ottenuto da imgBB
      }
      // Preparo oggetto da inviare
      const data = {
        userId,
        firstName,
        lastName,
        email,
        birthDate,
        role,
        preferredSubjects,
        taughtSubjects,
        rate,
        bio,
        profilePicture: imageUrl,
      };
      console.log(data);
      const res = await fetch("http://localhost:3000/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        alert("Update avvenuto con successo!");
        localStorage.setItem("authToken", json.token);
        setTimeout(() => window.location.reload(), 1000); // ricarica la pagina dopo 1 secondo e mostra le modifiche
      } else {
        alert("Errore: " + json.message);
      }
    } catch (err) {
      console.error("Errore nell'aggiornamento profilo", err);
      alert("Errore nel server");
    }
  });

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// funzione che mi serve per conservare l'immagine dell'utente su un cloud esterno
async function uploadImageToImgBB(file) {
  const apiKey = "d3e5692c357f218c5350a525753bdbb7"; // la tua key qui
  const formData = new FormData();

  formData.append("image", file); // questo campo è obbligatorio

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      console.error("Errore imgBB:", data);
      throw new Error(data.error.message || "Errore upload imgBB");
    }
  } catch (err) {
    console.error("Errore:", err);
    throw err;
  }
}
