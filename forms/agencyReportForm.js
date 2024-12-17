// agencyReportForm.js

import { fetchReportData } from '../api/fetchReportData.js'; // Adjust the path as needed
import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';
import { createTableComponent } from '../forms/components/tableComponent.js';
import { allAgencyTypes } from '../forms/components/allAgencyTypes.js';
import { singleAgencyType } from '../forms/components/singleAgencyType.js';
import { incidentTypeChart } from '../forms/components/incidentTypeChart.js';
import LoadOrchestrator from './controllers/LoadOrchestrator.js'; // Ensure correct path

const agencyReportForm = {
    name: "Agency Report",
    components: ['title', 'agencyType', 'incidentType', 'table'], // Added 'incidentType'

    getTitle: function () {
        const state = globalState.getState();
        return state.reportTitle || "Agency Report";
    },

    /**
     * Initializes all components in the specified order.
     * @param {PageController} pageController - The controller to manage page content.
     */
    async initializeComponents(pageController) {
        console.log('Initializing all components with data:', globalState.getState().reportData);
        if (!pageController) {
            console.error('PageController is undefined in initializeComponents.');
            return;
        }

        // Clear existing content before initializing
        pageController.clearContent();

        const data = globalState.getState().reportData;

        const components = {
            title: async () => {
                const titleText = this.getTitle();
                const titleComponent = createTitleComponent(titleText);
                await pageController.addContentToPage(titleComponent, true);
            },
            agencyType: async () => {
                const agencyTypes = [...new Set(data.map(item => item.agency_type))];
                let agencyTypeComponent;

                if (agencyTypes.length > 1) {
                    agencyTypeComponent = await allAgencyTypes(); // Should return a Node
                } else if (agencyTypes.length === 1) {
                    agencyTypeComponent = await singleAgencyType(agencyTypes[0]); // Pass the single agency type
                } else {
                    console.warn('No agency data available.');
                    // Optionally, display a message indicating no data
                    agencyTypeComponent = document.createElement('div');
                    agencyTypeComponent.id = 'no-data-component';
                    agencyTypeComponent.innerHTML = `<p>No agency data available.</p>`;
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
                if (!incidentTypeComponent || !(incidentTypeComponent instanceof Node)) {
                    console.error('incidentTypeComponent is not a valid DOM Node:', incidentTypeComponent);
                    return;
                }
                await pageController.addContentToPage(incidentTypeComponent);
            },
            table: async () => {
                console.log('Table Data: ', data);
                const tableComponent = await createTableComponent(pageController, data); // Pass `data`
                if (!tableComponent || !(tableComponent instanceof Node)) {
                    console.error('tableComponent is not a valid DOM Node:', tableComponent);
                    return;
                }
                await pageController.addContentToPage(tableComponent);
            },
        };

        for (const componentName of this.components) {
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
export function loadReportComponents(pageController) {
    const menuContent = document.getElementById('menuContent');

    if (!menuContent.querySelector('#reportDateRangeSelector')) {
        const dateRangeSelector = DateRangeSelector(onRangeSelect);
        menuContent.appendChild(dateRangeSelector);
    }
}

/**
 * Callback function to handle range selection and data fetching
 * @param {string} selectedRange 
 * @param {Object} customData 
 */
async function onRangeSelect(selectedRange, customData) {
    const fetchButton = document.getElementById('fetchReportData');
    fetchButton.disabled = true; // Disable the button to prevent multiple clicks
    try {
        console.log(`Selected Range: ${selectedRange}`, customData);
        displayLoadingMessage(); // Show loading indicator

        const reportFilters = {
            dateRange: selectedRange,
            ...customData,
        };

        // Validate user inputs if necessary
        // e.g., validateCustomData(selectedRange, customData);

        // Update globalState to signal that data fetching should occur
        globalState.setState({
            reportFilters, // Store the filters
        });

        // Instantiate LoadOrchestrator if not already instantiated
        const pageController = globalState.getState().pageController;
        if (!pageController) {
            console.error('PageController is not set in globalState.');
            throw new Error('PageController is not initialized.');
        }
        const orchestrator = new LoadOrchestrator('agencyReport', pageController);
        await orchestrator.orchestrateLoad(); // Orchestrate the loading process

        removeLoadingMessage(); // Remove loading indicator after data is loaded

    } catch (error) {
        console.error('Error in onRangeSelect:', error);
        displayErrorMessage(error);
        removeLoadingMessage(); // Remove loading indicator on error
    } finally {
        fetchButton.disabled = false; // Re-enable the button
    }
}

/**
 * Renders the report based on globalState.reportData
 */
function renderReport() {
    console.log('Rendering report with data:', globalState.getState().reportData);
    const pageController = globalState.getState().pageController;
    if (!pageController) {
        console.error('PageController is not available for rendering.');
        return;
    }
    pageController.clearContent(); // Clear existing report

    // Instantiate LoadOrchestrator with the correct template and PageController
    const orchestrator = new LoadOrchestrator('agencyReport', pageController);
    orchestrator.orchestrateLoad(); // Orchestrate the loading process
}

/**
 * Handles the "Apply Filter" button click
 */
async function handleApplyFilter() {
    const selectedAgency = getSelectedAgency(); // Implement this function to retrieve selected agency
    const dataHold = globalState.getState().mainData || [];
    const filteredData =
        selectedAgency === 'All'
            ? [...dataHold]
            : dataHold.filter((item) => item.agency_type === selectedAgency);

    if (filteredData.length > 0) {
        globalState.setState({ reportData: [...filteredData] }); // Shallow copy
        console.log("Filtered report data:", filteredData);
        renderReport(); // Directly render with filtered data
    } else {
        console.warn('No data matches the selected filter.');
        displayNoFilteredDataMessage(); // Implement this function to inform the user
    }
}

/**
 * Sets up the agency filter controls after report rendering
 */
function setupAgencyFilterControls() {
    const menuContent = document.getElementById('menuContent');

    // Remove existing filter controls if any
    const existingFilter = menuContent.querySelector('#agencyFilterControls');
    if (existingFilter) existingFilter.remove();

    // Create filter controls
    const filterContainer = document.createElement('div');
    filterContainer.id = 'agencyFilterControls';

    const dropdownLabel = document.createElement('label');
    dropdownLabel.textContent = 'Filter by Agency:';
    dropdownLabel.setAttribute('for', 'agencyFilter');

    const dropdown = document.createElement('select');
    dropdown.id = 'agencyFilter';
    dropdown.innerHTML = `<option value="All">All</option>`; // Add "All" option

    // Populate dropdown with unique agency types
    const reportData = globalState.getState().reportData || [];
    const uniqueAgencyTypes = [...new Set(reportData.map(item => item.agency_type))];

    uniqueAgencyTypes.forEach((agencyType) => {
        const option = document.createElement('option');
        option.value = agencyType;
        option.textContent = agencyType;
        dropdown.appendChild(option);
    });

    filterContainer.appendChild(dropdownLabel);
    filterContainer.appendChild(dropdown);

    // Add "Apply Filter" button
    const applyFilterButton = document.createElement('button');
    applyFilterButton.id = 'applyFilterButton';
    applyFilterButton.textContent = 'Apply Filter';
    applyFilterButton.addEventListener('click', handleApplyFilter);
    filterContainer.appendChild(applyFilterButton);

    menuContent.appendChild(filterContainer);
}

/**
 * Utility function to get selected agency
 * @returns {string} Selected agency or 'All'
 */
function getSelectedAgency() {
    const dropdown = document.getElementById('agencyFilter');
    return dropdown ? dropdown.value : 'All';
}

/**
 * Utility function to display loading message
 */
function displayLoadingMessage() {
    // Check if the overlay already exists to prevent duplicates
    if (document.getElementById('loadingOverlay')) return;

    // Create the overlay div
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-live', 'assertive');
    overlay.setAttribute('aria-busy', 'true');
    
    // Create the spinner div
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    // Create the two bounce divs for the spinner
    const bounce1 = document.createElement('div');
    bounce1.className = 'double-bounce1';
    const bounce2 = document.createElement('div');
    bounce2.className = 'double-bounce2';
    
    // Append the bounces to the spinner
    spinner.appendChild(bounce1);
    spinner.appendChild(bounce2);
    
    // Create the loading text
    const loadingText = document.createElement('p');
    loadingText.textContent = 'Loading data...';
    
    // Append spinner and text to the overlay
    overlay.appendChild(spinner);
    overlay.appendChild(loadingText);
    
    // Append the overlay to the body
    document.body.appendChild(overlay);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
}

/**
 * Removes the loading overlay from the DOM
 */
function removeLoadingMessage() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
    // Restore scrolling
    document.body.style.overflow = 'auto';
}

/**
 * Utility function to display no data message
 */
function displayNoDataMessage() {
    const reportContainer = document.getElementById('contentBody');
    if (reportContainer) {
        reportContainer.innerHTML = '<p>No data available for the selected date range.</p>';
    }
}

/**
 * Utility function to display no filtered data message
 */
function displayNoFilteredDataMessage() {
    const reportContainer = document.getElementById('contentBody');
    if (reportContainer) {
        reportContainer.innerHTML = '<p>No data available for the selected filter.</p>';
    }
}

/**
 * Utility function to display error message
 * @param {Error} error 
 */
function displayErrorMessage(error) {
    const reportContainer = document.getElementById('contentBody');
    if (reportContainer) {
        reportContainer.innerHTML = `<p>Error fetching data: ${error.message}. Please try again later.</p>`;
    }
}

export default agencyReportForm;
