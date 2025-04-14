document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/client/index.html";
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
          //logica per quando l'utente è loggato correttamente
          console.log(data);
          document.getElementById("user-area").classList.remove("hidden");
          document.getElementById("openModalBtn").classList.add("hidden");
          document.getElementById("userName").innerText =
            data.user.firstName.length > 20
              ? data.user.firstName.substring(0, 20) + "..." //tronca dopo 20 caratteri
              : data.user.firstName;
              document.getElementById("userProfile").src =
          data.user?.profilePicture ||
          "/client/assets/icons/icone_img.svg";

          const resInfo = await fetch(`http://localhost:3000/user/getUserInfo/${data.user.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const userInfo = await resInfo.json()
          if(!userInfo.error){
            console.log(userInfo); //popola il form con questi dati
            // popola anche l'input con id "userId" con l'id dell'utente senno non posso fare l'update
            //questo id andrà poi insieme agli altri campi nella chiamata a http://localhost:3000/user/update
            
          }

        }else{
            window.location.href = "/client/index.html";
        }
        
      } catch (error) {
        console.log(error);
        document.getElementById("user-area").classList.add("hidden");
        loginButton.style.display = "none";
        console.error("Errore:", error);
      }
})

document.getElementById("profileForm").addEventListener("submit", async function(e) {
    e.preventDefault()

    //fai validazione e restituisci data nella forma
    /*
    userId:...,
    firstName:...,
    lastName:...,
    email;,
    birthDate:...,
    role:...,
    preferredSubjects:...,
    taughtSubjects:...,
    rate:...,
    bio:...,
    profilePicture:...,
    */
    
    try {
        const res = await fetch("http://localhost:3000/user/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (res.ok) {
          alert("Update avvenuta con successo!");
        } else {
          alert("Errore: " + json.message);
        }
      } catch (err) {
        console.error("Errore nella registrazione", err);
        alert("Errore nel server");
      }
})