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
      if(rate)this.rate = parseFloat(rate);
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
      if(price != null){
          if ( price < 0) {
              return false
            }
      }
  }
  validate(){
      if (this.firstName.length > 100|| this.lastName.length > 100) return "Il nome e il cognome devono contenere meno di 100 caratteri."
      if (!this.isValidEmail(this.email)) return "Inserisci un indirizzo email valido"
      if(this.passwordMatch(this.password, this.confirmPassword) == false)return "Le password non corrispondono"
      if(!this.isPasswordValid(this.password))return "La password deve essere lunga almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale"
      if(this.calculateAge(this.birthDateValue) < 13) return "Devi avere almeno 13 anni per registrarti."
      switch (this.role) {
          case "student":
              break;
          case "tutor":
              if(!this.checkPrice(this.rate)) return "Il prezzo orario non può essere negativo"
              if(this.descrizioneTutor.length > 1000) return "La tua bio è troppo lunga"
              break;
          default: break
      }
      return undefined
  }

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



// /..../----> sono come gli apici per le stringhe o le parentesi quadre per gli array....delimitano la regex
// ^---->inizio stringa, da qui comincia il controllo
// $---->fine stringa, il controllo finisce qui

// [^\s@]--> [...] classe di caratteri
//       --> [^..] classe di caratteri che non possono esserci
//       -->/s spazi
//       -->@ chiocciola
//       -->+ uno o più caratteri

// \.--->perchè il punto da solo significa 'qualsiasi carattere (eccetto \n)'

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

// Validazione del form
document.getElementById("registrationForm").addEventListener("submit", async function(e) {
  //Verifica lunghezza nome e cognome
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim(); //trim() serve per togliere gli spazi
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const birthDateValue = document.getElementById("birthDate").value;
  // SOLO PER STUDENTI
  const materieDaRecuperare = document.getElementById("preferredSubjects").value.trim() ? document.getElementById("preferredSubjects") : null;
  //SOLO PER I TUTOR!! -->il prezzo delle lezioni deve essere non negativo
  const rate = document.getElementById("rate").value ? document.getElementById("rate") : null;
  const materieInsegnate = document.getElementById("subjects").value ? document.getElementById("subjects") : null;
  const descrizioneTutor = document.getElementById("bio").value ? document.getElementById("bio") : null;

  let role = "tutor"
  let data = {}
  if(materieDaRecuperare != null) role = "student"
  
  const formData = new RegistrationData(firstName, lastName, email, password, confirmPassword, birthDateValue, materieDaRecuperare, materieInsegnate, rate, descrizioneTutor, role)
  if(formData.validate() == undefined){
    data = formData.dataPerDb()
  }
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


});
