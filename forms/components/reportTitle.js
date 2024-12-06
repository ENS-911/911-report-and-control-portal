// reportTitle.js

/**
 * Creates and returns a DOM element representing the report title.
 * Utilizes semantic HTML and CSS classes for styling.
 * @param {string} titleText - The text content for the report title. Defaults to 'Default Report Title'.
 * @returns {HTMLElement} - The `<h1>` element containing the report title.
 */
export function createTitleComponent(titleText = 'Default Report Title') {
  // Create the title element
  const title = document.createElement('h1');
  
  // Assign CSS class for styling
  title.className = 'report-title';
  
  // Set the text content of the title
  title.textContent = titleText;
  
  // Enhance accessibility by setting appropriate attributes
  title.setAttribute('role', 'heading');
  title.setAttribute('aria-level', '1');
  
  return title;
}
