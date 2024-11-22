import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { LoadOrchestrator } from '../forms/controllers/LoadOrchestrator.js';

export const agencyReportTemplate = {
    name: "Agency Report",
    components: ['title', 'agencyType', 'table'],
    getTitle: () => {
        const state = globalState.getState();
        return state.reportTitle || "Agency Report";
    },
    additionalConfig: {
        // Any other metadata needed for the template
    },
};

export function loadReportComponents() {
    const menuContent = document.getElementById('menuContent');

    if (!menuContent.querySelector('#reportDateRangeSelector')) {
        const dateRangeSelector = DateRangeSelector(onDateRangeSelect);
        menuContent.appendChild(dateRangeSelector);

        const fetchButton = dateRangeSelector.querySelector('#fetchReportData');
        fetchButton.addEventListener('click', handleFetchData);
    }
}

async function handleFetchData() {
    try {
        const orchestrator = new LoadOrchestrator(agencyReportTemplate);
        await orchestrator.orchestrateLoad();
    } catch (error) {
        console.error("Error fetching report data:", error);
    }
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
