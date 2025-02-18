import { checkUserLoginStatus } from '../helpers/checkUserLoginStatus.js'

window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('popstate', handleRouteChange);

const routeConfig = {
  home: { module: 'home', title: 'Home' },
  reports: { module: 'reports', title: 'Reports' },
  reportBuilder: { module: 'reportBuilder', title: 'Report Builder' },
  editPublicFeed: { module: 'editPublicFeed', title: 'Edit Public Feed' },
  editDataFeed: { module: 'editDataFeed', title: 'Edit Data Feed' },
};

function updatePageTitle(newTitle) {
  const pageTitleElement = document.getElementById('pageTitle');
  if (pageTitleElement) {
    pageTitleElement.innerText = newTitle;
  }
}

export function handleRouteChange(event) {
  const path = window.location.hash.replace('#', '') || 'home';
  const route = routeConfig[path] || { module: null, title: 'Page Not Found' };

  if (route.module) {
    loadModule(route.module);
  } else {
    console.log('Page not found');
    // Optionally load a default module or show an error message
  }

  updatePageTitle(route.title);
  updateSideMenu(path);
}

async function loadModule(modulePath) {
  try {
    const module = await import(`../pages/${modulePath}.js`);
    if (module && module.loadPage) {
      module.loadPage(); // Assuming each module exports a loadPage function
    }
  } catch (error) {
    console.error(`Failed to load module: ${modulePath}`, error);
    document.getElementById('contentBody').innerHTML = '<p>Error loading page</p>';
  }
}

// Navigate to a new page without reloading
export function navigateToPage(page) {
  const state = { page };
  history.pushState(state, `Page ${page}`, `#${page}`);
  handleRouteChange();
}

function updateSideMenu(currentPage) {
  const menuContent = document.getElementById('menuContent');
  if (!menuContent) return;

  menuContent.innerHTML = ''; // Clear the menu

  const isLoggedIn = checkUserLoginStatus();

  if (!isLoggedIn) {
    menuContent.innerHTML = `
      <ul>
        <li><a href="#documentation">ENS Documentation</a></li>
        <li><a href="#adminHelp">Super Admin Login Help</a></li>
      </ul>
    `;
    return;
  }

  // Define submenu for Edit Public Feed and its subpages
  const editPublicFeedPages = ['editPublicFeed', 'editDataFeed', 'editWebsiteStyles'];
  const isInEditPublicFeed = editPublicFeedPages.includes(currentPage);

  if (isInEditPublicFeed) {
    const ul = document.createElement('ul');

    // Public Feed Home link (always at the top)
    const homeLi = document.createElement('li');
    const homeA = document.createElement('a');
    homeA.href = '#editPublicFeed';
    homeA.textContent = 'Public Feed Home';

    if (currentPage === 'editPublicFeed') {
      homeA.classList.add('active-submenu');
      homeA.innerHTML = `➤ Public Feed Home`; // Add arrow indicator
    }

    homeA.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage('editPublicFeed');
    });

    homeLi.appendChild(homeA);
    ul.appendChild(homeLi);

    // Submenu items
    const menuItems = [
      { href: 'editDataFeed', text: 'Edit Data Feed' },
      { href: 'editWebsiteStyles', text: 'Edit Website Styles' }
    ];

    menuItems.forEach(({ href, text }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${href}`;
      a.textContent = text;

      if (currentPage === href) {
        a.classList.add('active-submenu');
        a.innerHTML = `➤ ${text}`;
      }

      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage(href);
      });

      li.appendChild(a);
      ul.appendChild(li);
    });

    menuContent.appendChild(ul);
  }
}

// Initialize the app's routing
document.addEventListener('DOMContentLoaded', handleRouteChange);
