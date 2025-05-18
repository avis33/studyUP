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
// Funzione per generare avatar colorati basati sulle iniziali
export function getAvatarColor(name) {
  const colors = [
    "#4361ee",
    "#3f37c9",
    "#4895ef",
    "#4cc9f0",
    "#4895ef",
    "#3a0ca3",
    "#7209b7",
    "#b5179e",
    "#f72585",
    "#560bad",
    "#480ca8",
    "#3a0ca3",
  ];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const colorIndex = initials.charCodeAt(0) % colors.length;
  return {
    initials: initials.substring(0, 2),
    color: colors[colorIndex],
  };
}

//Funzione per calcolare l'età
export function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
