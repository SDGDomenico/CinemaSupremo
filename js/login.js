import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "https://sdgdomenico.github.io/CinemaSupremo/";
  }
});

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        window.location.href = "index";
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/user-not-found":
            loginError.textContent = "Account non trovato!";
            break;
          case "auth/wrong-password":
            loginError.textContent = "Password errata!";
            break;
          case "auth/invalid-email":
            loginError.textContent = "Email non valida!";
            break;
          default:
            loginError.textContent = "Errore durante l'accesso!";
        }
      });
  });
}