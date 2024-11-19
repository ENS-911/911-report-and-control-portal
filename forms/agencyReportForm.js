// agencyReportForm.js
import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { fetchReportData } from '../api/fetchReportData.js';
import PageController from '../forms/controllers/PageController.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';
import { createTableComponent } from '../forms/components/tableComponent.js';
import { checkAgencyTypes } from '../forms/controllers/checkAgencyTypes.js';
import { allAgencyTypes } from '../forms/components/allAgencyTypes.js';

// Set default component order
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

    // Subscribe to state changes for reportData and clientComponentOrder
    globalState.subscribe((state) => {
        if (state.reportData && state.clientComponentOrder && !state.pageController) {
            console.log("Initializing PageController with updated reportData and component order:", state.reportData, state.clientComponentOrder);
            initializePageController();
        }
    });
}

async function handleFetchData() {
    const reportType = globalState.getState().selectedReportType;
    try {
        const reportData = await fetchReportData(reportType);
        globalState.setState({ reportData }); // Update state with fetched data
        console.log("Fetched report data and updated state.");

        // After reportData is set, check agency types and update component order
        const agencyTypesArray = checkAgencyTypes();
        if (agencyTypesArray.length > 1) {
            console.log("Multiple agency types found:", agencyTypesArray);
            globalState.setState({ clientComponentOrder: ['title', 'agencyType', 'table'] });
        } else {
            console.log("Single agency type found:", agencyTypesArray);
            globalState.setState({ clientComponentOrder: ['title', 'table'] });
        }
    } catch (error) {
        console.error("Error fetching report data:", error);
    }
}

export function initializePageController() {
    const pageController = new PageController();
    const clientComponentOrder = globalState.getState().clientComponentOrder;

    const components = {
        title: () => {
            const titleComponent = createTitleComponent(globalState.getState().reportTitle || 'Default Report Title');
            pageController.addContentToPage(titleComponent, true);
        },
        agencyType: () => {
            console.log("Adding Agency Type Component due to multiple agency types.");
            const agencyTypeComponent = allAgencyTypes();
            pageController.addContentToPage(agencyTypeComponent);
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
