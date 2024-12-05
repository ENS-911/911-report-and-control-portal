// formUtils/measurementUtils.js
import { globalState } from '../../reactive/state.js';

const measurementArea = document.getElementById('reportMeasurementArea');

export async function measureComponentHeight(element) {
    if (!measurementArea) {
        console.error('Measurement area container not found.');
        return 0;
    }

    // Clone the element to prevent mutations in the actual report
    const clonedElement = element.cloneNode(true);
    measurementArea.appendChild(clonedElement);

    // Wait for the browser to render styles
    const height = await new Promise((resolve) => {
        requestAnimationFrame(() => {
            const measuredHeight = clonedElement.offsetHeight;
            // Clean up: Remove the cloned element after measurement
            measurementArea.removeChild(clonedElement);
            resolve(measuredHeight);
        });
    });

    return height;
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
