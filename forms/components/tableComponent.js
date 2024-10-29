// TableComponent.js
export function TableComponent({ title, data }) {
    const formContentArea = document.getElementById('formContentArea');
    formContentArea.innerHTML = ''; // Clear previous content

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
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';

    // Add table header
    const headerRow = document.createElement('tr');
    const headers = ['Agency Type', 'Battalion', 'Creation Date', 'Premise', 'Description'];

    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerCell.style.border = '1px solid #ddd';
        headerCell.style.padding = '8px';
        headerCell.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(headerCell);
    });

    table.appendChild(headerRow);

    // Add table rows
    data.forEach((item) => {
        const row = document.createElement('tr');

        // Create cells for each field
        const agencyTypeCell = document.createElement('td');
        agencyTypeCell.textContent = item.agency_type;
        row.appendChild(agencyTypeCell);

        const battalionCell = document.createElement('td');
        battalionCell.textContent = item.battalion;
        row.appendChild(battalionCell);

        const creationCell = document.createElement('td');
        const creationDate = new Date(item.creation);
        creationCell.textContent = creationDate.toLocaleString();  // Format the date to local date/time
        row.appendChild(creationCell);

        const premiseCell = document.createElement('td');
        premiseCell.textContent = item.premise;
        row.appendChild(premiseCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.type_description;
        row.appendChild(descriptionCell);

        // Append the row to the table
        table.appendChild(row);
    });

    // Add the table to the table container
    tableContainer.appendChild(table);

    // Append the table container to the content body
    formContentArea.appendChild(tableContainer);
}
