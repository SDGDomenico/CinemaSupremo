/* ============================= */
/* CONFIG BASE                   */
/* ============================= */
const brand = document.body.dataset.brand;
const container = document.getElementById("releases-container");

/* ============================= */
/* FETCH DATI E INIZIALIZZA      */
/* ============================= */
fetch(`data/${brand}.json`)
    .then(res => res.json())
    .then(data => {
        setHero(data);

        const groupedByYear = groupByYear(data.releases);

        renderReleases(groupedByYear);

        initFilters();
    })
    .catch(err => console.error("Errore nel fetch dei dati:", err));

/* ============================= */
/* HERO                          */
/* ============================= */
function setHero(data) {
    document.getElementById("hero-title").textContent = data.heroTitle;
    document.getElementById("hero-text").textContent = data.heroText;
}

/* ============================= */
/* RAGGRUPPA RELEASES PER ANNO   */
/* ============================= */
function groupByYear(releases) {
    const grouped = {};

    releases.forEach(item => {
        if (!grouped[item.year]) grouped[item.year] = [];
        grouped[item.year].push(item);
    });

    return grouped;
}

/* ============================= */
/* RENDER RELEASES NEL DOM       */
/* ============================= */
function renderReleases(grouped) {
    Object.keys(grouped)
        .sort((a, b) => a - b)
        .forEach(year => {
            const group = document.createElement("div");
            group.className = "year-group";
            group.innerHTML = `<h2>Anno ${year}</h2>`;

            grouped[year].forEach(item => {
                group.innerHTML += createCard(item);
            });

            container.appendChild(group);
        });
}

/* ============================= */
/* TEMPLATE CARD                 */
/* ============================= */
function createCard(item) {
    return `
        <a
            href="project?brand=${brand}&type=${item.type}&title=${slugify(item.title)}"
            class="card"
            data-type="${item.type}"
        >
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>${item.format} - ${item.date}</p>
        </a>
    `;
}

/* ============================= */
/* FILTRI                        */
/* ============================= */
function initFilters() {
    const buttons = document.querySelectorAll(".filters button");
    const yearGroups = document.querySelectorAll(".year-group");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const filter = btn.dataset.filter;

            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            yearGroups.forEach(group => {
                const cards = group.querySelectorAll(".card");
                let visibleCount = 0;

                cards.forEach(card => {
                    const type = card.dataset.type;
                    if (filter === "all" || type === filter) {
                        card.style.display = "block";
                        visibleCount++;
                    } else {
                        card.style.display = "none";
                    }
                });

                group.style.display = visibleCount === 0 ? "none" : "grid";
            });
        });
    });
}

/* ============================= */
/* UTILS                         */
/* ============================= */
function slugify(text) {
    return text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}