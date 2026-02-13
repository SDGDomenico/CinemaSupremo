/* ============================= */
/* MENU HAMBURGER MOBILE         */
/* ============================= */
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const menu = document.querySelector(".menu");

    if (!hamburger || !menu) return;

    const toggleMenu = () => {
        menu.classList.toggle("show");
        hamburger.classList.toggle("active");
    };

    hamburger.addEventListener("click", toggleMenu);

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (menu.classList.contains("show")) toggleMenu();
        });
    });
});