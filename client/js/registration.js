// Mostra/Nasconde campi in base al ruolo selezionato
const roleRadios = document.querySelectorAll('input[name="role"]');
const studentFields = document.getElementById('studentFields');
const tutorFields = document.getElementById('tutorFields');
const allSubjects = [
  "Matematica", "Fisica", "Chimica", "Biologia", "Inglese", "Francese", "Cinese", "Storia",
  "Filosofia", "Geografia", "Italiano", "Economia", "Latino", "Greco", "Python", "Java", "Cpp",
  "Javascript", "SQL", "Statistica", "Robotica", "Design"
];

class RegistrationData {
  constructor(
      firstName, 
      lastName, 
      email, 
      password, 
      confirmPassword, 
      birthDateValue, 
      materieDaRecuperare = null, 
      materieInsegnate = null, 
      rate = null, 
      descrizioneTutor = null,
      level = null,
      mode = null,
      region = null,
      city = null,
      role = 'student' // Aggiunto il ruolo con default 'student'
  ) {
      this.firstName = firstName;
      this.lastName = lastName;
      this.email = email;
      this.password = password;
      this.confirmPassword = confirmPassword;
      this.birthDateValue = birthDateValue;
      this.materieDaRecuperare = materieDaRecuperare;
      this.materieInsegnate = materieInsegnate;
      if(rate != null )this.rate = rate;
      this.descrizioneTutor = descrizioneTutor;
      this.level = level;
      this.mode = mode;
      this.region = region;
      this.city = city;
      this.role = role;
  }
   
  // Funzione per calcolare l’età
  calculateAge(birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }

  //Funzione per il test della mail
  isValidEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      console.log(regex.test(email), email);
      
      return regex.test(email);
  }
  // /..../----> sono come gli apici per le stringhe o le parentesi quadre per gli array....delimitano la regex
// ^---->inizio stringa, da qui comincia il controllo
// $---->fine stringa, il controllo finisce qui

// [^\s@]--> [...] classe di caratteri
//       --> [^..] classe di caratteri che non possono esserci
//       -->/s spazi
//       -->@ chiocciola
//       -->+ uno o più caratteri

// \.--->perchè il punto da solo significa 'qualsiasi carattere (eccetto \n)'
  
  passwordMatch(password, confirmPassword){
      if (password !== confirmPassword) {
          return false;
        }
  }
  //Verifica correttezza password
  isPasswordValid(password){
       /*  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;          
        if (!passwordRegex.test(password)) {
          return false;
        } */
       return true
  }
  checkPrice(price){
    return price > 0
  }

  //validate() IN CASO DI ERRORE ritorna un oggetto con due proprietà. Una (error) serve per mostrare all'utente ilmessaggio di errore,
  //l'altra (id) serve per evidenziare il campo in cui è stato commesso un errore
  validate() {
    // 1. Controlla lunghezza del nome
    if (this.firstName.length > 100)
      return { error: "Il nome deve contenere meno di 100 caratteri.", id: "firstName" };
  
    // 2. Controlla lunghezza del cognome
    if (this.lastName.length > 100)
      return { error: "Il cognome deve contenere meno di 100 caratteri.", id: "lastName" };
  
    // 3. Controlla formato email
    if (!this.isValidEmail(this.email))
      return { error: "Inserisci un indirizzo email valido", id: "emailRegister" };
  
    // 4. Controlla che password e conferma password siano uguali
    if (this.passwordMatch(this.password, this.confirmPassword) == false)
      return { error: "Le password non corrispondono", id: "confirmPassword" };
  
    // 5. Controlla complessità password
    if (!this.isPasswordValid(this.password))
      return {
        id: "passwordRegister",
        error: "La password deve essere lunga almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale"
      };
  
    // 6. Controlla età utente
    if (this.calculateAge(this.birthDateValue) < 13)
      return { error: "Devi avere almeno 13 anni per registrarti", id: "birthDate" };
  
    // 7. Se è un tutor, fa controlli aggiuntivi
    switch (this.role) {
      case "student":
        break; // nessun controllo extra
      case "tutor":
        // 7.1. Prezzo orario deve essere positivo
        if (!this.checkPrice(this.rate))
          return { error: "Il prezzo orario non può essere negativo", id: "rate" };
  
        // 7.2. Bio non deve superare i 1000 caratteri
        if (this.descrizioneTutor.length > 1000)
          return { error: "La tua bio è troppo lunga", id: "bio" };
        break;
      default:
        break;
    }
  
    // ✅ Se tutto è valido, non ritorna nulla (undefined)
    return undefined;
  }
  //resituisce queste coppie chiave:valore al database
  dataPerDb(){
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      birthDate: this.birthDateValue,
      role: this.role,
      preferredSubjects: this.materieDaRecuperare,
      taughtSubjects: this.materieInsegnate,
      rate: this.rate,
      bio: this.descrizioneTutor,
      level: this.level,
      mode: this.mode,
      region:this.region,
      city:this.city
  };
  }
}
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



//funzione freccia: es.const raddoppia = x => x * 2;
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
// Mostra errore sotto l'input
 function showError(inputId, message) {
  const errorElement = document.getElementById(`${inputId}Error`); //nel codice register.html ci sono le classi con id ad esempio 'emailError'
  errorElement.textContent = message;
  errorElement.classList.add('show');
  // aggiungi classe error all'input che ha dato errore cosi da avere contorno rosso su css
  const inputField = document.getElementById(inputId);
  if (inputField) inputField.classList.add("error");
}

// Validazione del form
document.getElementById("registrationForm").addEventListener("submit", async function(e) {
  e.preventDefault()
  form = this;
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
      form.reset();
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

const regionCities = {
  "Abruzzo": ["L'Aquila", "Pescara", "Chieti", "Teramo"],
  "Basilicata": ["Potenza", "Matera"],
  "Calabria": ["Catanzaro", "Reggio Calabria", "Cosenza"],
  "Campania": ["Napoli", "Salerno", "Caserta", "Avellino", "Benevento"],
  "Emilia-Romagna": ["Bologna", "Modena", "Parma", "Reggio Emilia", "Ferrara", "Ravenna", "Forlì", "Piacenza", "Cesena", "Rimini"],
  "Friuli-Venezia Giulia": ["Trieste", "Udine", "Pordenone", "Gorizia"],
  "Lazio": ["Roma", "Latina", "Frosinone", "Viterbo", "Rieti"],
  "Liguria": ["Genova", "La Spezia", "Savona", "Imperia"],
  "Lombardia": ["Milano", "Bergamo", "Brescia", "Como", "Cremona", "Lecco", "Lodi", "Mantova", "Monza", "Pavia", "Sondrio", "Varese"],
  "Marche": ["Ancona", "Pesaro", "Urbino", "Macerata", "Ascoli Piceno", "Fermo"],
  "Molise": ["Campobasso", "Isernia"],
  "Piemonte": ["Torino", "Alessandria", "Asti", "Biella", "Cuneo", "Novara", "Verbano-Cusio-Ossola", "Vercelli"],
  "Puglia": ["Bari", "Brindisi", "Foggia", "Lecce", "Taranto", "Barletta-Andria-Trani"],
  "Sardegna": ["Cagliari", "Sassari", "Nuoro", "Oristano", "Carbonia-Iglesias"],
  "Sicilia": ["Palermo", "Catania", "Messina", "Trapani", "Siracusa", "Ragusa", "Agrigento", "Enna", "Caltanissetta"],
  "Toscana": ["Firenze", "Pisa", "Siena", "Arezzo", "Grosseto", "Livorno", "Lucca", "Massa-Carrara", "Pistoia", "Prato"],
  "Trentino-Alto Adige": ["Trento", "Bolzano"],
  "Umbria": ["Perugia", "Terni"],
  "Valle d'Aosta": ["Aosta"],
  "Veneto": ["Venezia", "Verona", "Padova", "Vicenza", "Treviso", "Belluno", "Rovigo"]
};

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

// SEZIONE PER MATERIE DA RECUPERARE E INSEGNATER

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