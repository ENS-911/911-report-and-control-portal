// fetchReportData.js
import { globalState } from '../reactive/state.js';

export async function fetchReportData(reportType) {
    const dateRangeSelector = document.getElementById('dateRangeSelector').value;
    let reportFilters = {};
  
    if (dateRangeSelector === 'selectHours') {
      const hoursInput = document.getElementById('hoursInput').value;
      if (hoursInput) {
        reportFilters.hours = hoursInput;
      } else {
        alert('Please enter a valid number of hours.');
        return;
      }
    } else if (dateRangeSelector === 'selectDateRange') {
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
  
      if (startDate && endDate) {
        // Send only the date part as expected (YYYY-MM-DD format)
        reportFilters.startDate = startDate;
        reportFilters.endDate = endDate;
        reportFilters.dateRange = 'selectDateRange';
      } else {
        alert('Please select both start and end dates.');
        return;
      }
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
        console.log("Query Parameters:", queryParams);

        const url = `https://matrix.911-ens-services.com/report/${clientKey}?${queryParams}`;
        console.log("Full Query URL:", url);
  
        const response = await fetch(`https://matrix.911-ens-services.com/report/${clientKey}?${queryParams}`);
      
      if (!response.ok) {
        const errorDetails = await response.json().catch(() => ({}));
        console.error('Error fetching report data:', errorDetails, `Status Code: ${response.status}`);
        throw new Error('Network response was not ok');
      }
  
      const reportData = await response.json();
      const reportTypeSelector = document.getElementById('reportTypeSelector');
      const selectedText = reportTypeSelector.options[reportTypeSelector.selectedIndex].text;
      
      globalState.setState({
        reportData,
        selectedReportType: reportType,
        reportTitle: selectedText,
      });
  
      console.log('Fetched report data:', reportData);
  
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  }
