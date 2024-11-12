// pageBuilder.js
import { getSystemDPI, getPageDimensions, calculateAndSaveScaleRatio } from '../formUtils/dpiUtils.js';

const scaleRatio = calculateScalingRatio();

export function calculateScalingRatio(customWidth) {
    const dpi = getSystemDPI();
    const actualWidthInInches = customWidth / dpi;
    return actualWidthInInches / 8.5; // Calculate based on 8.5 inches
}

export function scaleComponent(element, scaleRatio) {
    element.style.transform = `scale(${scaleRatio})`;
    element.style.transformOrigin = 'top left';
}

export function renderPages(pages) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = ''; // Clear previous content

    // Ensure the container is in the DOM before measuring
    requestAnimationFrame(() => {
        const containerWidth = 0.9 * contentBody.offsetWidth; // Adjust for 90% width
        const scaleRatio = calculateAndSaveScaleRatio(containerWidth);
        const { width, height } = getPageDimensions(containerWidth);

        pages.forEach((page, pageIndex) => {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'page';
            pageContainer.style.width = `${width}px`;
            pageContainer.style.height = `${height}px`;
            pageContainer.style.position = 'relative';

            page.forEach((contentItem) => {
                const isTitle = contentItem.element.classList.contains('report-title');
            
            if (isTitle && pageIndex === 0) { // Only add the title to the first page
                contentItem.element.style.position = 'absolute';
                contentItem.element.style.top = '0';
            }
                // Optionally, apply scaling to each component if needed
                scaleComponent(contentItem.element, scaleRatio);
                pageContainer.appendChild(contentItem.element);
            });

            contentBody.appendChild(pageContainer);
        });

        console.log("Rendered pages with adjusted width and maintained aspect ratio.");
    });
}