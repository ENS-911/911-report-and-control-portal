/**
 * Renders the Sort Bar component.
 * This component builds a sort/filter bar that can update both a map and a table.
 * @param {Object} options - Options for rendering.
 * @param {HTMLElement} options.rootDiv - The container element.
 * @param {Function} options.updateTable - Function to update the table.
 * @param {Function} options.updateMap - Function to update the map.
 * @param {boolean} [options.hasMap=false] - Flag if map is available.
 * @param {Array} options.activeData - The full dataset to use for filtering.
 */
export function createSortBar(options) {
    const { rootDiv, updateTable, updateMap, hasMap = false, activeData = [] } = options;
    
    // Create the sort bar container.
    const sortBarDiv = document.createElement("div");
    sortBarDiv.id = "sortBar";
    rootDiv.appendChild(sortBarDiv);
  
    // Build the top section.
    const topSection = document.createElement("div");
    topSection.id = "topSection";
    
    // Left Section: "ACTIVE INCIDENTS"
    const leftSection = document.createElement("div");
    leftSection.className = "leftSection";
    leftSection.innerText = "ACTIVE INCIDENTS";
  
    // Right Section: Status filters.
    const rightSection = document.createElement("div");
    rightSection.className = "rightSection";
    const statusFilterText = document.createElement("p");
    statusFilterText.innerText = "Click to Filter by Status:";
    const statusFiltersDiv = document.createElement("div");
    statusFiltersDiv.id = "statusFilters";
  
    // Define available statuses.
    const statuses = [
      { label: "All Status", value: "all" },
      { label: "R = Reported", value: "Reported" },
      { label: "E = Enroute", value: "Enroute" },
      { label: "OS = On Scene", value: "On Scene" },
      { label: "T = Transporting", value: "Transporting" },
      { label: "H = At Hospital", value: "At Hospital" },
      { label: "Q = Queued", value: "Queued" }
    ];
  
    // Render status radio buttons based on activeData.
    function renderStatusRadioButtons() {
      statusFiltersDiv.innerHTML = ""; // Clear any existing radios
  
      // Get unique statuses from activeData.
      const availableStatuses = [...new Set(activeData.map(item => item.status))];
  
      statuses.forEach(status => {
        // Only create radio if status is "all" or available in data.
        if (status.value === "all" || availableStatuses.includes(status.value)) {
          const label = document.createElement("label");
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = "status";
          radio.value = status.value;
          if (status.value === "all") radio.checked = true; // Default selection.
          label.appendChild(radio);
          label.appendChild(document.createTextNode(` ${status.label}`));
          statusFiltersDiv.appendChild(label);
  
          // Attach listener to filter on change.
          radio.addEventListener("change", applyFilters);
        }
      });
    }
    
    renderStatusRadioButtons();
  
    // Assemble right section.
    rightSection.appendChild(statusFilterText);
    rightSection.appendChild(statusFiltersDiv);
  
    // Append left and right sections to top section.
    topSection.appendChild(leftSection);
    topSection.appendChild(rightSection);
  
    // Build bottom section with dropdown filters.
    const bottomSection = document.createElement("div");
    bottomSection.id = "bottomSection";
  
    const filterByType = createDropdown("Filter by Type", "filterByType");
    const filterByAgency = createDropdown("Filter by Agency", "filterByAgency");
    const filterByArea = createDropdown("Filter by Area", "filterByArea");
  
    bottomSection.appendChild(filterByType);
    bottomSection.appendChild(filterByAgency);
    bottomSection.appendChild(filterByArea);
  
    // Append top and bottom sections to sort bar.
    sortBarDiv.appendChild(topSection);
    sortBarDiv.appendChild(bottomSection);
  
    // Populate dropdowns based on activeData.
    populateDropdowns();
  
    // --- Helper functions ---
  
    // Creates a dropdown element with a default option.
    function createDropdown(defaultText, id) {
      const select = document.createElement("select");
      select.id = id;
      const defaultOption = document.createElement("option");
      defaultOption.value = "all";
      defaultOption.innerText = defaultText;
      select.appendChild(defaultOption);
      select.addEventListener("change", applyFilters);
      return select;
    }
  
    // Populate the dropdowns dynamically from activeData.
    function populateDropdowns() {
      const types = [...new Set(activeData.map(item => item.type))];
      const agencies = [...new Set(activeData.map(item => item.agency_type))];
      const areas = [...new Set(activeData.map(item => item.db_city))];
  
      populateDropdown(filterByType, types);
      populateDropdown(filterByAgency, agencies);
      populateDropdown(filterByArea, areas);
    }
  
    // Helper to populate a single dropdown.
    function populateDropdown(dropdown, items) {
      dropdown.innerHTML = '<option value="all">All</option>';
      items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.innerText = item;
        dropdown.appendChild(option);
      });
    }
  
    // Applies filters and triggers update functions.
    function applyFilters() {
      const selectedType = filterByType.value;
      const selectedAgency = filterByAgency.value;
      const selectedArea = filterByArea.value;
      const selectedStatus = document.querySelector('input[name="status"]:checked').value;
    
      const filteredData = activeData.filter(item => {
        const typeMatch = selectedType === "all" || item.type === selectedType;
        const agencyMatch = selectedAgency === "all" || item.agency_type === selectedAgency;
        const areaMatch = selectedArea === "all" || item.db_city === selectedArea;
        const statusMatch = selectedStatus === "all" || item.status === selectedStatus;
        return typeMatch && agencyMatch && areaMatch && statusMatch;
      });
    
      if (updateMap) {
        updateMap(filteredData);
      }
    
      if (updateTable) {
        updateTable(filteredData);
      }
    
      // Optionally, update the dropdown options based on filtered data.
      updateDropdownOptions(filteredData);
    }
  
    // Updates dropdown options based on filtered data.
    function updateDropdownOptions(filteredData) {
      const types = [...new Set(filteredData.map(item => item.type))];
      const agencies = [...new Set(filteredData.map(item => item.agency_type))];
      const areas = [...new Set(filteredData.map(item => item.db_city))];
      updateDropdown(filterByType, types, filterByType.value);
      updateDropdown(filterByAgency, agencies, filterByAgency.value);
      updateDropdown(filterByArea, areas, filterByArea.value);
    }
  
    // Helper function to update a dropdown, preserving the selected value.
    function updateDropdown(dropdown, items, selectedValue) {
      dropdown.innerHTML = "";
      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.innerText = "All";
      dropdown.appendChild(allOption);
      items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.innerText = item;
        dropdown.appendChild(option);
      });
      dropdown.value = selectedValue || "all";
    }
}
  