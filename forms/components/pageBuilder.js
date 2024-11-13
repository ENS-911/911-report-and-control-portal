// pageBuilder.js
import { globalState } from '../../reactive/state.js';
import { getPageDimensions, calculateAndSaveScaleRatio } from '../formUtils/dpiUtils.js';

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
        globalState.setState({ scaleRatio });
        const { width, height } = getPageDimensions(containerWidth);

        pages.forEach((page, pageIndex) => {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'page';
            pageContainer.style.width = `${width}px`;
            pageContainer.style.height = `${height}px`;
            pageContainer.style.position = 'relative';

            page.forEach((contentItem) => {
                const isTitle = contentItem.element.classList.contains('report-title');
                pageContainer.appendChild(contentItem.element);
            });

            contentBody.appendChild(pageContainer);
        });

        console.log("Rendered pages with adjusted width and maintained aspect ratio.");
    });
}

export function scaleTableComponent(tableComponent, scaleRatio) {
    if (!tableComponent || !(tableComponent instanceof HTMLElement)) {
        console.error("Invalid or missing table component for scaling");
        return;
    }
    
    console.log("Scaling table component with scaleRatio:", scaleRatio);

    // Scale header font-size
    const headerCells = tableComponent.querySelectorAll("th");
    if (headerCells.length === 0) {
        console.warn("No header cells found to scale.");
    } else {
        headerCells.forEach((headerCell, index) => {
            const baseFontSize = parseFloat(getComputedStyle(headerCell).fontSize);
            if (baseFontSize) {
                headerCell.style.fontSize = `${baseFontSize * scaleRatio}px`;
                console.log(`Scaling header cell ${index} font-size to:`, headerCell.style.fontSize);
            }
        });
    }

    // Scale row font-size, padding, and margin
    const rowCells = tableComponent.querySelectorAll("td");
    if (rowCells.length === 0) {
        console.warn("No row cells found to scale.");
    } else {
        rowCells.forEach((rowCell, index) => {
            const baseFontSize = parseFloat(getComputedStyle(rowCell).fontSize);
            if (baseFontSize) {
                rowCell.style.fontSize = `${baseFontSize * scaleRatio}px`;
                console.log(`Scaling row cell ${index} font-size to:`, rowCell.style.fontSize);
            }

            const basePadding = parseFloat(getComputedStyle(rowCell).padding);
            if (basePadding) {
                rowCell.style.padding = `${basePadding * scaleRatio}px`;
                console.log(`Scaling row cell ${index} padding to:`, rowCell.style.padding);
            }

            const baseMargin = parseFloat(getComputedStyle(rowCell).margin);
            if (baseMargin) {
                rowCell.style.margin = `${baseMargin * scaleRatio}px`;
                console.log(`Scaling row cell ${index} margin to:`, rowCell.style.margin);
            }
        });
    }
}
