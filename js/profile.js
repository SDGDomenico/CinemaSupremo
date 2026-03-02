import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAllFavorites } from "./favorites.js";

const ADMIN_EMAIL = "domenicosdgcisternino@gmail.com";
const AVATARS = Array.from({ length: 10 }, (_, i) => `avatar-${i + 1}.png`);
const content = document.getElementById("profilo-content");

let currentUser = null;
let currentAvatar = null;

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login";
  else {
    currentUser = user;
    loadAndRender(user);
  }
});

async function loadAndRender(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    currentAvatar = snap.exists() ? (snap.data().avatar || null) : null;
  } catch {
    currentAvatar = null;
  }
  renderProfile(user);
}

function avatarSrc(filename) {
  return filename ? `assets/avatars/${filename}` : null;
}

function renderAvatarEl(email) {
  if (currentAvatar) {
    return `<img src="${avatarSrc(currentAvatar)}" alt="Avatar" class="profilo-avatar-img" id="avatarImg">`;
  }
  return `<div class="profilo-avatar-circle" id="avatarImg">${email.charAt(0).toUpperCase()}</div>`;
}

function renderProfile(user) {
  const email = user.email;
  const isAdmin = email === ADMIN_EMAIL;
  const dateReg = new Date(user.metadata.creationTime);
  const dateLogin = new Date(user.metadata.lastSignInTime);
  const days = Math.floor((new Date() - dateReg) / 86400000);

  const fmtDate = d => d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtDateTime = d => d.toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  content.innerHTML = `
    <section class="profilo-container">

      <div class="profilo-avatar">
        <button class="profilo-avatar-wrap" id="avatarBtn" aria-label="Cambia avatar" title="Cambia avatar">
          ${renderAvatarEl(email)}
          <span class="profilo-avatar-overlay">✎</span>
        </button>

        <div class="profilo-avatar-meta">
          <p class="profilo-email-title">${email}</p>
          <div class="profilo-badges">
            <span class="profilo-role-badge profilo-role-badge--${isAdmin ? "admin" : "user"}">
              ${isAdmin ? "Admin" : "Utente"}
            </span>
          </div>
        </div>

        <button class="profilo-refresh-btn" id="refreshBtn" aria-label="Aggiorna profilo" title="Aggiorna profilo">
          <span class="profilo-refresh-icon">↻</span>
        </button>
      </div>

      <div class="avatar-picker hidden" id="avatarPicker">
        <p class="avatar-picker-title">Scegli il tuo avatar</p>
        <div class="avatar-picker-grid">
          ${AVATARS.map(name => `
            <button
              class="avatar-option ${currentAvatar === name ? "avatar-option--active" : ""}"
              data-avatar="${name}"
              aria-label="${name}"
            >
              <img src="assets/avatars/${name}" alt="${name}">
            </button>
          `).join("")}
        </div>
        <button class="avatar-picker-close" id="avatarPickerClose">Annulla</button>
      </div>

      <div class="profilo-cards">
        <div class="profilo-card">
          <span class="profilo-card-icon">✉️</span>
          <span class="profilo-card-label">Email</span>
          <span class="profilo-card-value">${email}</span>
        </div>
        <div class="profilo-card">
          <span class="profilo-card-icon">📅</span>
          <span class="profilo-card-label">Iscritto dal</span>
          <span class="profilo-card-value">${fmtDate(dateReg)}</span>
        </div>
        <div class="profilo-card">
          <span class="profilo-card-icon">🏆</span>
          <span class="profilo-card-label">Giorni iscritto</span>
          <span class="profilo-card-value">${days} ${days === 1 ? "giorno" : "giorni"}</span>
        </div>
        <div class="profilo-card">
          <span class="profilo-card-icon">🕐</span>
          <span class="profilo-card-label">Ultimo accesso</span>
          <span class="profilo-card-value">${fmtDateTime(dateLogin)}</span>
        </div>
      </div>

      <div id="favorites-section"></div>
      <div id="admin-section"></div>
    </section>
  `;

  initAvatarPicker();
  initRefresh();
  renderFavorites(user.uid);
  if (isAdmin) renderAdmin();
}

function initAvatarPicker() {
  const btn = document.getElementById("avatarBtn");
  const picker = document.getElementById("avatarPicker");
  const closeBtn = document.getElementById("avatarPickerClose");

  btn.addEventListener("click", () => {
    picker.classList.toggle("hidden");
  });

  closeBtn.addEventListener("click", () => {
    picker.classList.add("hidden");
  });

  picker.querySelectorAll(".avatar-option").forEach(opt => {
    opt.addEventListener("click", async () => {
      const chosen = opt.dataset.avatar;
      if (chosen === currentAvatar) {
        picker.classList.add("hidden");
        return;
      }

      picker.querySelectorAll(".avatar-option").forEach(o => o.classList.remove("avatar-option--active"));
      opt.classList.add("avatar-option--active");

      try {
        await updateDoc(doc(db, "users", currentUser.uid), { avatar: chosen });
        currentAvatar = chosen;

        const avatarWrap = document.getElementById("avatarImg");
        if (avatarWrap) {
          const newEl = document.createElement("img");
          newEl.src = avatarSrc(chosen);
          newEl.alt = "Avatar";
          newEl.className = "profilo-avatar-img";
          newEl.id = "avatarImg";
          avatarWrap.replaceWith(newEl);
        }
      } catch {
      }

      picker.classList.add("hidden");
    });
  });
}

function initRefresh() {
  const btn = document.getElementById("refreshBtn");
  const icon = btn?.querySelector(".profilo-refresh-icon");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    if (icon) icon.classList.add("spinning");

    try {
      await currentUser.reload();
      await loadAndRender(currentUser);
    } catch {
      if (icon) icon.classList.remove("spinning");
      btn.disabled = false;
    }
  });
}

async function renderFavorites(uid) {
  const section = document.getElementById("favorites-section");
  if (!section) return;

  section.innerHTML = `
    <div class="fav-container">
      <h2 class="fav-title">★ Preferiti</h2>
      <p class="fav-loading">Caricamento...</p>
    </div>
  `;

  try {
    const favorites = await getAllFavorites(uid);

    if (favorites.length === 0) {
      section.innerHTML = `
        <div class="fav-container">
          <h2 class="fav-title">★ Preferiti</h2>
          <p class="fav-empty">Non hai ancora aggiunto nessun preferito. Vai su una pagina film o serie e clicca la stella ☆</p>
        </div>
      `;
      return;
    }

    const brandGroups = {};
    favorites.forEach(fav => {
      if (!brandGroups[fav.brand]) brandGroups[fav.brand] = [];
      brandGroups[fav.brand].push(fav);
    });

    const brandData = {};
    await Promise.all(
      Object.keys(brandGroups).map(async brand => {
        try {
          const res = await fetch(`data/${brand}.json`);
          const data = await res.json();
          brandData[brand] = data.releases;
        } catch {
          brandData[brand] = [];
        }
      })
    );

    const cards = favorites.map(fav => {
      const releases = brandData[fav.brand] || [];
      const project = releases.find(r => slugify(r.title) === fav.slug);
      if (!project) return "";
      return `
        <a href="detail?brand=${fav.brand}&type=${project.type}&title=${fav.slug}" class="fav-card" aria-label="${project.title}">
          <img src="${project.image}" alt="${project.title}" loading="lazy">
          <div class="fav-card-info">
            <h3>${project.title}</h3>
            <p>${project.format} · ${project.date}</p>
            <span class="fav-card-brand fav-card-brand--${fav.brand}">${fav.brand.toUpperCase()}</span>
          </div>
        </a>
      `;
    }).filter(Boolean);

    if (cards.length === 0) {
      section.innerHTML = `
        <div class="fav-container">
          <h2 class="fav-title">★ Preferiti</h2>
          <p class="fav-empty">I tuoi preferiti non sono più disponibili sul sito.</p>
        </div>
      `;
      return;
    }

    section.innerHTML = `
      <div class="fav-container">
        <h2 class="fav-title">★ Preferiti</h2>
        <p class="fav-subtitle">${cards.length} ${cards.length === 1 ? "titolo salvato" : "titoli salvati"}</p>
        <div class="fav-grid">${cards.join("")}</div>
      </div>
    `;
  } catch {
    section.innerHTML = `
      <div class="fav-container">
        <h2 class="fav-title">★ Preferiti</h2>
        <p class="fav-error">❌ Errore nel caricamento dei preferiti.</p>
      </div>
    `;
  }
}

async function renderAdmin() {
  const section = document.getElementById("admin-section");
  if (!section) return;

  section.innerHTML = `
    <div class="admin-container">
      <h2 class="admin-title">Pannello Admin</h2>
      <p class="admin-loading">Caricamento utenti...</p>
    </div>
  `;

  try {
    const snapshot = await getDocs(collection(db, "users"));
    const users = snapshot.docs
      .map(d => d.data())
      .sort((a, b) => new Date(b.registratoIl) - new Date(a.registratoIl));

    const fmt = iso => new Date(iso).toLocaleString("it-IT", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    section.innerHTML = `
      <div class="admin-container">
        <h2 class="admin-title">Pannello Admin</h2>
        <p class="admin-subtitle">${users.length} utent${users.length === 1 ? "e registrato" : "i registrati"}</p>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr><th>#</th><th>Email</th><th>Registrato il</th><th>Ultimo accesso</th></tr>
            </thead>
            <tbody>
              ${users.map((u, i) => `
                <tr ${u.email === ADMIN_EMAIL ? 'class="admin-row-self"' : ""}>
                  <td>${i + 1}</td>
                  <td>${u.email}${u.email === ADMIN_EMAIL ? ' <span class="admin-you-badge">tu</span>' : ""}</td>
                  <td>${u.registratoIl ? fmt(u.registratoIl) : "—"}</td>
                  <td>${u.ultimoAccesso ? fmt(u.ultimoAccesso) : "—"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch {
    section.innerHTML = `
      <div class="admin-container">
        <h2 class="admin-title">Pannello Admin</h2>
        <p class="admin-error">❌ Errore nel caricamento. Controlla le regole Firestore.</p>
      </div>
    `;
  }
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}