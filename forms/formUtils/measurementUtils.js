// formUtils/measurementUtils.js
import { globalState } from '../../reactive/state.js';

const measurementArea = document.getElementById('reportMeasurementArea');

export async function measureComponentHeight(element) {
    return new Promise((resolve, reject) => {
        if (!(element instanceof HTMLElement)) {
            console.error('Invalid element provided for measurement:', element);
            return resolve(0); // Fallback to 0 height
        }

        // Clone the element to avoid modifying the original
        const clonedElement = element.cloneNode(true);
        clonedElement.style.margin = '0'; // Reset margins to avoid unexpected height
        measurementArea.appendChild(clonedElement);

        // Allow the browser to render the cloned element
        requestAnimationFrame(() => {
            const height = clonedElement.getBoundingClientRect().height;
            measurementArea.removeChild(clonedElement);

            if (isNaN(height)) {
                console.error('Measured height is NaN for element:', element);
                resolve(0); // Fallback to 0 height
            } else {
                resolve(Math.ceil(height)); // Round up to the nearest integer
            }
        });
    });
}

export async function measureFooterHeight() {
    const footer = document.querySelector('footer'); // Adjust selector as needed
    if (!footer) {
        console.warn('Footer not found.');
        return 0;
    }
    const footerHeight = await measureComponentHeight(footer);
    console.log(`Measured Footer Height: ${footerHeight}px`);
    return footerHeight;
}

export function measureTitleHeight(title) {
    const tempTitle = document.createElement('h1');
    tempTitle.textContent = title;
    tempTitle.style.visibility = 'hidden';

    measurementArea.appendChild(tempTitle);
    const titleHeight = tempTitle.offsetHeight;
    measurementArea.removeChild(tempTitle);

    return titleHeight;
}

export function getPageHeight() {
    const pageWidth = 0.9 * document.getElementById('contentBody').offsetWidth;
    const aspectRatio = 8.5 / 11;
    return pageWidth * aspectRatio;
}
