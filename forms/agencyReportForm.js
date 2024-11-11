// agencyReportForm.js
import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { fetchReportData } from '../api/fetchReportData.js';
import PageController from '../forms/controllers/PageController.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';

const pageController = new PageController();  // Initialize PageController here

export function loadReportComponents() {
    const menuContent = document.getElementById('menuContent');

    if (!menuContent.querySelector('#reportDateRangeSelector')) {
        const dateRangeSelector = DateRangeSelector(onDateRangeSelect);
        menuContent.appendChild(dateRangeSelector);

        const fetchButton = dateRangeSelector.querySelector('#fetchReportData');
        fetchButton.addEventListener('click', handleFetchData);
    }

    initializeTitleComponent();
}

function initializeTitleComponent() {
    const { element: titleElement, height: titleHeight } = createTitleComponent();
    pageController.addContentToPage(titleElement);
    console.log("Added title component with height:", titleHeight);
}

function onDateRangeSelect(selectedRange, customData) {
    globalState.setState({
        dateRange: selectedRange,
        customDateData: customData,
    });
}

async function handleFetchData() {
    const reportType = globalState.getState().selectedReportType;
    try {
        const reportData = await fetchReportData(reportType);
        globalState.setState({ reportData });
    } catch (error) {
        console.error("Error fetching report data:", error);
    }
}
