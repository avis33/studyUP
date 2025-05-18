import { calculateAge } from "../utils/utils.js";
export class RegistrationData {
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
    if (calculateAge(this.birthDateValue) < 13)
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

// Mostra errore sotto l'input
export function showError(inputId, message) {
  const errorElement = document.getElementById(`${inputId}Error`); //nel codice register.html ci sono le classi con id ad esempio 'emailError'
  errorElement.textContent = message;
  errorElement.classList.add('show');
  // aggiungi classe error all'input che ha dato errore cosi da avere contorno rosso su css
  const inputField = document.getElementById(inputId);
  if (inputField) inputField.classList.add("error");
}
