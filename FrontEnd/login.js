

//connexion page de login
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const userLogin = await response.json();
    console.log(userLogin);
    if (userLogin.token) {
      window.localStorage.setItem("token", userLogin.token);
      window.localStorage.setItem("loggedIn", "true");
      window.location.href = "index.html";
    } else {
      alert("Erreur dans l'identifiant ou le mot de passe");
      console.log(userLogin);
    }
  } catch (error) {
    alert("Une erreur est survenue");
    console.log(error);
  }
});

//******************************************************************* */
document.addEventListener("DOMContentLoaded", () => {
  const loggedIn = window.localStorage.getItem("loggedIn");
  const blackHeader = document.querySelector(".black-header");
  const pageHeader = document.querySelector("header"); // Sélectionne le header de la page

  if (loggedIn === "true") {
    // Supprimer la barre de filtres
    const filters = document.querySelector(".filters");
    if (filters) {
      filters.classList.add("hidden");
    }

    // Ajouter le lien modifier
    const userModify = document.querySelector(".user-modify");
    if (userModify) {
      userModify.classList.add("active");
    }

    // Modifier les liens de login et logout après la connexion
    const logInOut = document.querySelector(".log-in-out");
    if (logInOut) {
      logInOut.textContent = "logout";
      logInOut.href = "#";
      logInOut.addEventListener("click", (event) => {
        event.preventDefault();
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("loggedIn");
        window.location.href = "index.html";

        // Supprimer la bande noire lors de la déconnexion
        if (blackHeader) {
          blackHeader.classList.add("hidden"); // Ajouter la classe hidden pour masquer la bande

          // Remettre le header à sa position d'origine
          if (pageHeader) {
            pageHeader.style.marginTop = "0"; // Enlever le margin-top du header
          }
        }
      });
    }

    // Ajouter dynamiquement le mode édition dans la bande noire
    if (blackHeader) {
      blackHeader.classList.remove("hidden"); // S'assurer que la bande est visible quand connecté
      const editIcon = document.createElement("i");
      editIcon.className = "fa fa-pen-to-square";

      const editText = document.createElement("span");
      editText.textContent = "Mode édition";
      editText.style.marginLeft = "10px"; // Espace entre l'icône et le texte

      blackHeader.appendChild(editIcon);
      blackHeader.appendChild(editText);

      // Ajuster le margin-top du header pour décaler le contenu
      if (pageHeader) {
        pageHeader.style.marginTop = "70px"; // Ajoute un margin-top fixe pour plus d'espace
      }
    }
  } else {
    // Ajouter la classe hidden si l'utilisateur n'est pas connecté
    if (blackHeader) {
      blackHeader.classList.add("hidden");
    }

    // S'assurer que le header est bien en haut si non connecté
    if (pageHeader) {
      pageHeader.style.marginTop = "50"; // Remettre le margin-top à 50 si non connecté
    }
  }
});
