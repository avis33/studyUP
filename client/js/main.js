//per la faq
document.addEventListener("DOMContentLoaded", function () {
    const questions = document.querySelectorAll('.faq-question');
  
    questions.forEach(button => {
      button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        answer.classList.toggle('open');
      });
    });
  });