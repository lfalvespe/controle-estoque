document.addEventListener('DOMContentLoaded', function () {
  const burger = document.getElementById('navbar-burger');
  const navMenu = document.getElementById('navbar-menu');
  const navbar = document.querySelector('.navbar');

  if (burger && navMenu) {
    burger.addEventListener('click', function (e) {
      // Evita propagação para outros botões próximos
      e.stopPropagation();
      navMenu.classList.toggle('active');
      burger.classList.toggle('active');
      // Atualiza aria-label e aria-expanded para acessibilidade
      const isOpen = burger.classList.contains('active');
      if (navbar) {
        navbar.classList.toggle('menu-open', isOpen);
      }
      burger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
});
