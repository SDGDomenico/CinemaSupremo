const brand = document.body.dataset.brand;
const container = document.getElementById("releases-container");

fetch(`data/${brand}.json`)
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(data => {
    setHero(data);
    renderReleases(groupByYear(data.releases));
    initFilters();
  })
  .catch(err => console.error("Errore nel caricamento dati:", err));

function setHero(data) {
  const title = document.getElementById("hero-title");
  const text = document.getElementById("hero-text");
  if (title) title.textContent = data.heroTitle;
  if (text) text.textContent = data.heroText;
}

function groupByYear(releases) {
  return releases.reduce((acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  }, {});
}

function renderReleases(grouped) {
  Object.keys(grouped)
    .sort((a, b) => a - b)
    .forEach((year, index) => {
      const group = document.createElement("div");
      group.className = "year-group";
      group.style.animationDelay = `${index * 60}ms`;
      group.innerHTML = `<h2>${year}</h2>`;
      grouped[year].forEach(item => { group.innerHTML += createCard(item); });
      container.appendChild(group);
    });
}

function createCard(item) {
  return `
    <a
      href="detail?brand=${brand}&type=${item.type}&title=${slugify(item.title)}"
      class="card"
      data-type="${item.type}"
      aria-label="${item.title} — ${item.format}"
    >
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <h3>${item.title}</h3>
      <p>${item.format} · ${item.date}</p>
    </a>
  `;
}

function initFilters() {
  const buttons = document.querySelectorAll(".filters button");
  const yearGroups = document.querySelectorAll(".year-group");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      buttons.forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      yearGroups.forEach(group => {
        const cards = group.querySelectorAll(".card");
        let visible = 0;
        cards.forEach(card => {
          const match = filter === "all" || card.dataset.type === filter;
          card.style.display = match ? "block" : "none";
          if (match) visible++;
        });
        group.style.display = visible === 0 ? "none" : "";
      });
    });
  });
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}