/* ============================= */
/* PARAMETRI URL                 */
/* ============================= */
const params = new URLSearchParams(window.location.search);
const brand = params.get("brand");
const type = params.get("type");
const titleParam = params.get("title");

/* ============================= */
/* VALIDAZIONE INIZIALE          */
/* ============================= */
if (!brand || !type || !titleParam) {
    render404();
} else {
    initPage();
}

/* ============================= */
/* INIZIALIZZAZIONE PAGINA       */
/* ============================= */
function initPage() {
    if (!["marvel", "dc"].includes(brand) || !["movie", "show"].includes(type)) {
        render404();
        return;
    }

    document.body.setAttribute("data-brand", brand);
    document.body.setAttribute("data-layout", "footer-bottom");

    setActiveMenu(brand);

    fetch(`data/${brand}.json`)
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            const project = data.releases.find(item =>
                item.type === type &&
                slugify(item.title) === titleParam
            );

            if (!project) {
                render404();
                return;
            }

            renderProject(project);
        })
        .catch(() => render404());
}

/* ============================= */
/* RENDER PROGETTO               */
/* ============================= */
function renderProject(project) {
    document.title = `CinemaSupremo - ${project.title}`;

    const poster = document.getElementById("project-poster");
    poster.src = project.image;
    poster.alt = project.title;

    document.getElementById("content").innerHTML = `
        <section class="project-details">
            <h1>Trama</h1>
            <p>${project.description || "Descrizione non disponibile."}</p>

            <ul class="project-meta">
                <li><strong>Tipo:</strong> ${project.format}</li>
                <li><strong>Uscita:</strong> ${project.date}</li>
                ${project.director ? `<li><strong>${project.type === "movie" ? "Regia" : "Showrunner"}:</strong> ${project.director}</li>` : ""}
                ${project.duration ? `<li><strong>Durata:</strong> ${project.duration}</li>` : ""}
                ${project.cast ? `<li><strong>Cast:</strong> ${project.cast.join(", ")}</li>` : ""}
            </ul>
        </section>

        ${project.trailers?.length > 0 ? `
            <section class="project-trailer trailer-card">
                <h3>Trailer</h3>
                <div class="trailer-list">
                    ${project.trailers.map(url => `<iframe src="${url}" allowfullscreen></iframe>`).join("")}
                </div>
            </section>
        ` : ""}
    `;
}

/* ============================= */
/* PAGINA 404                    */
/* ============================= */
function render404() {
    document.title = "Errore 404 – Pagina non trovata | CinemaSupremo";

    document.body.className = "error-page";
    document.body.removeAttribute("data-brand");
    document.body.removeAttribute("data-layout");

    document.querySelectorAll(".menu a").forEach(link => link.classList.remove("active"));

    const poster = document.getElementById("project-poster");
    if (poster) poster.style.display = "none";

    document.getElementById("content").innerHTML = `
        <section class="error-404">
            <h1>404</h1>
            <p>Pagina non trovata</p>
            <p>Verrai reindirizzato alla home…</p>
        </section>
    `;

    setTimeout(() => window.location.href = "https://sdgdomenico.github.io/CinemaSupremo", 5000);
}

/* ============================= */
/* MENU ATTIVO                   */
/* ============================= */
function setActiveMenu(brand) {
    document.querySelectorAll(".menu a").forEach(link => {
        const href = link.getAttribute("href");
        if ((brand === "marvel" && href.includes("marvel")) || (brand === "dc" && href.includes("dc"))) {
            link.classList.add("active");
        }
    });
}

/* ============================= */
/* UTILS                         */
/* ============================= */
function slugify(text) {
    return text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}