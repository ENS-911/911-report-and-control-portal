// tableComponent.js

import { globalState } from "../../reactive/state.js";

/**
 * Creates and returns a table component using a single row-height measurement
 * for pagination instead of measuring each row individually.
 *
 * @param {PageController} pageController - The PageController instance for managing pages.
 */
export async function createTableComponent(pageController) {
    const data = globalState.getState().reportData || [];

    // If there's no data, display a simple message.
    if (!Array.isArray(data) || data.length === 0) {
        const emptyContainer = document.createElement('div');
        emptyContainer.className = 'report-table empty';
        emptyContainer.textContent = 'No data available for the table.';
        await pageController.addContentToPage(emptyContainer);
        return;
    }

    // Define column widths (ensure they sum to 100%)
    const columnWidths = ['15%', '15%', '20%', '30%', '20%'];

    // Create header for each table
    function createHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Agency Type', 'Battalion', 'Creation Date', 'Premise', 'Description'];

        headers.forEach((headerText, index) => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.width = columnWidths[index]; // Set column width
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        return thead;
    }

    // Create a <colgroup> to define column widths
    function createColGroup() {
        const colgroup = document.createElement('colgroup');
        columnWidths.forEach(width => {
            const col = document.createElement('col');
            col.style.width = width;
            colgroup.appendChild(col);
        });
        return colgroup;
    }

    /**
     * Creates a new table (with colgroup and header) and appends it to the current page.
     * Returns the <tbody> so we can add rows to it.
     */
    async function startNewTable() {
        const table = document.createElement('table');
        table.classList.add('report-table');
        table.style.width = '100%';
        table.style.tableLayout = 'fixed'; // Ensure fixed layout for uniform columns

        // Append colgroup and header
        table.appendChild(createColGroup());
        table.appendChild(createHeader());

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        // Add this table to the current page
        await pageController.addContentToPage(table);
        console.log("Started new table with header.");
        return tbody;
    }

    // Start our first table
    let tbody = await startNewTable();

    // ----------------------------------------------------------------------
    // STEP 1: Measure the FIRST row to determine rowHeight for all other rows
    // ----------------------------------------------------------------------
    const firstItem = data[0];
    const firstRow = document.createElement('tr');

    populateRow(firstRow, firstItem);
    tbody.appendChild(firstRow);

    // Wait for the row to render to measure its height
    await pageController.waitForRender();
    await pageController.waitForRender();

    const firstRowHeight = firstRow.getBoundingClientRect().height;
    console.log('Measured first-row height:', firstRowHeight);

    // Track used space for this first row
    pageController.addHeightToCurrentPage(firstRowHeight);

    // ----------------------------------------------------------------------
    // STEP 2: Add the remaining rows using the same rowHeight
    // ----------------------------------------------------------------------
    for (let index = 1; index < data.length; index++) {
        const item = data[index];
        const row = document.createElement('tr');
        populateRow(row, item);

        // Check if adding another row would exceed available space
        if (pageController.getUsedSpaceOnPage() + firstRowHeight > pageController.getAvailableSpace()) {
            // Remove the row from the current table
            // (We haven't appended it yet, so no need to remove it)
            // Start a new page
            await pageController.startNewPage();
            // Create a new table
            tbody = await startNewTable();
            // The used space on the new page is reset, so we track from 0 again
        }

        // Now we can append the row to the current table
        tbody.appendChild(row);

        // Instead of measuring row, reuse firstRowHeight
        pageController.addHeightToCurrentPage(firstRowHeight);
    }

    console.log("Completed table rendering with single-row height approach.");
}

/**
 * Populates a <tr> with cells based on the given item fields.
 * Adjust the keys as needed for your data structure.
 */
function populateRow(row, item) {
    const fields = ['agency_type', 'battalion', 'creation', 'premise', 'type_description'];
    fields.forEach((field) => {
        const cell = document.createElement('td');
        if (field === 'creation') {
            cell.textContent = new Date(item[field]).toLocaleString();
        } else {
            cell.textContent = item[field];
        }
        row.appendChild(cell);
    });
}
