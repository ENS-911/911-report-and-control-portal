import { navigateToPage } from './routes.js';

function createNavLink(href, text) {
  const link = document.createElement('a');
  link.href = `#${href}`; // Using hash for client-side routing
  link.textContent = text;
  link.className = 'dropLink';

  link.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenuBox();
    linkClicked(); // Add meaningful behavior here
    navigateToPage(href); // Leverage the routing system for navigation
  });

  return link;
}

export function generateNavigation(permissionLevel) {
  const menuBox = document.getElementById('menu-box');
  const links = getLinksByPermission(permissionLevel); // Permission-based links

  links.forEach(({ href, text }) => {
    const link = createNavLink(href, text);
    menuBox.appendChild(link);
  });
}

function getLinksByPermission(permissionLevel) {
  const baseLinks = [
    { href: 'home', text: 'Home' },
    { href: 'reports', text: 'Reports' },
  ];

  if (permissionLevel === 'admin') {
    baseLinks.push({ href: 'page2', text: 'Page 2' });
    // Add more admin-specific links
  }

  return baseLinks;
}
