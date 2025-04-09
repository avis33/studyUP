// Mostra/Nasconde campi in base al ruolo selezionato
const roleRadios = document.querySelectorAll('input[name="role"]');
const studentFields = document.getElementById('studentFields');
const tutorFields = document.getElementById('tutorFields');

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

// Funzione per calcolare l’età
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
 //Funzione per il test della mail
function isValidEmail(email) {
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




// Validazione del form
document.getElementById("registrationForm").addEventListener("submit", function(e) {
  //Verifica lunghezza nome e cognome
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim(); //trim() serve per togliere gli spazi

  if (firstName.length > 50|| lastName.length > 50) {
    alert("Il nome e il cognome devono contenere meno di 50 caratteri.");
    e.preventDefault();
    return;
  }

  //Verifica correttezza mail
  const email = document.getElementById("email").value.trim();

  if (!isValidEmail(email)) {
    alert("Inserisci un indirizzo email valido.");
    e.preventDefault();
    return;
  }
  //Verifica password
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  
  if (password !== confirmPassword) {
    alert("Le password non coincidono.");
    e.preventDefault();
    return;
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  
  // Verifica che la password soddisfi i requisiti
  if (!passwordRegex.test(password)) {
    alert("La password deve essere lunga almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale.");
    e.preventDefault(); // Blocca l'invio del form
    return;
  }

  //Verifica età
  const birthDateValue = document.getElementById("birthDate").value;
  const age = calculateAge(birthDateValue);

  if (age < 13) {
    alert("Devi avere almeno 13 anni per registrarti.");
    e.preventDefault();
    return;
  }
  

  //SOLO PER I TUTOR!!-->il prezzo delle lezioni deve essere non negativo
  const rateInput = document.getElementById("rate");
  
  // Verifica che il campo esista (cioè se l'utente è un tutor)
  if (rateInput && rateInput.value !== "") {
    const rate = parseFloat(rateInput.value);

    if ( rate < 0) {
      alert("Il prezzo orario non può essere negativo.")
      e.preventDefault(); // Blocca l’invio del form
      return;
    }
  }
  


});
