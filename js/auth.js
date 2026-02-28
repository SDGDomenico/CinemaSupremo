import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const authLinks = document.getElementById("authLinks");
  if (!authLinks) return;

  const currentPage = window.location.pathname.split("/").pop();

  if (user) {
    authLinks.innerHTML = `<li><a href="#" id="logoutBtn">Esci</a></li>`;

    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth).then(() => {
        window.location.href = "https://sdgdomenico.github.io/CinemaSupremo";
      });
    });

  } else {
    authLinks.innerHTML = `
      <li><a href="register" class="${currentPage === 'register' ? 'active' : ''}">Registrati</a></li>
      <li><a href="login" class="${currentPage === 'login' ? 'active' : ''}">Accedi</a></li>
    `;
  }
});