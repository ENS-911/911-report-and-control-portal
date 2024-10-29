export function FormLayout({ title, children }) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = ''; // Clear previous content
  
    const formContainer = document.createElement('div');
    formContainer.style.width = '90%';
    formContainer.style.margin = '0 auto';
    formContainer.style.aspectRatio = '8.5 / 11';
    formContainer.style.border = '1px solid #ccc';
    formContainer.style.backgroundColor = '#fff';
    formContainer.style.padding = '20px';
    formContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
  
    const header = document.createElement('h1');
    header.textContent = title;
    formContainer.appendChild(header);
  
    // Create a placeholder for children
    const contentArea = document.createElement('div');
    contentArea.id = 'formContentArea';  // Assign an ID to dynamically load content later
    formContainer.appendChild(contentArea);
  
    contentBody.appendChild(formContainer);
}
