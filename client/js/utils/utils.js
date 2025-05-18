// Funzione per generare le stelle
export function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += `<span class="star full">&#9733;</span>`;
  }
  if (halfStar) {
    html += `<span class="star half">&#9733;</span>`;
  }
  for (let i = 0; i < emptyStars; i++) {
    html += `<span class="star empty">&#9733;</span>`;
  }
  return html;
}
// Funzione per ottenere la data di oggi
export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

