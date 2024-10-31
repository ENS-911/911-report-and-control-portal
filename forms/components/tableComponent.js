export function createTableComponent(data) {
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
        row.appendChild(agencyTypeCell);

        const battalionCell = document.createElement('td');
        battalionCell.textContent = item.battalion;
        row.appendChild(battalionCell);

        const creationCell = document.createElement('td');
        const creationDate = new Date(item.creation);
        creationCell.textContent = creationDate.toLocaleString();
        row.appendChild(creationCell);

        const premiseCell = document.createElement('td');
        premiseCell.textContent = item.premise;
        row.appendChild(premiseCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.type_description;
        row.appendChild(descriptionCell);

        // Append the row to the tbody
        tbody.appendChild(row);
    });

    // Append tbody to the table
    table.appendChild(tbody);

    // Return the table element
    return table;
}
