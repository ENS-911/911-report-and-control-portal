// tableComponent.js

import { globalState } from "../../reactive/state.js";

/**
 * Creates and returns a table component, splitting it into multiple tables if necessary.
 * @param {PageController} pageController - The PageController instance for managing pages.
 */
export async function createTableComponent(pageController) {
    const data = globalState.getState().reportData || [];
    console.log("Data received in createTableComponent:", data);

    if (!Array.isArray(data) || data.length === 0) {
        const emptyContainer = document.createElement('div');
        emptyContainer.className = 'report-table empty';
        emptyContainer.textContent = 'No data available for the table.';
        await pageController.addContentToPage(emptyContainer);
        return;
    }

    // Define column widths (ensure they sum up to 100%)
    const columnWidths = ['15%', '15%', '20%', '30%', '20%'];

    // Create the table header element
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

    // Function to start a new table with colgroup, header, and tbody
    async function startNewTable() {
        const table = document.createElement('table');
        table.classList.add('report-table');
        table.style.width = '100%'; // Ensure inline style for 100% width
        table.style.tableLayout = 'fixed'; // Ensure fixed table layout

        // Append colgroup and header
        table.appendChild(createColGroup());
        table.appendChild(createHeader());

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        await pageController.addContentToPage(table); // Adds the complete table to the page
        console.log("Started new table with header.");
        return tbody;
    }

    let tbody = await startNewTable(); // Start with the first table

    // Iterate through each row of data and measure each dynamically
    for (let index = 0; index < data.length; index++) {
        const item = data[index];
        const row = document.createElement('tr');

        // Populate row cells
        ['agency_type', 'battalion', 'creation', 'premise', 'type_description'].forEach((field) => {
            const cell = document.createElement('td');
            cell.textContent = field === 'creation'
                ? new Date(item[field]).toLocaleString()
                : item[field];
            row.appendChild(cell);
        });

        // Append the row to the current table's tbody
        tbody.appendChild(row);

        // Wait for render to measure the row's height
        await pageController.waitForRender();
        await pageController.waitForRender();

        const rowHeight = row.getBoundingClientRect().height;
        console.log(`Row ${index + 1} height: ${rowHeight}px`);

        // Debugging: Ensure pageController has the necessary methods
        console.log("Does pageController have getUsedSpaceOnPage?", typeof pageController.getUsedSpaceOnPage === 'function');
        console.log("Does pageController have getAvailableSpace?", typeof pageController.getAvailableSpace === 'function');
        console.log("Does pageController have addHeightToCurrentPage?", typeof pageController.addHeightToCurrentPage === 'function');
        console.log("Does pageController have startNewPage?", typeof pageController.startNewPage === 'function');

        // Check if adding this row exceeds the available space on the current page
        if (pageController.getUsedSpaceOnPage() + rowHeight > pageController.getAvailableSpace()) {
            console.log(`Exceeded max page height with Row ${index + 1}. Starting new page.`);
            // Remove the row from the current table
            tbody.removeChild(row);

            // Start a new page and a new table
            await pageController.startNewPage();
            tbody = await startNewTable();

            // Add the row to the new table's tbody
            tbody.appendChild(row);

            // Wait for render
            await pageController.waitForRender();
            await pageController.waitForRender();

            const newRowHeight = row.getBoundingClientRect().height;
            console.log(`Row ${index + 1} added to new page with height: ${newRowHeight}px`);

            // Update the usedSpaceOnPage in PageController
            pageController.addHeightToCurrentPage(newRowHeight);
        } else {
            // Fits on the current page, update usedSpaceOnPage
            pageController.addHeightToCurrentPage(rowHeight);
            console.log(`Added Row ${index + 1} to page. Current page height: ${pageController.getUsedSpaceOnPage()}px`);
        }
    }

    console.log("Completed table component creation with page adjustments.");
}
