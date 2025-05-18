import { regionCities, allSubjects } from "../data/data.js";
import {RegistrationData,showError} from "./validation.js";
// Mostra/Nasconde campi in base al ruolo selezionato
const roleRadios = document.querySelectorAll('input[name="role"]');
const studentFields = document.getElementById('studentFields');
const tutorFields = document.getElementById('tutorFields');

// VERIFICA SE UTENTE è GIA LOGGATO
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
        Authorization: `Bearer ${token}`, 
      },
    });
    const data = await res.json();
    if (data.hasAccess) {
      //logica per quando l'utente è loggato correttamente
      window.location.href = "/client/index.html";

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

roleRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'student') {
      document.getElementById("mode").required = false;
      document.getElementById("level").required = false;
      studentFields.classList.remove('hidden');
      tutorFields.classList.add('hidden');
    } else {
      document.getElementById("mode").required = true;
      document.getElementById("level").required = true;
      studentFields.classList.add('hidden');
      tutorFields.classList.remove('hidden');
    }
  });
});

// Validazione del form
document.getElementById("registrationForm").addEventListener("submit", async function(e) {
  e.preventDefault()
  // Nascondi tutti gli errori precedenti
  document.querySelectorAll('.error-message').forEach(el => {
    el.classList.remove('show');
  });
  document.querySelectorAll('.error').forEach(el => {
    el.classList.remove('error');
  });

  //Verifica lunghezza nome e cognome
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim(); //trim() serve per togliere gli spazi
  const email = document.getElementById("emailRegister").value.trim();
  const password = document.getElementById("passwordRegister").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const birthDateValue = document.getElementById("birthDate").value;
  // SOLO PER STUDENTI
  const materieDaRecuperare = [...document.getElementById("selectedSubjects").children].map(chip => chip.dataset.subject);  
  const materieInsegnate = [...document.getElementById("selectedTaughtSubjects").children].map(chip => chip.dataset.subject);  
  //SOLO PER I TUTOR!! -->il prezzo delle lezioni deve essere non negativo
  const rate = document.getElementById("rate") ? parseFloat(document.getElementById("rate").value) : null;
  const descrizioneTutor = document.getElementById("bio") ? document.getElementById("bio").value : null;
  const mode = document.getElementById("mode").value;
  const level = document.getElementById("level").value
  const region = document.getElementById("region").value;
  const city = document.getElementById("city").value;

  let role = "student"
  let data = {}
  if(rate) role = "tutor"
  
  const formData = new RegistrationData(firstName, lastName, email, password, confirmPassword, birthDateValue, materieDaRecuperare, materieInsegnate, rate, descrizioneTutor,level,mode,region,city, role)
  const error = formData.validate()
  if(error == undefined){
    data = formData.dataPerDb()
     // CHIAMATA A SERVER
  try {
    const res = await fetch("http://localhost:3000/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      alert("Registrazione avvenuta con successo!");
      window.location.href = "/client/index.html";
    } else {
      showError("form", json.message);
      //alert("Errore: " + json.message);
    }
  } catch (err) {
    console.error("Errore nella registrazione", err);
    alert("Errore nel server");
  }
  }else{
    showError(error.id, error.error);
  }
});

const modeSelect = document.getElementById("mode");
const locationFields = document.getElementById("locationFields");
const regionSelect = document.getElementById("region");
const citySelect = document.getElementById("city");

// Popola la select delle regioni
for (const regione in regionCities) {
  const option = document.createElement("option");
  option.value = regione;
  option.textContent = regione;
  regionSelect.appendChild(option);
}

// Mostra/Nasconde la sezione città in base alla modalità
modeSelect.addEventListener("change", () => {
  const selected = modeSelect.value;
  const richiedeLocalizzazione = selected === "presenza" || selected === "entrambe";
  if (richiedeLocalizzazione) {
    regionSelect.required = true;
    citySelect.required = true;
    locationFields.classList.remove("hidden");
  } else {
    regionSelect.required = false;
    citySelect.required = false;
    locationFields.classList.add("hidden");
  }
});

// Aggiorna le città in base alla regione selezionata
regionSelect.addEventListener("change", () => {
  const selectedRegion = regionSelect.value;
  const cities = regionCities[selectedRegion] || [];
  citySelect.innerHTML = '<option value="">Seleziona una città</option>';
  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
});

// SEZIONE PER MATERIE DA RECUPERARE E INSEGNATE
const input = document.getElementById("preferredSubjects");
const suggestions = document.getElementById("subjectSuggestions");
const selectedSubjects = document.getElementById("selectedSubjects");

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
  if ([...selectedSubjects.children].some(chip => chip.dataset.subject === subject)) return;

  const chip = document.createElement("div");
  chip.className = "chip";
  chip.dataset.subject = subject;
  chip.innerHTML = `${subject} <span>&times;</span>`;

  chip.querySelector("span").addEventListener("click", () => chip.remove());
  selectedSubjects.appendChild(chip);
}


const taughtSubjectsInput = document.getElementById("taughtSubjects");
const taughtSuggestions = document.getElementById("taughtSuggestions");
const selectedTaughtSubjects = document.getElementById("selectedTaughtSubjects");
let taughtSubjects = [];

taughtSubjectsInput.addEventListener("input", () => {
  const query = taughtSubjectsInput.value.toLowerCase();
  taughtSuggestions.innerHTML = "";
  let filtered;
  if (query) {
     filtered = allSubjects.filter(sub =>
      sub.toLowerCase().includes(query) && !taughtSubjects.includes(sub)
    );
    filtered.forEach(subject => {
      const div = document.createElement("div");
      div.className = "suggestion";
      div.textContent = subject;
      div.addEventListener("click", () => {
        taughtSubjects.push(subject);
        updateTaughtChips();
        taughtSubjectsInput.value = "";
        taughtSuggestions.innerHTML = "";
      });
      taughtSuggestions.appendChild(div);
    });
  }
  taughtSuggestions.style.display = filtered.length ? "block" : "none";
});

function updateTaughtChips() {

  selectedTaughtSubjects.innerHTML = "";
  taughtSubjects.forEach((subject, index) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = subject;
    chip.dataset.subject = subject;
    const removeBtn = document.createElement("span");
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => {
      taughtSubjects.splice(index, 1);
      updateTaughtChips();
    });
    chip.appendChild(removeBtn);
    selectedTaughtSubjects.appendChild(chip);
  });
}