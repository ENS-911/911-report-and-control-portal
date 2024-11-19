import { globalState } from '../../reactive/state.js';
import { measureComponentHeight } from '../formUtils/measurementUtils.js';

export function createTableComponent(pageController) {
    const data = globalState.getState().reportData || [];

    // Create the table header element
    function createHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Agency Type', 'Battalion', 'Creation Date', 'Premise', 'Description'];

        headers.forEach(headerText => {
            const headerCell = document.createElement('th');
            headerCell.textContent = headerText;
            headerRow.appendChild(headerCell);
        });

        thead.appendChild(headerRow);
        return thead;
    }

    // Function to start a new table with header and tbody
    function startNewTable() {
        const table = document.createElement('table');
        table.classList.add('report-table');
        table.appendChild(createHeader());
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        pageController.addContentToPage(table);
        return tbody;
    }

    let tbody = startNewTable(); // Start with the first table
    let accumulatedHeight = 0;

    // Iterate through each row of data and measure each dynamically
    data.forEach((item, index) => {
        const row = document.createElement('tr');

        // Populate row cells
        ['agency_type', 'battalion', 'creation', 'premise', 'type_description'].forEach((field) => {
            const cell = document.createElement('td');
            cell.textContent = field === 'creation' 
                ? new Date(item[field]).toLocaleString() 
                : item[field];
            row.appendChild(cell);
        });

        const rowHeight = measureComponentHeight(row);
        accumulatedHeight = pageController.currentPageHeight + rowHeight;

        // Check if adding the row would exceed the page height
        if (accumulatedHeight > pageController.maxPageHeight) {
            pageController.startNewPage();
            tbody = startNewTable(); // Start a new table on the new page
            accumulatedHeight = rowHeight; // Reset accumulated height to the new row's height
        }

        // Add row to the current page's tbody
        tbody.appendChild(row);
        pageController.currentPageHeight = accumulatedHeight;
    });
}
