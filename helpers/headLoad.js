let userData = JSON.parse(localStorage.getItem('user'));

if (!userData) {
    console.error('No user data found in localStorage');
  } else {
    console.log('User Data Loaded:', userData);  // Debugging to verify
    window.clientID = userData.key
  }