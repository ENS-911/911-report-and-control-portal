window.stageJsImported = true

import { handleRouteChange } from './navigation/routes.js'
import { loadRoleBasedFeatures } from './reactive/load.js'
import { globalState } from './reactive/state.js'
import { fetchClientData } from './api/clientData.js'
import { fetchMainData } from './api/mainData.js'
import { generateNavigation } from './navigation/nav.js'

removeElementById('loginForm')

const setStage = document.getElementById('contentBody')
const setTitle = document.getElementById('pageTitle')

function clearAndSetInitialContent() {
  // Clear previous content
  setStage.innerHTML = ''
}

async function initStage() {
  await loadRoleBasedFeatures(userData)
  try {
    const clientData = await fetchClientData()
    const mainData = await fetchMainData()

    // Use setState to update the global state
    globalState.setState({ clientData, mainData })

    // Example: log the updated state
    console.log('Updated state:', globalState.getState())
  } catch (error) {
    console.error('Failed to initialize stage:', error)
  }
}

async function loadHomePage() {
  try {
    clearAndSetInitialContent()
    // Dynamically import the home module
    const homeModule = await import('./pages/home.js')
    if (homeModule && homeModule.loadPage) {
      homeModule.loadPage(setStage) // Pass `setStage` if you want to manipulate it directly from `home.js`
    }
  } catch (error) {
    console.error('Error loading home page:', error)
  }
  handleRouteChange()
}

async function initApp() {
  if (isAuthenticated()) {
    clearAndSetInitialContent() // Clear previous content
    generateNavigation(userData.role) // Set up navigation based on the user's role
    // No need to preemptively loadHomePage here if handleRouteChange handles initial content loading
  } else {
    console.log('User not authenticated')
    generateLoginForm() // Show login form or redirect
  }
  handleRouteChange() // Ensure this is called to handle routing based on the current hash
}

function isAuthenticated() {
  const token = localStorage.getItem('jwtToken')
  return token && isJwtValid(token)
}

function isJwtValid(token) {
  // Simplified validation logic
  // Implement actual JWT validation here
  checkAuthAndInitialize()
  return true
}

function checkAuthAndInitialize() {
  const token = localStorage.getItem('jwtToken')
  if (token && window.isJwtValid(token)) {
    // JWT is valid, proceed with initialization
    console.log('JWT is valid. Initializing application...')
    // Initialize your application here
  } else {
    console.log('JWT is not valid. Please log in.')
    // Handle unauthenticated scenario
    generateLoginForm()
  }
}

initApp()
initStage()

/*globalState.subscribe(() => {
  const currentRoute = window.location.hash.replace('#', '')
  if (currentRoute !== 'home') {
    handleRouteChange() // Call only if the current route is not 'home'
  }
})*/

console.log(localStorage.getItem('user'))
