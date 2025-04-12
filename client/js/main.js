//per la faq
document.addEventListener("DOMContentLoaded", function () {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(button => {
      button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        answer.classList.toggle('open');
      });
    });
  });

// cerca una sessione: 

document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = document.getElementById("openModalBtn")
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      // chiamata a server per verificare se esiste il token
      const res = await fetch("http://localhost:3000/user/profilo", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // il middleware sul server prende il token da qua
        }
      })

    const data = await res.json();
    if(data){
      let welcome = `Sei loggato come: ${data.user.email}`
      alert(welcome)
      //logica per quando l'utente è loggato
      //loginButton.style.display = "none";
    }    
    } catch (error) {
      //loginButton.style.display = "inline-block";
      console.error("Errore:", error)

    }
  }
});
