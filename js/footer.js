(function updateFooterDates() {
    const yearSpan = document.getElementById("year");
    const updatedSpan = document.getElementById("updated-date");

    if (!yearSpan && !updatedSpan) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    if (yearSpan) yearSpan.textContent = today.getFullYear();

    if (updatedSpan) updatedSpan.textContent = formattedDate;
})();
