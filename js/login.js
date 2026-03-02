import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "profile";
});

const form = document.getElementById("loginForm");
const errorEl = document.getElementById("loginError");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "profile";
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/invalid-credential":
            errorEl.textContent = "Email o password errati.";
            break;
          case "auth/wrong-password":
            errorEl.textContent = "Password errata.";
            break;
          case "auth/invalid-email":
            errorEl.textContent = "Email non valida.";
            break;
          case "auth/too-many-requests":
            errorEl.textContent = "Troppi tentativi. Riprova più tardi.";
            break;
          default:
            errorEl.textContent = "Errore durante l'accesso.";
        }
      });
  });
}