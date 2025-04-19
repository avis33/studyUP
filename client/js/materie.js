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
        //todo fai chiamata all'api per ottenere tutor relativi alle materie da recuperare dello studente
        //logica per quando l'utente è loggato correttamente
        document.getElementById("user-area").classList.remove("hidden");
        document.getElementById("openModalBtn").classList.add("hidden");
        document.getElementById("userName").innerText =
          data.user.firstName.length > 20
            ? data.user.firstName.substring(0, 20) + "..." //tronca dopo 20 caratteri
            : data.user.firstName;
        document.getElementById("userProfile").src =
          data.user?.profilePicture || "../assets/icons/icone_img.svg";
      }
    } catch (error) {
      document.getElementById("user-area").classList.add("hidden");
      loginButton.style.display = "none";
      console.error("Errore:", error);
    }
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
  });