// components/titleComponent.js
import { globalState } from '../../reactive/state.js';

export function createTitleComponent(titleText) {
    const titleElement = document.createElement('h1');
    titleElement.innerText = titleText || globalState.getState().reportTitle || 'Default Report Title';
    titleElement.style.fontSize = '24px';
    titleElement.style.fontWeight = 'bold';
    titleElement.style.margin = '20px 0';

    return titleElement; // Ensure only the DOM Node is returned
}
