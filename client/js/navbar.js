const profileIcon = document.querySelector('.user-area');
const profileMenu = document.querySelector('.profile-menu');

profileIcon?.addEventListener('click', () => {
  profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload(); // o redirect a home
  });
  