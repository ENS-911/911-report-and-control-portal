window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('popstate', handleRouteChange);

const routeConfig = {
  home: { module: 'home', title: 'Home' },
  reports: { module: 'reports', title: 'Reports' },
  reportBuilder: { module: 'reportBuilder', title: 'Report Builder' },
  editPublicFeed: { module: 'editPublicFeed', title: 'Edit Public Feed' },
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

// Initialize the app's routing
document.addEventListener('DOMContentLoaded', handleRouteChange);
