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

    // Scale header font-size, top/bottom padding
    const headerCells = table.querySelectorAll("th");
    headerCells.forEach((headerCell, index) => {
        const computedStyles = getComputedStyle(headerCell);
        const baseFontSize = parseFloat(computedStyles.fontSize);
        const basePaddingTop = parseFloat(computedStyles.paddingTop);
        const basePaddingBottom = parseFloat(computedStyles.paddingBottom);

        if (baseFontSize) {
            headerCell.style.fontSize = `${parseFloat(baseFontSize * scaleRatio - (scaleRatio / 10)).toFixed(0)}px`;
        }
        if (basePaddingTop) {
            headerCell.style.paddingTop = `${parseFloat(basePaddingTop * scaleRatio - (scaleRatio / 10)).toFixed(0)}px`;
        }
        if (basePaddingBottom) {
            headerCell.style.paddingBottom = `${parseFloat(basePaddingBottom * scaleRatio - (scaleRatio / 10)).toFixed(0)}px`;
        }

        console.log(`Scaling header cell ${index} font-size to: ${headerCell.style.fontSize}, paddingTop to: ${headerCell.style.paddingTop}, paddingBottom to: ${headerCell.style.paddingBottom}`);
    });

    // Scale row font-size, padding, and border width
    const rowCells = table.querySelectorAll("td");
    rowCells.forEach((rowCell, index) => {
        const computedStyles = getComputedStyle(rowCell);
        const baseFontSize = parseFloat(computedStyles.fontSize);
        const basePaddingTop = parseFloat(computedStyles.paddingTop);
        const basePaddingBottom = parseFloat(computedStyles.paddingBottom);

        if (baseFontSize) {
            rowCell.style.fontSize = `${parseFloat(baseFontSize * scaleRatio - (scaleRatio / 10)).toFixed(0)}px`;
        }
        if (basePaddingTop) {
            rowCell.style.paddingTop = `${parseFloat(basePaddingTop * scaleRatio - (scaleRatio / 10)).toFixed(0)}px`;
        }
        if (basePaddingBottom) {
            rowCell.style.paddingBottom = `${parseFloat(basePaddingBottom * scaleRatio - (scaleRatio / 10)).toFixed(0)}px`;
        }

        console.log(`Scaling row cell ${index} font-size to: ${rowCell.style.fontSize}, paddingTop to: ${rowCell.style.paddingTop}, paddingBottom to: ${rowCell.style.paddingBottom}, borderWidth to: ${rowCell.style.borderWidth}`);
    });
}
