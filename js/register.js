import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index";
  }
});

const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");

if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    registerError.textContent = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        window.location.href = "index";
      })
      .catch((error) => {
        switch (error.code) {
          case "auth/email-already-in-use":
            registerError.textContent = "Account già registrato!";
            break;
          case "auth/invalid-email":
            registerError.textContent = "Email non valida!";
            break;
          case "auth/weak-password":
            registerError.textContent = "La password deve essere lunga almeno 6 caratteri!";
            break;
          default:
            registerError.textContent = "Errore nella registrazione!";
        }
      });
  });
}