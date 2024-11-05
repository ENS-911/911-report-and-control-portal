// formUtils/measurementUtils.js

export function measureRowAndHeaderHeights() {
    const tempTable = document.createElement('table');
    tempTable.className = 'report-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Agency Type', 'Battalion', 'Creation Date', 'Premise', 'Description'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    tempTable.appendChild(thead);

    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');
    headers.forEach(() => {
        const td = document.createElement('td');
        td.textContent = 'Sample Data';
        row.appendChild(td);
    });

    tbody.appendChild(row);
    tempTable.appendChild(tbody);

    document.body.appendChild(tempTable);
    const headerHeight = thead.offsetHeight;
    const rowHeight = row.offsetHeight;
    document.body.removeChild(tempTable);

    return { rowHeight, headerHeight };
}

export function measureFooterHeight() {
    const tempFooter = document.createElement('div');
    tempFooter.className = 'page-footer';
    tempFooter.style.visibility = 'hidden';

    tempFooter.innerHTML = `<div class="footer-content"><div class="foot"><span>Report Generated: ${new Date().toLocaleString()}</span><span>Generated By: FirstName LastName</span></div></div>`;

    document.body.appendChild(tempFooter);
    const footerHeight = tempFooter.offsetHeight;
    document.body.removeChild(tempFooter);

    return footerHeight;
}

export function measureTitleHeight(title) {
    const tempTitle = document.createElement('h1');
    tempTitle.textContent = title;
    tempTitle.style.visibility = 'hidden';

    document.body.appendChild(tempTitle);
    const titleHeight = tempTitle.offsetHeight;
    document.body.removeChild(tempTitle);

    return titleHeight;
}

export function getPageHeight() {
    const pageWidth = document.getElementById('contentBody').offsetWidth;
    const aspectRatio = 8.5 / 11;
    return pageWidth * aspectRatio;
}