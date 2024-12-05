// createTableComponent.js

export async function createTableComponent(pageController) {
    const reportData = globalState.getState().reportData || [];
    const table = document.createElement('table');
    table.className = 'report-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Agency Type', 'Battalion', 'Creation Date', 'Premise', 'Description'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    reportData.forEach(item => {
        const row = document.createElement('tr');
        ['agency_type', 'battalion', 'creation', 'premise', 'type_description'].forEach(field => {
            const td = document.createElement('td');
            if (field === 'creation') {
                const date = new Date(item[field]);
                td.textContent = isNaN(date) ? 'Invalid Date' : date.toLocaleString();
            } else {
                td.textContent = item[field] || 'N/A';
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Add the table to the page via PageController
    await pageController.addContentToPage(table);
}
