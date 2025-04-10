// Mostra/Nasconde campi in base al ruolo selezionato
const roleRadios = document.querySelectorAll('input[name="role"]');
const studentFields = document.getElementById('studentFields');
const tutorFields = document.getElementById('tutorFields');
//const roleInput = document.getElementById("roleInput");

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
      return { error: "Inserisci un indirizzo email valido", id: "email" };
  
    // 4. Controlla che password e conferma password siano uguali
    if (this.passwordMatch(this.password, this.confirmPassword) == false)
      return { error: "Le password non corrispondono", id: "confirmPassword" };
  
    // 5. Controlla complessità password
    if (!this.isPasswordValid(this.password))
      return {
        id: "password",
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
      bio: this.descrizioneTutor
  };
  }
}


//funzione freccia: es.const raddoppia = x => x * 2;
roleRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'student') {
      studentFields.classList.remove('hidden');
      tutorFields.classList.add('hidden');
    } else {
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
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const birthDateValue = document.getElementById("birthDate").value;
  // SOLO PER STUDENTI
  const materieDaRecuperare = document.getElementById("preferredSubjects") ? document.getElementById("preferredSubjects").value.trim() : null;
  //SOLO PER I TUTOR!! -->il prezzo delle lezioni deve essere non negativo
  const rate = document.getElementById("rate") ? parseFloat(document.getElementById("rate").value) : null;
  const materieInsegnate = document.getElementById("subjects") ? document.getElementById("subjects").value : null; //operatorie ternario
  const descrizioneTutor = document.getElementById("bio") ? document.getElementById("bio").value : null;
  
  localStorage.setItem('s', JSON.stringify(materieDaRecuperare));
  let role = "tutor"
  let data = {}
  if(materieDaRecuperare) role = "student"
  
  const formData = new RegistrationData(firstName, lastName, email, password, confirmPassword, birthDateValue, materieDaRecuperare, materieInsegnate, rate, descrizioneTutor, role)
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
    } else {
      alert("Errore: " + json.message);
    }
  } catch (err) {
    console.error("Errore nella registrazione", err);
    alert("Errore nel server");
  }
  }else{
    showError(error.id, error.error);
  }
});
