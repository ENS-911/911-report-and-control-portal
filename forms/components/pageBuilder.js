// pageBuilder.js
import { getPageDimensions } from '../formUtils/dpiUtils.js';
import { globalState } from '../../reactive/state.js';

export function scaleComponent(element, scaleRatio) {
    element.style.transform = `scale(${scaleRatio})`;
    element.style.transformOrigin = 'top left';
}

export function renderPages(pages) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = ''; // Clear previous content

    // Ensure the container is in the DOM before measuring
    requestAnimationFrame(() => {
        const containerWidth = 0.9 * contentBody.offsetWidth;
        const { width, height } = getPageDimensions(containerWidth);

        pages.forEach((page, pageIndex) => {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'page';
            pageContainer.style.width = `${width}px`;
            pageContainer.style.height = `${height}px`;
            pageContainer.style.position = 'relative';

            page.forEach((contentItem) => {
                pageContainer.appendChild(contentItem.element);
            });

            contentBody.appendChild(pageContainer);
        });

        // Select all table elements in all pages and apply scaling
        const tables = document.querySelectorAll("table.report-table");
        const scaleRatio = globalState.getState().scaleRatio;
        tables.forEach((table, index) => {
            scaleTableComponent(table, scaleRatio);
            console.log(`Scaled table ${index + 1} with scale ratio: ${scaleRatio}`);
        });

        console.log("Rendered pages with adjusted width and maintained aspect ratio.");
    });
}

export function scaleTableComponent(table, scaleRatio) {
    if (!table || !(table instanceof HTMLElement)) {
        console.error("Invalid or missing table component for scaling");
        return;
    }
    
    console.log("Scaling table component with scaleRatio:", scaleRatio);

    // Scale header font-size and padding
    const headerCells = table.querySelectorAll("th");
    headerCells.forEach((headerCell, index) => {
        const baseFontSize = parseFloat(getComputedStyle(headerCell).fontSize);
        const basePadding = parseFloat(getComputedStyle(headerCell).padding);
        if (baseFontSize) {
            headerCell.style.fontSize = `${baseFontSize * scaleRatio}px`;
        }
        if (basePadding) {
            headerCell.style.padding = `${basePadding * scaleRatio}px`;
        }
        console.log(`Scaling header cell ${index} font-size to: ${headerCell.style.fontSize}, padding to: ${headerCell.style.padding}`);
    });

    // Scale row font-size and padding
    const rowCells = table.querySelectorAll("td");
    rowCells.forEach((rowCell, index) => {
        const baseFontSize = parseFloat(getComputedStyle(rowCell).fontSize);
        const basePadding = parseFloat(getComputedStyle(rowCell).padding);
        if (baseFontSize) {
            rowCell.style.fontSize = `${baseFontSize * scaleRatio}px`;
        }
        if (basePadding) {
            rowCell.style.padding = `${basePadding * scaleRatio}px`;
        }
        console.log(`Scaling row cell ${index} font-size to: ${rowCell.style.fontSize}, padding to: ${rowCell.style.padding}`);
    });
}
