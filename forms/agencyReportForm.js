import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { globalState } from '../reactive/state.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';
import { createTableComponent } from '../forms/components/tableComponent.js';
import { allAgencyTypes } from '../forms/components/allAgencyTypes.js';
import { singleAgencyType } from '../forms/components/singleAgencyType.js';
import { LoadOrchestrator } from '../forms/controllers/LoadOrchestrator.js';

// Define the Agency Report configuration
const agencyReportForm = {
    name: "Agency Report",
    components: ['title', 'agencyType', 'table'],

    getTitle: () => {
        const state = globalState.getState();
        return state.reportTitle || "Agency Report";
    },

    initializeComponents(pageController, componentOrder) {
        const components = {
            title: () => {
                const titleText = this.getTitle();
                const titleComponent = createTitleComponent(titleText);
                pageController.addContentToPage(titleComponent, true);
            },
            agencyType: () => {
                const reportData = globalState.getState().reportData || [];
                const agencyTypes = [...new Set(reportData.map(item => item.agency_type))];
                const agencyTypeComponent = agencyTypes.length > 1 ? allAgencyTypes() : singleAgencyType();
                pageController.addContentToPage(agencyTypeComponent);
            },
            table: () => {
                createTableComponent(pageController);
            },
        };

        componentOrder.forEach((componentName) => {
            if (components[componentName]) {
                console.log(`Initializing component: ${componentName}`);
                components[componentName]();
            } else {
                console.warn(`Component ${componentName} is not registered.`);
            }
        });
    },
};

// Register the template with LoadOrchestrator
LoadOrchestrator.registerTemplate('agencyReport', agencyReportForm);

// Additional utility functions
export function loadReportComponents() {
    const menuContent = document.getElementById('menuContent');

    if (!menuContent.querySelector('#reportDateRangeSelector')) {
        const dateRangeSelector = DateRangeSelector(onDateRangeSelect);
        menuContent.appendChild(dateRangeSelector);

        const fetchButton = dateRangeSelector.querySelector('#fetchReportData');
        console.log("Attaching handleFetchData to Fetch Data button:", fetchButton);
        fetchButton.addEventListener('click', handleFetchData);
    }
}

async function handleFetchData() {
    const reportType = globalState.getState().selectedReportType;

    try {
        console.log("Instantiating LoadOrchestrator for reportType:", reportType);
        const orchestrator = new LoadOrchestrator(reportType);
        await orchestrator.orchestrateLoad();
        console.log("LoadOrchestrator orchestrateLoad completed.");
    } catch (error) {
        console.error("Error fetching report data:", error);
    }
    setupAgencyFilterControls();
}

function setupAgencyFilterControls() {
    const menuContent = document.getElementById('menuContent');

    // Remove existing controls if they already exist
    const existingDropdown = menuContent.querySelector('#agencyFilterDropdown');
    const existingButton = menuContent.querySelector('#editReportButton');
    if (existingDropdown) existingDropdown.remove();
    if (existingButton) existingButton.remove();

    // Add filter dropdown
    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'agencyFilterDropdown';

    const dropdownLabel = document.createElement('label');
    dropdownLabel.textContent = 'Filter by Agency:';
    dropdownLabel.setAttribute('for', 'agencyFilter');

    const dropdown = document.createElement('select');
    dropdown.id = 'agencyFilter';

    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = 'All';
    allOption.textContent = 'All';
    dropdown.appendChild(allOption);

    // Populate dropdown with unique agency types
    const dataHold = globalState.getState().dataHold;
    const uniqueAgencyTypes = [...new Set(dataHold.map((item) => item.agency_type))];

    uniqueAgencyTypes.forEach((agencyType) => {
        const option = document.createElement('option');
        option.value = agencyType;
        option.textContent = agencyType;
        dropdown.appendChild(option);
    });

    dropdownContainer.appendChild(dropdownLabel);
    dropdownContainer.appendChild(dropdown);
    menuContent.appendChild(dropdownContainer);

    // Add "Apply Filter" button
    const editButton = document.createElement('button');
    editButton.id = 'editReportButton';
    editButton.textContent = 'Apply Filter';
    menuContent.appendChild(editButton);

    editButton.addEventListener('click', handleApplyFilter);
}

async function handleApplyFilter() {
    const selectedAgency = document.getElementById('agencyFilter').value;
    const dataHold = globalState.getState().dataHold || [];
    const filteredData =
        selectedAgency === 'All'
            ? dataHold
            : dataHold.filter((item) => item.agency_type === selectedAgency);

    globalState.setState({ reportData: filteredData });
    console.log("Filtered report data:", filteredData);

    const orchestrator = new LoadOrchestrator(globalState.getState().selectedReportType);
    orchestrator.refreshReport(); // Use refresh instead of orchestrateLoad
}

function onDateRangeSelect(selectedRange, customData) {
    globalState.setState({
        dateRange: selectedRange,
        customDateData: customData,
    });
}

// Export the template for testing or external registration
export default agencyReportForm;
