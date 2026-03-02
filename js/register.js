import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let registrationInProgress = false;

onAuthStateChanged(auth, (user) => {
  if (user && !registrationInProgress) {
    window.location.href = "home";
  }
});

const form = document.getElementById("registerForm");
const errorEl = document.getElementById("registerError");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    registrationInProgress = true;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return setDoc(doc(db, "users", user.uid), {
          email: user.email,
          registratoIl: new Date().toISOString(),
          ultimoAccesso: new Date().toISOString()
        });
      })
      .then(() => {
        registrationInProgress = false;
        window.location.href = "profile";
      })
      .catch((error) => {
        registrationInProgress = false;
        switch (error.code) {
          case "auth/email-already-in-use":
            errorEl.textContent = "Esiste già un account con questa email.";
            break;
          case "auth/invalid-email":
            errorEl.textContent = "Email non valida.";
            break;
          case "auth/weak-password":
            errorEl.textContent = "La password deve essere di almeno 6 caratteri.";
            break;
          default:
            errorEl.textContent = "Errore durante la registrazione.";
        }
      });
  });
}