export function TableComponent({ title, data }) {
    const formContentArea = document.getElementById('formContentArea');
  
    if (!formContentArea) {
        console.error('Form content area not found!');
        return;
    }
  
    // Maximum height for each page in pixels (assuming ~11 inches, adjust based on actual pixel size for your setup)
    const maxPageHeight = 1000;  // Adjust as needed for your actual form height

    // Create table element
    let table = document.createElement('table');
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

    // Track the height of the current page content
    let currentPageHeight = table.offsetHeight;

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
    
        // Append the row to the current table
        table.appendChild(row);
    
        // Update the current page height after adding this row
        currentPageHeight += row.offsetHeight;
    
        // If the content exceeds the maximum page height, create a new page
        if (currentPageHeight > maxPageHeight) {
            appendTableToPage(table);
            table = createNewTableWithHeader(headers);  // Create a new table for the next page
            currentPageHeight = table.offsetHeight;  // Reset height for the new page
        }
    });

    // Append the last table if not yet appended
    if (table.rows.length > 1) {
        appendTableToPage(table);
    }
}

// Helper function to append a table to the form content area
function appendTableToPage(table) {
    const formContentArea = document.getElementById('formContentArea');
    formContentArea.appendChild(table);  // Append the table to the current page
}

// Helper function to create a new table with headers
function createNewTableWithHeader(headers) {
    const newTable = document.createElement('table');
    newTable.style.width = '100%';
    newTable.style.borderCollapse = 'collapse';
    newTable.style.marginTop = '10px';

    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerCell.style.border = '1px solid #ddd';
        headerCell.style.padding = '8px';
        headerCell.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(headerCell);
    });

    newTable.appendChild(headerRow);
    return newTable;
}
