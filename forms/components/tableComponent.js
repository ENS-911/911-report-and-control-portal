// createTableComponent.js

import { globalState } from '../../reactive/state.js';
import { measureComponentHeight } from '../formUtils/measurementUtils.js';

export async function createTableComponent(pageController) {
    const data = globalState.getState().reportData || [];

    // Function to create table header
    function createHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Agency Type', 'Battalion', 'Creation Date', 'Premise', 'Description'];

        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        return thead;
    }

    // Function to create a new table with header
    function createNewTable() {
        const table = document.createElement('table');
        table.classList.add('report-table');
        table.appendChild(createHeader());
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        return table;
    }

    // Initialize with the first table
    let currentTable = createNewTable();
    pageController.startNewPage(); // Start with a new page
    await pageController.addContentToPage(currentTable, 0); // Initially, height is 0
    console.log("Added first table to the page.");

    // Measure header height once for consistency
    const headerElement = currentTable.querySelector('thead');
    const headerHeight = await measureComponentHeight(headerElement);
    console.log(`Measured Header Height: ${headerHeight}px`);
    let accumulatedHeight = headerHeight;

    // Iterate through each row of data
    for (const item of data) {
        const row = document.createElement('tr');

        // Populate row cells
        ['agency_type', 'battalion', 'creation', 'premise', 'type_description'].forEach((field) => {
            const cell = document.createElement('td');
            cell.textContent = field === 'creation' 
                ? new Date(item[field]).toLocaleString() 
                : item[field] || 'N/A'; // Handle undefined or null values
            row.appendChild(cell);
        });

        // Append the row to the current table's tbody temporarily to measure its height
        const tbody = currentTable.querySelector('tbody');
        tbody.appendChild(row);
        const rowHeight = await measureComponentHeight(row);
        console.log(`Measured Row Height: ${rowHeight}px`);

        // Check if adding this row exceeds the max page height
        if (accumulatedHeight + rowHeight > pageController.maxPageHeight) {
            console.log("Row exceeds max page height. Starting a new page...");

            // Remove the row from the current table
            tbody.removeChild(row);

            // Finalize the current page
            pageController.startNewPage();

            // Create a new table with header
            currentTable = createNewTable();
            await pageController.addContentToPage(currentTable, headerHeight);
            console.log("Added new table to the new page.");

            // Append the row to the new table
            const newTbody = currentTable.querySelector('tbody');
            newTbody.appendChild(row);
            const newRowHeight = await measureComponentHeight(row);
            console.log(`Measured Row Height on new page: ${newRowHeight}px`);

            // Update accumulated height
            accumulatedHeight = headerHeight + newRowHeight;
        } else {
            // If it fits, keep the row in the current table
            accumulatedHeight += rowHeight;
        }

        // Update the current page height in PageController
        pageController.currentPageHeight = accumulatedHeight;
        console.log(`Added row. New Accumulated Height: ${accumulatedHeight}px`);
    }

    // Finalize pages after all rows are processed
    const pages = pageController.finalizePages();
    console.log(`Total Pages after finalization: ${pages.length}`);

    // Optionally, return pages or perform further actions
    return pages;
}
