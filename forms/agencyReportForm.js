// agencyReportForm.js
import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { fetchReportData } from '../api/fetchReportData.js';
import PageController from '../forms/controllers/PageController.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';
import { createTableComponent } from '../forms/components/tableComponent.js';

globalState.setState({
    clientComponentOrder: ['title', 'table']
});

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
            console.log("Initializing PageController with reportData:", state.reportData);
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

export function initializePageController() {
    const pageController = new PageController();
    const clientComponentOrder = globalState.getState().clientComponentOrder || ['title', 'table'];

    const components = {
        title: () => {
            const titleComponent = createTitleComponent(globalState.getState().reportTitle || 'Default Report Title');
            pageController.addContentToPage(titleComponent, true);
        },
        table: () => {
            createTableComponent(pageController); // Pass pageController to handle row-by-row addition
        }
    };

    clientComponentOrder.forEach(componentName => {
        if (components[componentName]) {
            console.log(`Adding component: ${componentName}`);
            components[componentName]();
        }
    });

    globalState.setState({ pageController });
    console.log("Final PageController state with components added:", pageController);
}

function onDateRangeSelect(selectedRange, customData) {
    globalState.setState({
        dateRange: selectedRange,
        customDateData: customData,
    });
}
