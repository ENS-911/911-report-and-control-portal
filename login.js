// Function to create a form field
function createFormField(id, type, placeholder) {
  const input = document.createElement('input')
  input.type = type
  input.id = id
  input.placeholder = placeholder
  return input
}

// Function to create a form button
function createFormButton(text) {
  const button = document.createElement('button')
  button.type = 'submit'
  button.textContent = text
  return button
}

// Function to generate the login form
function generateLoginForm() {
  const setTitle = document.getElementById('pageTitle')
  setTitle.innerText = 'LOGIN'

  const form = document.createElement('form')
  form.id = 'loginForm'
  const header = document.createElement('p')
  header.className = 'formHeader'
  header.innerText =
    'Please Login To Access Your Emerge-N-See Control Suite Portal'
  form.appendChild(header)
  form.appendChild(createFormField('email', 'email', 'Username'))
  form.appendChild(createFormField('password', 'password', 'Password'))
  form.appendChild(createFormButton('Login'))

  document.getElementById('contentBody').appendChild(form)
  const errorBox = document.createElement('div')
  errorBox.id = 'errorBox'
  errorBox.style.width = '100%'
  errorBox.style.textAlign = 'center'
  errorBox.style.color = 'red'
  form.appendChild(errorBox)
  form.addEventListener('submit', handleLoginSubmit)
}

// Generate the login form when the page loads
checkJwtAndHandleAuth()

function handleLoginSubmit(event) {
  event.preventDefault() // Prevent the default form submission

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const loginData = {
    email: email,
    password: password,
  }

  fetch('https://client-control.911-ens-services.com/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.token) {
        // Store the token and possibly redirect the user
        localStorage.setItem('jwtToken', data.token)
        const uDat = JSON.stringify(data.user)
        localStorage.setItem('user', uDat)
        const returnData = localStorage.getItem('user')
        userData = JSON.parse(returnData)
        import('./stage.js')
      } else {
        // Handle login failure
        const onError = document.getElementById('errorBox')
        onError.innerText = 'Incorrect Email or Password'
      }
    })
    .catch((error) => console.error('Error during login:', error))
}

function checkJwtAndHandleAuth() {
  const token = localStorage.getItem('jwtToken')
  if (!token) {
    generateLoginForm()
  } else if (!isJwtValid(token)) {
    console.log('Session expired or user not logged in. Prompting for login...')
    removeJwt()
    promptForLogin()
  } else {
    console.log('JWT is valid.')
    checkStageJsImported()
  }
}

function isJwtValid(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const payload = JSON.parse(window.atob(base64))
  const exp = payload.exp
  const now = Date.now().valueOf() / 1000

  return typeof exp !== 'undefined' && exp > now
}

function promptForLogin() {
  alert('Your session has expired. Please log in again.')
  generateLoginForm()
}

function removeJwt() {
  localStorage.removeItem('jwtToken')
  localStorage.removeItem('user')
}
//removeJwt();

function checkStageJsImported() {
  if (window.stageJsImported) {
    console.log('`stage.js` is imported and ready.')
  } else {
    import('./stage.js')
      .then(() => {
        window.stageJsImported = true
      })
      .catch((error) => {
        console.error('Error importing `stage.js`:', error)
      })
  }
}

function removeElementById(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.remove()
  }
}
