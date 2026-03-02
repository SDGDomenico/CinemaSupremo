import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { isFavorite, addFavorite, removeFavorite } from "./favorites.js";

const COOKIE_KEY = "cinemasupremo_cookie_consent";

const params = new URLSearchParams(window.location.search);
const brand = params.get("brand");
const type = params.get("type");
const titleParam = params.get("title");

if (!brand || !type || !titleParam) {
  go404();
} else {
  initPage();
}

function go404() {
  window.location.replace("404");
}

function initPage() {
  if (!["marvel", "dc"].includes(brand) || !["movie", "show"].includes(type)) {
    go404();
    return;
  }

  document.body.setAttribute("data-brand", brand);
  setActiveMenu(brand);

  fetch(`data/${brand}.json`)
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      const project = data.releases.find(item =>
        item.type === type && slugify(item.title) === titleParam
      );
      if (!project) { go404(); return; }
      renderProject(project);
    })
    .catch(() => go404());
}

function cookiesAccepted() {
  return localStorage.getItem(COOKIE_KEY) === "accepted";
}

function renderTrailers(trailers, title) {
  if (!trailers || trailers.length === 0) return "";

  const content = cookiesAccepted()
    ? trailers.map(url => `
        <iframe src="${url}" title="Trailer ${title}" allowfullscreen loading="lazy"></iframe>
      `).join("")
    : `<div class="trailer-blocked">
        <p>🍪 Hai rifiutato i cookie di terze parti.</p>
        <p>I trailer YouTube non possono essere mostrati.</p>
        <a href="cookies">Gestisci preferenze →</a>
       </div>`;

  return `
    <div class="project-trailer">
      <h3>Trailer</h3>
      <div class="trailer-list">${content}</div>
    </div>
  `;
}

function renderProject(project) {
  document.title = `CinemaSupremo — ${project.title}`;

  const poster = document.getElementById("project-poster");
  poster.src = project.image;
  poster.alt = project.title;

  document.getElementById("content").innerHTML = `
    <div class="project-details">
      <div class="project-details-header">
        <h1>Trama</h1>
        <button class="fav-btn" id="favBtn" aria-label="Aggiungi ai preferiti" title="Aggiungi ai preferiti">
          <span class="fav-star">☆</span>
        </button>
      </div>
      <p>${project.description || "Descrizione non ancora disponibile."}</p>
      <ul class="project-meta">
        <li><strong>Tipo</strong>${project.format}</li>
        <li><strong>Uscita</strong>${project.date}</li>
        ${project.director ? `<li><strong>${project.type === "movie" ? "Regia" : "Showrunner"}</strong>${project.director}</li>` : ""}
        ${project.duration ? `<li><strong>Durata</strong>${project.duration}</li>` : ""}
        ${project.cast ? `<li><strong>Cast</strong>${project.cast.join(", ")}</li>` : ""}
      </ul>
    </div>
    ${renderTrailers(project.trailers, project.title)}
  `;

  initFavButton(project);
}

function initFavButton(project) {
  const btn = document.getElementById("favBtn");
  if (!btn) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      btn.addEventListener("click", () => { window.location.href = "login"; });
      return;
    }

    const slug = slugify(project.title);
    const already = await isFavorite(user.uid, brand, slug);
    setStarState(btn, already);

    btn.addEventListener("click", async () => {
      const current = btn.classList.contains("fav-btn--active");
      btn.disabled = true;
      try {
        if (current) {
          await removeFavorite(user.uid, brand, slug);
          setStarState(btn, false);
        } else {
          await addFavorite(user.uid, brand, slug);
          setStarState(btn, true);
        }
      } catch {
      } finally {
        btn.disabled = false;
      }
    });
  });
}

function setStarState(btn, active) {
  const star = btn.querySelector(".fav-star");
  if (active) {
    btn.classList.add("fav-btn--active");
    star.textContent = "★";
    btn.setAttribute("aria-label", "Rimuovi dai preferiti");
    btn.setAttribute("title", "Rimuovi dai preferiti");
  } else {
    btn.classList.remove("fav-btn--active");
    star.textContent = "☆";
    btn.setAttribute("aria-label", "Aggiungi ai preferiti");
    btn.setAttribute("title", "Aggiungi ai preferiti");
  }
}

function setActiveMenu(brand) {
  document.querySelectorAll(".menu a").forEach(link => {
    if ((link.getAttribute("href") || "") === brand) link.classList.add("active");
  });
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}