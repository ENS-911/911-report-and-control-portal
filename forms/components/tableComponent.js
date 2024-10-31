// Adjusted TableComponent.js
export function TableComponent({ title, data }) {
    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.style.width = '100%';
    tableContainer.style.marginTop = '20px';

    // Create and add table title
    const tableTitle = document.createElement('h2');
    tableTitle.textContent = title;
    tableContainer.appendChild(tableTitle);

    // Create table element
    const table = document.createElement('table');
    table.classList.add('report-table');

    // Add table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Agency Type', 'Battalion', 'Creation Date', 'Premise', 'Description'];

    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerCell.style.border = '1px solid #ddd';
        headerCell.style.padding = '8px';
        headerCell.style.backgroundColor = '#f2f2f2';
        headerCell.style.textAlign = 'left'; // Ensure consistent alignment
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Add table body
    const tbody = document.createElement('tbody');

    data.forEach((item) => {
        const row = document.createElement('tr');

        // Create cells for each field
        const agencyTypeCell = document.createElement('td');
        agencyTypeCell.textContent = item.agency_type;
        agencyTypeCell.style.border = '1px solid #ddd';
        agencyTypeCell.style.padding = '8px';
        row.appendChild(agencyTypeCell);

        const battalionCell = document.createElement('td');
        battalionCell.textContent = item.battalion;
        battalionCell.style.border = '1px solid #ddd';
        battalionCell.style.padding = '8px';
        row.appendChild(battalionCell);

        const creationCell = document.createElement('td');
        const creationDate = new Date(item.creation);
        creationCell.textContent = creationDate.toLocaleString();
        creationCell.style.border = '1px solid #ddd';
        creationCell.style.padding = '8px';
        row.appendChild(creationCell);

        const premiseCell = document.createElement('td');
        premiseCell.textContent = item.premise;
        premiseCell.style.border = '1px solid #ddd';
        premiseCell.style.padding = '8px';
        row.appendChild(premiseCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.type_description;
        descriptionCell.style.border = '1px solid #ddd';
        descriptionCell.style.padding = '8px';
        row.appendChild(descriptionCell);

        // Append the row to the tbody
        tbody.appendChild(row);
    });

    // Append tbody to the table
    table.appendChild(tbody);

    // Add the table to the table container
    tableContainer.appendChild(table);

    // Return the table container to be appended to the form
    return [tableContainer];
}
