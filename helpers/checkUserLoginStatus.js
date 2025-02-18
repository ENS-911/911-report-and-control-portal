export function checkUserLoginStatus() {
    const token = localStorage.getItem('jwtToken');
    return token && isJwtValid(token); // Ensure the token exists and is still valid
}