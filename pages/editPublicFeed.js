console.log('User Data in Edit Public Feed:', userData);

if (!userData || !userData.key) {
  console.error('userData.key is undefined in Edit Public Feed');
} else {
  console.log('userData.key:', userData.key);
}

// pages/editPublicFeed.js

import { globalState } from '../reactive/state.js';

export function loadPage() {
  const setStage = document.getElementById('contentBody');
  setStage.innerHTML = `
    <div class="removeWrap">
      <div class="removeHead">
        <div id="filterControls">
          <label for="columnSelect">Remove From:</label>
          <select id="columnSelect"></select>

          <label for="valueSelect">With Value = To:</label>
          <select id="valueSelect"></select>

          <input type="text" id="customValue" placeholder="Enter custom value" style="display:none;">

          <button id="saveFilter">Save Filter</button>
        </div>
      </div>
      <div class="activeTitle">
        <h3>Active Filters</h3>
      </div>
      <div class="activeList">
        <ul id="filterList"></ul>
      </div>
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
    console.log('Save Filter button clicked');
    saveFilter();
  });
}

function loadColumns() {
  fetch(`https://matrix.911-ens-services.com/api/get-columns/${userData.key}`)
    .then(response => response.json())
    .then(data => {
      const columnSelect = document.getElementById('columnSelect');
      columnSelect.innerHTML = ''; // Clear existing options before adding

      // Sort columns alphabetically (case-insensitive)
      data.columns.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .forEach(col => {
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
      valueSelect.innerHTML = ''; // Clear existing options before adding

      // Sort values alphabetically (case-insensitive)
      data.values.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .forEach(value => {
          const option = new Option(value, value);
          valueSelect.add(option);
        });

      // Add 'Not in List' option at the end
      const customOption = new Option('Not in List', 'not_in_list');
      valueSelect.add(customOption);
    })
    .catch(error => console.error('Error loading values:', error));
}

function toggleCustomInput(value) {
  const customInput = document.getElementById('customValue');
  customInput.style.display = value === 'not_in_list' ? 'block' : 'none';
}

let filterConditions = [];  // Store all filter conditions here

function saveFilter() {
  const column = document.getElementById('columnSelect').value;
  const value = document.getElementById('valueSelect').value;
  const customValue = document.getElementById('customValue').value;
  
  const finalValue = value === 'not_in_list' ? customValue : value;
  const newCondition = `${column} = '${finalValue}'`;

  // Avoid duplicates
  if (!filterConditions.includes(newCondition)) {
    filterConditions.push(newCondition);
  }

  // Build the complete SQL string
  const sqlString = filterConditions.join(' OR ');

  console.log('Built SQL String:', sqlString);  // Debugging log

  // Send the updated SQL string to the backend
  updateFilterOnServer(sqlString);

  // Refresh the display of active filters
  displayFilters();
}

function updateFilterOnServer(sqlString) {
  console.log('Attempting to send SQL string to server:', sqlString);  // Log before sending

  fetch(`https://matrix.911-ens-services.com/api/save-filter/${userData.key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filterString: sqlString }),
  })
  .then(response => {
    console.log('Server responded with status:', response.status);  // Log the status code
    if (!response.ok) {
      throw new Error('Failed to save filter string');
    }
    return response.json();
  })
  .then(data => {
    console.log('Filter string saved successfully:', data);  // Log the server response
  })
  .catch(error => console.error('Error saving filter string:', error));  // Log any errors
}


function displayFilters() {
  const filterList = document.getElementById('filterList');
  filterList.innerHTML = '';

  filterConditions.forEach(condition => {
    const li = document.createElement('li');
    li.textContent = condition;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => removeFilter(condition);

    li.appendChild(removeBtn);
    filterList.appendChild(li);
  });
}

function loadSavedFilters() {
  fetch(`https://matrix.911-ens-services.com/api/get-saved-filters/${userData.key}`)
    .then(response => response.json())
    .then(data => {
      const savedSQLString = data.filterString || '';

      // Split the SQL string into individual conditions
      filterConditions = savedSQLString ? savedSQLString.split(' OR ') : [];

      console.log('Loaded Saved SQL String:', savedSQLString);

      // Display the filters
      displayFilters();
    })
    .catch(error => console.error('Error loading saved filters:', error));
}

function removeFilter(conditionToRemove) {
  // Remove the selected condition
  filterConditions = filterConditions.filter(condition => condition !== conditionToRemove);

  // Rebuild the SQL string
  const sqlString = filterConditions.join(' OR ');

  console.log('Updated SQL String after removal:', sqlString);

  // Send the updated SQL string to the backend
  updateFilterOnServer(sqlString);

  // Refresh the display
  displayFilters();
}
