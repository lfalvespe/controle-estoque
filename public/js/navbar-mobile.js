document.addEventListener('DOMContentLoaded', function () {
  const burger = document.getElementById('navbar-burger');
  const navMenu = document.getElementById('navbar-menu');
  const navbar = document.querySelector('.navbar');

  const renderBurgerIcon = (isOpen) => {
    const iconContainer = burger ? burger.querySelector('.burger-icon') : null;
    if (!iconContainer) {
      return;
    }

    iconContainer.innerHTML = isOpen
      ? '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="32" height="32" rx="6" fill="var(--color-primary)"/><line x1="9" y1="9" x2="23" y2="23" stroke="white" stroke-width="2.8" stroke-linecap="round"/><line x1="23" y1="9" x2="9" y2="23" stroke="white" stroke-width="2.8" stroke-linecap="round"/></svg>'
      : '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="32" height="32" rx="6" fill="var(--color-primary)"/><line x1="7" y1="10" x2="25" y2="10" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="7" y1="16" x2="25" y2="16" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="7" y1="22" x2="25" y2="22" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>';
  };

  if (burger && navMenu) {
    renderBurgerIcon(false);

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
      renderBurgerIcon(isOpen);
      burger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
});
