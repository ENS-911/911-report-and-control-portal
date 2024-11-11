// agencyReportForm.js
import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { fetchReportData } from '../api/fetchReportData.js';
import PageController from '../forms/controllers/PageController.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';

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

    // Subscribe to state to initialize PageController when reportData is set
    globalState.subscribe((state) => {
        if (state.reportData && !state.pageController) {
            initializePageController();
        }
    });
}

async function handleFetchData() {
    const reportType = globalState.getState().selectedReportType;
    try {
        const reportData = await fetchReportData(reportType);
        globalState.setState({ reportData });  // Update state with fetched data
        console.log("Fetched report data and updated state.");
    } catch (error) {
        console.error("Error fetching report data:", error);
    }
}

function initializePageController() {
    const reportData = globalState.getState().reportData;

    // Ensure reportData is available before initializing PageController
    if (!reportData) {
        console.warn("reportData not available for PageController initialization.");
        return;
    }

    const pageController = new PageController();

    // Initialize and measure the title component
    const titleComponent = createTitleComponent(globalState.getState().reportTitle || 'Default Report Title');
    pageController.addContentToPage(titleComponent);

    // Additional components can be added similarly, based on `reportData`
    globalState.setState({ pageController }); // Update state with PageController for rendering
    console.log("PageController initialized and set in global state:", pageController);
}

function onDateRangeSelect(selectedRange, customData) {
    globalState.setState({
        dateRange: selectedRange,
        customDateData: customData,
    });
}
