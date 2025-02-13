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
        <h3>Active Removal Filters</h3>
      </div>
      <div class="activeList">
        <ul id="filterList"></ul>
      </div>
    </div>
  `;

  setStage.innerHTML += `
  <div class="replaceWrap">
    <div class="replaceHead">
      <div id="replaceControls">
        <label for="replaceColumnSelect">Replace Data In:</label>
        <select id="replaceColumnSelect"></select>

        <label for="replaceValueSelect">With Value = To:</label>
        <select id="replaceValueSelect"></select>

        <input type="text" id="replaceCustomValue" placeholder="Enter custom value" style="display:none;">

        <label for="replaceWith">Replace With:</label>
        <input type="text" id="replaceWith" placeholder="New value">

        <button id="saveReplace">Save Replacement</button>
      </div>
    </div>
    <div class="activeTitle">
      <h3>Active Replacements</h3>
    </div>
    <div class="activeList">
      <ul id="replaceList"></ul>
    </div>
  </div>
`;


  loadColumns();
  loadSavedFilters();
  loadSavedReplacements()

  document.getElementById('columnSelect').addEventListener('change', function () {
    loadValues(this.value, 'valueSelect');
  });

  document.getElementById('replaceColumnSelect').addEventListener('change', function () {
    const selectedColumn = this.value;
    loadValues(selectedColumn, 'replaceValueSelect'); // Populate replacement values
  });

  document.getElementById('valueSelect').addEventListener('change', function () {
    toggleCustomInput(this.value);
  });

  document.getElementById('saveFilter').addEventListener('click', function () {
    console.log('Save Filter button clicked');
    saveFilter();
  });

  document.getElementById('saveReplace').addEventListener('click', function () {
    console.log("Save Replacement Clicked"); // Debugging log
    saveReplacement();
  });

  document.getElementById('replaceValueSelect').addEventListener('change', function () {
    const customInput = document.getElementById('replaceCustomValue');
    if (this.value === 'not_in_list') {
      customInput.style.display = 'inline-block';  // Show input field
    } else {
      customInput.style.display = 'none';  // Hide input field
      customInput.value = '';  // Reset value when not needed
    }
  });
}

function loadColumns() {
  fetch(`https://matrix.911-ens-services.com/api/get-columns/${userData.key}`)
    .then(response => response.json())
    .then(data => {
      const columnSelect = document.getElementById('columnSelect');
      const replaceColumnSelect = document.getElementById('replaceColumnSelect');

      if (!columnSelect || !replaceColumnSelect) {
        console.error('Dropdown elements not found');
        return;
      }

      columnSelect.innerHTML = ''; // Clear existing options
      replaceColumnSelect.innerHTML = ''; // Clear existing options

      // Add placeholder option
      const placeholderOption = new Option('--- Select Category ---', '', true, true);
      placeholderOption.disabled = true;
      columnSelect.add(placeholderOption);
      
      const placeholderReplaceOption = new Option('--- Select Category ---', '', true, true);
      placeholderReplaceOption.disabled = true;
      replaceColumnSelect.add(placeholderReplaceOption);

      console.log('Received columns:', data.columns); // Debugging log

      // Sort columns alphabetically and populate both dropdowns
      data.columns
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .forEach(col => {
          if (col !== 'ID') {
            columnSelect.add(new Option(col, col));
            replaceColumnSelect.add(new Option(col, col));
          }
        });
    })
    .catch(error => console.error('Error loading columns:', error));
}

function loadValues(column, targetDropdownId) {
  if (!column) return; // Exit if no column is selected

  fetch(`https://matrix.911-ens-services.com/api/get-values/${userData.key}?column=${column}`)
    .then(response => response.json())
    .then(data => {
      const targetDropdown = document.getElementById(targetDropdownId);

      if (!targetDropdown) {
        console.error(`Dropdown element with ID ${targetDropdownId} not found`);
        return;
      }

      targetDropdown.innerHTML = ''; // Clear existing options

      console.log(`Received values for column ${column}:`, data.values); // Debugging log

      // Sort values alphabetically and populate the dropdown
      data.values
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .forEach(value => {
          targetDropdown.add(new Option(value, value));
        });

      // Add "Not in List" option for manual input
      const customOption = new Option('Not in List', 'not_in_list');
      targetDropdown.add(customOption);
    })
    .catch(error => console.error(`Error loading values for column ${column}:`, error));
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

let replacementRules = [];

function saveReplacement() {
  const column = document.getElementById('replaceColumnSelect').value;
  const valueSelect = document.getElementById('replaceValueSelect').value;
  const customValue = document.getElementById('replaceCustomValue').value.trim();
  const replaceWith = document.getElementById('replaceWith').value.trim();

  if (!column || column.trim() === '') {
    console.error('Invalid column selection');
    return;
  }

  if ((valueSelect === 'not_in_list' && !customValue) || (!valueSelect && !customValue)) {
    console.error('Invalid replacement values');
    return;
  }

  if (!replaceWith) {
    console.error('Replacement value is required');
    return;
  }

  // Use the custom input if "Not in List" is selected
  const finalValue = valueSelect === 'not_in_list' ? customValue : valueSelect;

  const newRule = { column, value: finalValue, replaceWith };

  // Avoid duplicate replacement rules
  if (!replacementRules.some(rule => JSON.stringify(rule) === JSON.stringify(newRule))) {
    replacementRules.push(newRule);
  }

  console.log('Built Replacement Rules:', replacementRules);

  // Send updated rules to the backend
  updateReplacementOnServer(replacementRules);

  // Refresh the UI
  displayReplacements();
}

function displayReplacements() {
  const replaceList = document.getElementById('replaceList');
  replaceList.innerHTML = '';

  replacementRules.forEach(rule => {
    const li = document.createElement('li');
    li.textContent = `${rule.column}: ${rule.value} → ${rule.replaceWith}`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.onclick = () => removeReplacement(rule);

    li.appendChild(removeBtn);
    replaceList.appendChild(li);
  });
}

function removeReplacement(ruleToRemove) {
  replacementRules = replacementRules.filter(rule => 
    !(rule.column === ruleToRemove.column && rule.value === ruleToRemove.value && rule.replaceWith === ruleToRemove.replaceWith)
  );

  console.log('Updated Replacement Rules:', replacementRules);

  // Update backend with the new list
  updateReplacementOnServer(replacementRules);

  // Refresh UI
  displayReplacements();
}

function loadSavedReplacements() {
  fetch(`https://matrix.911-ens-services.com/api/get-replacement-rules/${userData.key}`)
    .then(response => response.json())
    .then(data => {
      replacementRules = data.replacementRules || [];
      console.log('Loaded Saved Replacement Rules:', replacementRules);
      displayReplacements();
    })
    .catch(error => console.error('Error loading saved replacements:', error));
}

function updateReplacementOnServer(rules) {
  fetch(`https://matrix.911-ens-services.com/api/save-replacement/${userData.key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ replacementRules: rules }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to save replacement rules');
    }
    return response.json();
  })
  .then(data => {
    console.log('Replacement rules saved successfully:', data);
  })
  .catch(error => console.error('Error saving replacement rules:', error));
}
