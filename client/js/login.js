const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  document.querySelectorAll(".error-message").forEach((el) => {
    el.classList.remove("show");
  });

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorElement = document.getElementById(`genericError`);

  if (!isValidEmail(email) || !isPasswordValid(password)) {
    errorElement.textContent = "Email o password invalidi";
    errorElement.classList.add('show');
  }else{
    try {
        const res = await fetch("http://localhost:3000/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
    
        const data = await res.json();
        errorElement.classList.remove('show');
        if (res.ok) {
          // Salviamo il token in localStorage
          localStorage.setItem("authToken", data.token);
          window.location.href = "/client/index.html";
          // 🔐 Puoi salvare un token o reindirizzare l'utente
          // es: localStorage.setItem("token", data.token);
          // window.location.href = "/dashboard.html";
        } else {
            errorElement.textContent = data.message;
            errorElement.classList.add('show');
        }
      } catch (err) {
        console.error("Errore durante il login:", err);
        errorElement.textContent = "Errore del server";
        errorElement.classList.add('show');
      }
  }

  
});

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isPasswordValid(password) {
  /*  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;          
     if (!passwordRegex.test(password)) {
       return false;
     } */
  return true;
}
