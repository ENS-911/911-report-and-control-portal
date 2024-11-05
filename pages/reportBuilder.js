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
      <option value="departmentComparisonReport">Department Comparison Report</option>
      <option value="incidentTypeReport">Incident Type Report</option>
      <option value="specificIncidentReport">Specific Incident Report</option>
      <option value="responseTimeReport">Response Time Report</option>
      <option value="timeReport">Time Report</option>
      <option value="timeOfDayReport">Time of Day Report</option>
      <option value="unitNumberReport">Unit # Report</option>
    </select>
    <div id="reportDateRangeSelector" style="display: none;"></div>
  `;

  // Initialize the report type selector event
  document.getElementById('reportTypeSelector').addEventListener('change', (e) => {
    const reportType = e.target.value;
    globalState.setState({ selectedReportType: reportType });  // Set report type in global state
    selectReportType(reportType); // Pass the report type value
  });

  globalState.subscribe(state => {
    if (state.reportData && state.selectedReportType) {
      loadForm(state.selectedReportType, state.reportData);
    }
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
  document.getElementById('fetchReportData').addEventListener('click', () => fetchReportData(reportType));
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

async function fetchReportData(reportType) {
  const dateRangeSelector = document.getElementById('dateRangeSelector').value;
  let reportFilters = {};

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
    reportFilters.dateRange = dateRangeSelector;
  }

  const state = globalState.getState();
  const clientKey = state.clientData?.key;

  if (!clientKey) {
    console.error('Client key not found in state');
    return;
  }

  try {
    const queryParams = new URLSearchParams(reportFilters).toString();
    const response = await fetch(`https://matrix.911-ens-services.com/report/${clientKey}?${queryParams}`);
    
    if (!response.ok) {
      const errorDetails = await response.json().catch(() => ({}));
      console.error('Error fetching report data:', errorDetails);
      throw new Error('Network response was not ok');
    }

    const reportData = await response.json();
    const reportTypeSelector = document.getElementById('reportTypeSelector');
    const selectedText = reportTypeSelector.options[reportTypeSelector.selectedIndex].text;
    
    globalState.setState({
      reportData, // Store reportData in global state
      selectedReportType: document.getElementById('reportTypeSelector').value,
      reportTitle: selectedText,
    });

    console.log('Fetched report data:', reportData);

  } catch (error) {
    console.error('Error fetching report data:', error);
  }
}

async function loadForm(reportType) {
  try {
    const reportData = globalState.getState().reportData; // Access reportData directly from globalState
    console.log(`Loading form for ${reportType} with data:`, reportData);

    const formModule = await import(`../forms/${reportType}Form.js`);

    formModule.renderForm(reportData); // Use reportData directly
  } catch (error) {
    console.error(`Error loading form for ${reportType}:`, error);
  }
}
