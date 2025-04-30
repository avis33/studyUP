let allTutors = []; // contiene tutti i tutor ricevuti dal backend, cosi che evitiamo di chiamare il server ogni volta che chiamiamo un filtro

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("authToken");
    const loginButton = document.getElementById("openModalBtn");
  
    if (!token) {
      document.getElementById("user-area").style.display = "none";
      const resInfo = await fetch(
        `http://localhost:3000/user/fetchTutor/0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await resInfo.json();
      preferredSubjects = null
      console.log(result);
      allTutors = result.tutors;
      renderTutors(result.tutors);
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
          }else{
            document.getElementById("dashboard").innerText = "I miei studenti"
          }
          const resInfo = await fetch(
            `http://localhost:3000/user/fetchTutor/${data.user.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const result = await resInfo.json();
          preferredSubjects = result.preferredSubjects
          console.log(result);
          allTutors = result.tutors;
          renderTutors(result.tutors);
      }
    } catch (error) {
      document.getElementById("user-area").classList.add("hidden");
      loginButton.style.display = "none";
      console.error("Errore:", error);
    }
 
  });

  const modalitaSelect = document.getElementById("modalitaSelect");
  const regioneSelect = document.getElementById("regioneSelect");
  const cittàSelect = document.getElementById("cittàSelect");

  const regioniCittà = {
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

  for (let regione in regioniCittà) {
    const option = document.createElement("option");
    option.value = regione;
    option.textContent = regione;
    regioneSelect.appendChild(option);
  }

  modalitaSelect.addEventListener("change", () => {
    const value = modalitaSelect.value;
    const showLocation = value === "presenza" || value === "entrambe";
    regioneSelect.classList.toggle("hidden", !showLocation);
    cittàSelect.classList.toggle("hidden", !showLocation);
  });

  regioneSelect.addEventListener("change", () => {
    const selected = regioneSelect.value;
    cittàSelect.innerHTML = "<option value=''>Seleziona città</option>";

    if (regioniCittà[selected]) {
      regioniCittà[selected].forEach(città => {
        const opt = document.createElement("option");
        opt.value = città;
        opt.textContent = città;
        cittàSelect.appendChild(opt);
      });
    }})

// Funzione per renderizzare i tutor sulla pagina:
const tutorListDiv = document.getElementById("tutorListContainer");
 // Modifica la funzione renderTutors per gestire le materie preferite
function renderTutors(tutors) {
  console.log(tutors);
  
  tutorListDiv.innerHTML = ""; // svuota prima
  
  if (tutors.length === 0) {
      tutorListDiv.innerHTML = "<p>Nessun tutor trovato.</p>";
      return;
  }

  // Ordina i tutor: prima quelli con materie preferite
  const sortedTutors = [...tutors].sort((a, b) => {    
      if (!preferredSubjects || preferredSubjects.length === 0) return 0;
      
      const aMatches = a.taughtSubjects.filter(subj => 
          preferredSubjects.includes(subj)).length;
      const bMatches = b.taughtSubjects.filter(subj => 
          preferredSubjects.includes(subj)).length;
      
      return bMatches - aMatches; // Ordine decrescente
  });

  sortedTutors.forEach(tutor => {
      const hasPreferredSubjects = preferredSubjects && preferredSubjects.length > 0 && 
          tutor.taughtSubjects.some(subj => preferredSubjects.includes(subj));
      
      const tutorCard = document.createElement("div");
      tutorCard.classList.add("tutor-card");
      if (hasPreferredSubjects) {
          tutorCard.classList.add("preferred-tutor");
      }

      tutorCard.innerHTML = `
          <div class="tutor-card-header">
              ${hasPreferredSubjects ? '<div class="recommended-badge">Consigliato</div>' : ''}
              <img src='${tutor.profilePicture ? tutor.profilePicture : "../assets/icons/icone_img.svg"}' 
                   alt="Foto profilo di ${tutor.firstName}">
          </div>
          <div class="tutor-info">
              <div class="tutor-header">
                  <h2>${tutor.firstName} ${tutor.lastName}</h2>
                  <p class="rate">€${tutor.rate}/h</p>
              </div>
              <p class="subjects">
                  ${tutor.taughtSubjects.map(subj => 
                      preferredSubjects && preferredSubjects.includes(subj) 
                          ? `<strong class="preferred-subject">${subj}</strong>` 
                          : subj
                  ).join(", ")}
              </p>
              <div class="details">
                  <span><strong>Livello:</strong> ${tutor.level.toUpperCase()}</span>
                  <span><strong>Modalità:</strong> ${tutor.mode}</span>
              </div>
              <p class="bio">${tutor.bio}</p>
              <button>Contatta</button>
          </div>
      `;
      tutorListDiv.appendChild(tutorCard);
  });
}
// FILTRI
const materiaInput = document.getElementById("materiaInput");
const livelloSelect = document.getElementById("livelloSelect");
const prezzoSelect = document.getElementById("prezzoSelect");

// Aggiungiamo gli event listener
materiaInput.addEventListener("input", filtraTutor);
livelloSelect.addEventListener("change", filtraTutor);
prezzoSelect.addEventListener("change", filtraTutor);
modalitaSelect.addEventListener("change", filtraTutor);
regioneSelect.addEventListener("change", filtraTutor);
cittàSelect.addEventListener("change", filtraTutor);

function filtraTutor() {
  const materia = document.getElementById("materiaInput").value.toLowerCase();
  const livello = document.getElementById("livelloSelect").value;
  const prezzo = document.getElementById("prezzoSelect").value;
  const modalità = document.getElementById("modalitaSelect").value;
  const regione = document.getElementById("regioneSelect").value;
  const città = document.getElementById("cittàSelect").value;

  const tutorFiltrati = allTutors.filter((tutor) => {
    const materiaMatch = materia === "" || tutor.taughtSubjects.some(s => s.toLowerCase().includes(materia));
    const livelloMatch = livello === "" || tutor.level === livello;
    const modalitàMatch = modalità === "" || tutor.mode === modalità || tutor.mode === "entrambe";

    let prezzoMatch = true;
    if (prezzo === "0-15") prezzoMatch = tutor.rate <= 15;
    else if (prezzo === "15-30") prezzoMatch = tutor.rate > 15 && tutor.rate <= 30;
    else if (prezzo === "30+") prezzoMatch = tutor.rate > 30;

    const cittàMatch = modalità === "presenza" || modalità === "entrambe"
      ? (!regione || tutor.region === regione) && (!città || tutor.city === città)
      : true;

    return materiaMatch && livelloMatch && modalitàMatch && prezzoMatch && cittàMatch;
  });

  renderTutors(tutorFiltrati);
}
