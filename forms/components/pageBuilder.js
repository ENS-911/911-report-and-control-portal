// pageBuilder.js
import { getSystemDPI } from '../formUtils/dpiUtils.js';

export function calculateScalingRatio() {
    const dpi = getSystemDPI();
    const screenWidth = document.getElementById('contentBody').offsetWidth;
    const actualWidthInInches = screenWidth / dpi;
    return actualWidthInInches / 8.5; // Calculate the scaling ratio based on 8.5 inches
}

export function scaleComponent(element, scaleRatio) {
    element.style.transform = `scale(${scaleRatio})`;
    element.style.transformOrigin = 'top left';
}

export function renderPages(pages) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = '';

    const scaleRatio = calculateScalingRatio();

    pages.forEach((page, index) => {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page';
        pageContainer.style.width = '8.5in'; // Set true size for print/PDF
        pageContainer.style.height = '11in';

        page.forEach((contentItem) => {
            scaleComponent(contentItem.element, scaleRatio); // Scale each element
            pageContainer.appendChild(contentItem.element);
        });

        contentBody.appendChild(pageContainer);
    });

    console.log("Final structured pages data:", pages);
}
