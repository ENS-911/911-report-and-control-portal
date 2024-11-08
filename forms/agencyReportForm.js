// agencyReportForm.js
// agencyReportForm.js
import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { fetchReportData } from '../api/fetchReportData.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';

export function loadReportComponents() {
    const menuContent = document.getElementById('menuContent');

    // Add the DateRangeSelector if it hasn’t been added yet
    if (!menuContent.querySelector('#reportDateRangeSelector')) {
        const dateRangeSelector = DateRangeSelector(onDateRangeSelect);
        menuContent.appendChild(dateRangeSelector);

        // Attach the fetch data event once, preventing duplicate event listeners
        const fetchButton = dateRangeSelector.querySelector('#fetchReportData');
        fetchButton.addEventListener('click', handleFetchData);
    }

    // Initialize the title component
    initializeTitleComponent();
}

// Initialize and measure the title bar component
function initializeTitleComponent() {
    const reportTitle = globalState.getState().reportTitle || 'Default Report Title';
    const titleComponent = createTitleComponent(reportTitle);
    
    // Measure and add the title component
    const pageController = globalState.getState().pageController;
    pageController.addContentToPage(titleComponent);
}

// Handler for Date Range selection
function onDateRangeSelect(selectedRange, customData) {
    console.log(`Selected range: ${selectedRange}`, customData);
    globalState.setState({
        dateRange: selectedRange,
        customDateData: customData,
    });
}

// Fetch data based on the selected report type and date range
async function handleFetchData() {
    const reportType = globalState.getState().selectedReportType;
    try {
        const reportData = await fetchReportData(reportType);

        // Update global state with the fetched data
        globalState.setState({ reportData });
    } catch (error) {
        console.error("Error fetching report data:", error);
    }
}
