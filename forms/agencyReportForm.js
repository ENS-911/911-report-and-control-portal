import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { globalState } from '../reactive/state.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';
import { createTableComponent } from '../forms/components/tableComponent.js';
import { allAgencyTypes } from '../forms/components/allAgencyTypes.js';
import { singleAgencyType } from '../forms/components/singleAgencyType.js';
import { LoadOrchestrator } from '../forms/controllers/LoadOrchestrator.js';
import { incidentTypeChart } from '../forms/components/incidentTypeChart.js';

const agencyReportForm = {
    name: "Agency Report",
    components: ['title', 'agencyType', 'incidentType', 'table'], // Added 'incidentType'

    getTitle: () => {
        const state = globalState.getState();
        return state.reportTitle || "Agency Report";
    },

    async initializeComponents(pageController, componentOrder) {
        const components = {
            title: async () => {
                const titleText = this.getTitle();
                const titleComponent = createTitleComponent(titleText);
                await pageController.addContentToPage(titleComponent, true);
            },
            agencyType: async () => {
                const reportData = globalState.getState().reportData || [];
                const agencyTypes = [...new Set(reportData.map(item => item.agency_type))];
                let agencyTypeComponent;
            
                if (agencyTypes.length > 1) {
                    agencyTypeComponent = await allAgencyTypes(); // Ensure this function returns a Node
                } else {
                    agencyTypeComponent = await singleAgencyType(); // This should now return a Node
                }
            
                // Check if agencyTypeComponent is a valid Node
                if (!agencyTypeComponent || !(agencyTypeComponent instanceof Node)) {
                    console.error('agencyTypeComponent is not a valid DOM Node:', agencyTypeComponent);
                    return; // Skip adding this component to the page
                }
            
                await pageController.addContentToPage(agencyTypeComponent);
            },
            incidentType: async () => {
                const incidentTypeComponent = incidentTypeChart();
                await pageController.addContentToPage(incidentTypeComponent);
            },
            table: async () => {
                await createTableComponent(pageController);
            },
        };

        for (const componentName of componentOrder) {
            if (components[componentName]) {
                console.log(`Initializing component: ${componentName}`);
                await components[componentName](); // Properly await the async function
            } else {
                console.warn(`Component ${componentName} is not registered.`);
            }
        }
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
