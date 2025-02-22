// pageBuilder.js
import { globalState } from '../../reactive/state.js';

/**
 * Renders all report pages by appending them to the #contentBody container.
 * @param {Array<HTMLElement>} pages - The array of report page elements to render.
 */
export function renderPages(pages) {
    const reportContainer = document.getElementById('contentBody');
    if (!reportContainer) {
        console.error('Report container not found.');
        return;
    }

    // Clear existing content
    reportContainer.innerHTML = '';

    // Append each page to the report container
    pages.forEach((page, index) => {
        // Optional: Assign a unique ID or data attribute for each page
        page.setAttribute('data-page-number', index + 1);
        reportContainer.appendChild(page);
        console.log(`Appended Page ${index + 1} to reportContainer.`);
    });

    console.log(`Rendered ${pages.length} pages.`);
}

export function scaleTableComponent(table, scaleRatio) {
    if (!table || !(table instanceof HTMLElement)) {
        console.error("Invalid or missing table component for scaling");
        return;
    }

    console.log("Scaling table component with scaleRatio:", scaleRatio);

    if (!table || !(table instanceof HTMLElement) || table.hasAttribute('data-scaled')) return; // Prevent double scaling

    table.setAttribute('data-scaled', 'true');

    // Scale header and row cells
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
    });

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
    });
}

export function applyColumnWidths(table, columnWidths) {
    const headerCells = table.querySelectorAll("th");
    const rowCells = table.querySelectorAll("tr");

    headerCells.forEach((headerCell, index) => {
        if (columnWidths[index]) {
            headerCell.style.width = `${columnWidths[index]}px`;
        }
    });

    rowCells.forEach((row) => {
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, index) => {
            if (columnWidths[index]) {
                cell.style.width = `${columnWidths[index]}px`;
            }
        });
    });
}

export function captureColumnWidths(table) {
    const columnWidths = [];
    const headerCells = table.querySelectorAll("th");

    headerCells.forEach((headerCell) => {
        columnWidths.push(headerCell.offsetWidth);
    });

    return columnWidths;
}
