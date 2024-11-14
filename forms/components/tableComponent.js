import { globalState } from '../../reactive/state.js';
import { measureComponentHeight } from '../formUtils/measurementUtils.js';

export function createTableComponent(pageController) {
    const data = globalState.getState().reportData || [];

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

    function startNewTable() {
        const table = document.createElement('table');
        table.classList.add('report-table');
        table.appendChild(createHeader());
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        pageController.addContentToPage(table);
        return tbody;
    }

    let tbody = startNewTable();

    data.forEach((item) => {
        const row = document.createElement('tr');

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

        const rowHeight = measureComponentHeight(row);

        if (pageController.currentPageHeight + rowHeight > pageController.maxPageHeight) {
            pageController.startNewPage();
            tbody = startNewTable();
        }

        tbody.appendChild(row);
        pageController.currentPageHeight += rowHeight;
    });
}
