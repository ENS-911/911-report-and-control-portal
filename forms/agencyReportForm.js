// agencyReportForm.js
import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { LoadOrchestrator } from '../forms/controllers/LoadOrchestrator.js';

// Function to handle the selection of a date range
function onDateRangeSelect(selectedRange, customData) {
    globalState.setState({
        dateRange: selectedRange,
        customDateData: customData,
    });
}

export function loadReportComponents() {
    const menuContent = document.getElementById('menuContent');

    // Add DateRangeSelector if it hasn't been added
    if (!menuContent.querySelector('#reportDateRangeSelector')) {
        const dateRangeSelector = DateRangeSelector(onDateRangeSelect);
        menuContent.appendChild(dateRangeSelector);

        // Attach fetch data event to button
        const fetchButton = dateRangeSelector.querySelector('#fetchReportData');
        fetchButton.addEventListener('click', handleFetchData);
    }
}

async function handleFetchData() {
    const reportType = globalState.getState().selectedReportType;

    if (!reportType) {
        console.error("No report type selected.");
        return;
    }

    console.log("Starting data fetch for report type:", reportType);

    // Delegate orchestration to LoadOrchestrator
    const orchestrator = new LoadOrchestrator('agencyReport');
    await orchestrator.orchestrateLoad();
}
