// components/titleComponent.js
import { globalState } from '../../reactive/state.js';

export function createTitleComponent() {
  const titleElement = document.createElement('h1');
  const titleText = globalState.getState().reportTitle || 'Default Report Title';
  const scaleRatio = globalState.getState().scaleRatio || 1; // Default to 1 if not set
  
  titleElement.innerText = titleText;
  titleElement.classList.add('report-title'); // Ensure this class is set in the CSS

  // Temporarily append to measure original CSS values
  document.body.appendChild(titleElement);
  const computedStyles = getComputedStyle(titleElement);

  // Retrieve and scale the computed CSS values
  const baseFontSize = parseFloat(computedStyles.fontSize);
  const baseMarginTop = parseFloat(computedStyles.marginTop);
  const baseMarginBottom = parseFloat(computedStyles.marginBottom);

  titleElement.style.fontSize = `${baseFontSize * scaleRatio}px`;
  titleElement.style.marginTop = `${baseMarginTop * scaleRatio}px`;
  titleElement.style.marginBottom = `${baseMarginBottom * scaleRatio}px`;

  // Remove from document once measurements are applied
  document.body.removeChild(titleElement);

  return titleElement;
}
