document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("authToken");
  const loginButton = document.getElementById("openModalBtn");

  if (!token) {
    window.location.href = "/client/index.html";
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
      console.log(data);
      document.getElementById("user-area").classList.remove("hidden");
      document.getElementById("openModalBtn").classList.add("hidden");
      document.getElementById("userName").innerText =
        data.user.firstName.length > 20
          ? data.user.firstName.substring(0, 20) + "..." //tronca dopo 20 caratteri
          : data.user.firstName;
      document.getElementById("userProfile").src =
        data.user?.profilePicture || "../assets/icons/icone_img.svg";

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
        console.log(user);

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

        if (user.role === "tutor") {
          extraFieldsContainer.innerHTML = `
                <div class="form-group">
                 <label for="subjects">Materie insegnate</label>
              <input type="text" id="subjects" name="subjects" value="${
                user.taughtSubjects || ""
              } placeholder="Es. Chimica, Inglese">
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
        } else if (user.role === "studente") {
          extraFieldsContainer.innerHTML = `
                <div class="form-group">
                  <label for="materieDaRecuperare">Materie da recuperare</label>
                  <input type="text" id="materieDaRecuperare" name="materieDaRecuperare" value="${
                    user.preferredSubjects || ""
                  }" />
                </div>
              `;
        }
      }
    } else {
      window.location.href = "/client/index.html";
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
    const preferredSubjects =
      document.getElementById("preferredSubjects")?.value.trim() || null;
    const taughtSubjects =
      document.getElementById("subjects")?.value.trim() || null;
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
      profilePicture: imageUrl
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
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

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
