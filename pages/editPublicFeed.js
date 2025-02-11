// pages/editPublicFeed.js

import { globalState } from '../reactive/state.js';

export function loadPage() {
  const setStage = document.getElementById('contentBody');
  setStage.innerHTML = `
    <div>
      <h2>Edit Public Feed</h2>
      <div id="filterControls">
        <label for="columnSelect">Remove From:</label>
        <select id="columnSelect"></select>

        <label for="valueSelect">With Value = To:</label>
        <select id="valueSelect"></select>

        <input type="text" id="customValue" placeholder="Enter custom value" style="display:none;">

        <button id="saveFilter">Save Filter</button>
      </div>
      
      <h3>Active Filters</h3>
      <ul id="filterList"></ul>
    </div>
  `;

  loadColumns();
  loadSavedFilters();

  document.getElementById('columnSelect').addEventListener('change', function () {
    loadValues(this.value);
  });

  document.getElementById('valueSelect').addEventListener('change', function () {
    toggleCustomInput(this.value);
  });

  document.getElementById('saveFilter').addEventListener('click', function () {
    saveFilter();
  });
}

function loadColumns() {
  fetch(`https://matrix.911-ens-services.com/api/get-columns/${userData.key}`)
    .then(response => response.json())
    .then(data => {
      const columnSelect = document.getElementById('columnSelect');
      data.columns.forEach(col => {
        if (col !== 'ID') {
          const option = new Option(col, col);
          columnSelect.add(option);
        }
      });
    })
    .catch(error => console.error('Error loading columns:', error));
}

function loadValues(column) {
  fetch(`https://matrix.911-ens-services.com/api/get-values/${userData.key}?column=${column}`)
    .then(response => response.json())
    .then(data => {
      const valueSelect = document.getElementById('valueSelect');
      valueSelect.innerHTML = '';
      data.values.forEach(value => {
        const option = new Option(value, value);
        valueSelect.add(option);
      });
      const customOption = new Option('Not in List', 'not_in_list');
      valueSelect.add(customOption);
    })
    .catch(error => console.error('Error loading values:', error));
}

function toggleCustomInput(value) {
  const customInput = document.getElementById('customValue');
  customInput.style.display = value === 'not_in_list' ? 'block' : 'none';
}

function saveFilter() {
  const column = document.getElementById('columnSelect').value;
  const value = document.getElementById('valueSelect').value;
  const customValue = document.getElementById('customValue').value;

  const finalValue = value === 'not_in_list' ? customValue : value;

  fetch(`https://matrix.911-ens-services.com/api/save-filter/${userData.key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, value: finalValue }),
  })
    .then(() => loadSavedFilters())
    .catch(error => console.error('Error saving filter:', error));
}

function loadSavedFilters() {
  fetch(`https://matrix.911-ens-services.com/api/get-saved-filters/${userData.key}`)
    .then(response => response.json())
    .then(data => {
      const filterList = document.getElementById('filterList');
      filterList.innerHTML = '';
      if (data.filterString) {
        const filters = data.filterString.split(' AND ');
        filters.forEach(filter => {
          const li = document.createElement('li');
          li.textContent = filter;
          const removeBtn = document.createElement('button');
          removeBtn.textContent = 'X';
          removeBtn.onclick = () => removeFilter(filter);
          li.appendChild(removeBtn);
          filterList.appendChild(li);
        });
      }
    })
    .catch(error => console.error('Error loading saved filters:', error));
}

function removeFilter(filter) {
  const [column, value] = filter.split(' = ');
  fetch(`https://matrix.911-ens-services.com/api/remove-filter/${userData.key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, value: value.replace(/'/g, '') }),
  })
    .then(() => loadSavedFilters())
    .catch(error => console.error('Error removing filter:', error));
}
