// components/titleComponent.js
import { getSystemDPI } from '../formUtils/dpiUtils.js';
import { globalState } from '../../reactive/state.js';

export function createTitleComponent() {
  const titleElement = document.createElement('h1');
  titleElement.innerText = globalState.getState().reportTitle || 'Default Report Title';
  titleElement.style.fontSize = '24px';
  titleElement.style.fontWeight = 'bold';
  titleElement.style.margin = '20px 0';

  // Append to hidden measurement area for height calculation
  const measurementArea = document.getElementById('reportMeasurementArea');
  measurementArea.appendChild(titleElement);

  // Calculate height in inches based on system DPI
  const systemDPI = getSystemDPI();
  const titleHeightInInches = titleElement.offsetHeight / systemDPI;

  // Clean up measurement area after calculation
  measurementArea.innerHTML = '';

  return { element: titleElement, height: titleHeightInInches };
}
