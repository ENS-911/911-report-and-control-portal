import { globalState } from '../reactive/state.js';  // Import state management

export function loadPage() {
  const menuContent = document.getElementById('menuContent');
  const contentBody = document.getElementById('contentBody');

  // Clear previous content
  menuContent.innerHTML = '';
  contentBody.innerHTML = '';

  // Set up the sidebar with report type selection
  menuContent.innerHTML = `
    <label for="reportTypeSelector">Select Report Type</label>
    <select id="reportTypeSelector">
      <option value="" disabled selected>Select a report type</option>
      <option value="agencyReport">Agency Report</option>
      <option value="agencyComparisonReport">Agency Comparison Report</option>
      <option value="departmentReport">Department Report</option>
      <option value="departmentComparisonReports">Department Comparison Reports</option>
      <option value="incidentTypeReport">Incident Type Report</option>
      <option value="specificIncidentReport">Specific Incident Report</option>
      <option value="responseTimeReport">Response Time Report</option>
      <option value="timeReports">Time Reports</option>
      <option value="timeOfDayReports">Time of Day Reports</option>
      <option value="unitNumberReport">Unit # Report</option>
    </select>
    <div id="reportDateRangeSelector" style="display: none;"></div>
  `;

  // Initialize the report type selector event
  document.getElementById('reportTypeSelector').addEventListener('change', (e) => {
    selectReportType(e.target.value);
  });
}

function selectReportType(reportType) {
  console.log(`Selected report type: ${reportType}`);

  const reportDateRangeSelector = document.getElementById('reportDateRangeSelector');
  reportDateRangeSelector.style.display = 'flex';  // Show the date range selector

  // Update date range selector options
  reportDateRangeSelector.innerHTML = `
    <label for="dateRangeSelector">Select Report Date Range</label>
    <select id="dateRangeSelector">
      <option value="currentActive">Current Active</option>
      <option value="currentDay">Current Day</option>
      <option value="last24Hours">Last 24 Hours</option>
      <option value="selectHours">Select Number of Hours</option>
      <option value="currentWeek">Current Week</option>
      <option value="lastWeek">Last Week</option>
      <option value="currentMonth">Current Month</option>
      <option value="lastMonth">Last Month</option>
      <option value="currentQuarter">Current Quarter</option>
      <option value="lastQuarter">Last Quarter</option>
      <option value="currentYear">Current Year</option>
      <option value="lastYear">Last Year</option>
      <option value="selectDateRange">Select Date Range</option>
    </select>
    <div id="customDateInput" style="display: none;"></div>
    <button id="fetchReportData">Fetch Data</button>
  `;

  document.getElementById('dateRangeSelector').addEventListener('change', handleDateRangeChange);
  document.getElementById('fetchReportData').addEventListener('click', fetchReportData);
}

function handleDateRangeChange() {
  const dateRangeSelector = document.getElementById('dateRangeSelector');
  const selectedRange = dateRangeSelector.value;
  const customDateInput = document.getElementById('customDateInput');

  // Show additional inputs based on the selected date range
  if (selectedRange === 'selectHours') {
    customDateInput.innerHTML = `
      <label for="hoursInput">Enter number of hours:</label>
      <input type="number" id="hoursInput" min="1" />
    `;
    customDateInput.style.display = 'flex';
  } else if (selectedRange === 'selectDateRange') {
    customDateInput.innerHTML = `
      <label for="startDate">Start Date:</label>
      <input type="date" id="startDate" />
      <label for="endDate">End Date:</label>
      <input type="date" id="endDate" />
    `;
    customDateInput.style.display = 'flex';
  } else {
    customDateInput.style.display = 'none';  // Hide custom input fields for other options
  }
}

async function fetchReportData() {
    const dateRangeSelector = document.getElementById('dateRangeSelector').value;
    let reportFilters = {};  // Collect filters
  
    // Collect your report filters (e.g., date range, hours, etc.)
    if (dateRangeSelector === 'selectHours') {
      const hoursInput = document.getElementById('hoursInput').value;
      reportFilters.hours = hoursInput;
    } else if (dateRangeSelector === 'selectDateRange') {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
  
      if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
      }
  
      reportFilters.startDate = startDate;
      reportFilters.endDate = endDate;
    } else {
      reportFilters.dateRange = dateRangeSelector;  // Predefined date range
    }
  
    // Fetch the client key from state
    const state = globalState.getState();
    const clientKey = state.clientData?.key;
  
    if (!clientKey) {
      console.error('Client key not found in state');
      return;
    }
  
    // Fetch the data from the server based on the filters and client key
    try {
      const queryParams = new URLSearchParams(reportFilters).toString();
      const response = await fetch(`https://client-control.911-ens-services.com/report/${clientKey}?${queryParams}`);
  
      // Log the full response for debugging purposes
      console.log('Full response:', response);
  
      if (!response.ok) {
        // Capture status and status text for easier debugging
        console.error(`Network response was not ok. Status: ${response.status}, StatusText: ${response.statusText}`);
        
        // Optionally, try to read error details if the server provides them
        const errorDetails = await response.json().catch(() => ({})); // Handle potential JSON parse error
        console.error('Error details:', errorDetails);
  
        throw new Error('Network response was not ok');
      }
  
      const reportData = await response.json();
  
      // Store fetched data in global state
      globalState.setState({ reportData });
      console.log('Fetched report data:', reportData);
  
      // Display the report data in the content area
      displayReportData(reportData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
}  

function displayReportData(data) {
  const contentBody = document.getElementById('contentBody');
  contentBody.innerHTML = '';  // Clear previous content

  // Assuming data is an array of objects
  const table = document.createElement('table');
  
  data.forEach((item) => {
    const row = document.createElement('tr');
    
    Object.values(item).forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    
    table.appendChild(row);
  });

  contentBody.appendChild(table);  // Append the table to the content body
}
