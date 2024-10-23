// To change the current URL without reloading the page.
history.pushState({ page: 1 }, 'title 1', '?page=1')

// Reacting to back/forward navigation
window.onpopstate = function (event) {
  if (event.state) {
    // Update your page's content based on event.state
    console.log('state: ', event.state)
  }
}

// Saving data to localStorage
localStorage.setItem('myData', JSON.stringify(myData))

// Retrieving data from localStorage
const myData = JSON.parse(localStorage.getItem('myData'))

// Remember to handle the case where myData is null because it hasn't been set yet.

// Example of navigating to a new "page" without reload
function navigate(page) {
  const state = { page: page }
  history.pushState(state, `Page ${page}`, `?page=${page}`)
  localStorage.setItem('currentPage', JSON.stringify(state))
  updateContentBasedOnPage(page)
}

// On page load or refresh, check localStorage
window.onload = function () {
  const savedState = JSON.parse(localStorage.getItem('currentPage'))
  if (savedState) {
    updateContentBasedOnPage(savedState.page)
  }
}

// React to back/forward navigation
window.onpopstate = function (event) {
  if (event.state) {
    updateContentBasedOnPage(event.state.page)
  } else {
    // Fallback or default content
    updateContentBasedOnPage(defaultPage)
  }
}

function updateContentBasedOnPage(page) {
  // Update your page content based on the given page identifier
}
