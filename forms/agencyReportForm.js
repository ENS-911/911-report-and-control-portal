// agencyReportForm.js

import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { createTitleComponent } from '../forms/components/reportTitle.js';
import { createTableComponent } from '../forms/components/tableComponent.js';
import { allAgencyTypes } from '../forms/components/allAgencyTypes.js';
import { singleAgencyType } from '../forms/components/singleAgencyType.js';
import { incidentTypeChart } from '../forms/components/incidentTypeChart.js';
import LoadOrchestrator from './controllers/LoadOrchestrator.js';

const agencySelect = document.createElement('select');
const battalionSelect = document.createElement('select');
const incidentSelect = document.createElement('select');

const state = globalState.getState();

const agencyReportForm = {
    name: "Agency Report",
    components: ['title', 'agencyType', 'incidentType', 'table'], // Added 'incidentType'

    getTitle: function () {
        return state.reportTitle || "Agency Report";
    },

    /**
     * Initializes all components in the specified order.
     * @param {PageController} pageController - The controller to manage page content.
     */
    async initializeComponents(pageController) {
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
                const data = globalState.getState().reportData || [];
                const agencyTypes = [...new Set(data.map(item => item.agency_type))];
                
                console.log('Filtered length: ', agencyTypes.length)
            
                // Read filter selections from globalState
                const state = globalState.getState();
                const selectedAgency = state.selectedAgency || 'All';
                const selectedBattalion = state.selectedBattalion || 'All';
                const selectedIncident = state.selectedIncident || 'All';
            
                let groupBy = 'type_description'; // Default
                // If a single incident chosen and battalion is All, then group by battalion
                if (selectedIncident !== 'All' && selectedBattalion === 'All') {
                    console.log('battalion')
                    groupBy = 'battalion';
                } else if (selectedBattalion !== 'All' && selectedIncident === 'All') {
                    // If a single battalion chosen and incident All, group by type_description
                    console.log('incedent')
                    groupBy = 'type_description';
                } else {
                    // Any other scenario? Decide a default
                    console.log('other')
                    groupBy = 'battalion'; // or 'type_description' depending on your fallback logic
                }
            
                let agencyTypeComponent;
                if (agencyTypes.length > 1) {
                    agencyTypeComponent = await allAgencyTypes();
                } else if (agencyTypes.length === 1) {
                    const filteredData = globalState.getState().reportData || [];
                    // Now pass the dynamic groupBy
                    agencyTypeComponent = await singleAgencyType(filteredData, { groupBy: groupBy });
                } else {
                    console.warn('No agency data available.');
                    agencyTypeComponent = document.createElement('div');
                    agencyTypeComponent.id = 'no-data-component';
                    agencyTypeComponent.innerHTML = `<p>No agency data available.</p>`;
                }
            
                if (!agencyTypeComponent || !(agencyTypeComponent instanceof Node)) {
                    console.error('agencyTypeComponent is not a valid DOM Node:', agencyTypeComponent);
                    return;
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
                await components[componentName](); // Properly await the async function
            } else {
                console.warn(`Component ${componentName} is not registered.`);
            }
        }
    },
};
function resetFilters() {
    console.log('Resetting filters...');
    const agencyFilter = document.getElementById('agencyFilter');
    const battalionFilter = document.getElementById('battalionFilter');
    const incidentFilter = document.getElementById('incidentFilter');

    if (agencyFilter) {
        agencyFilter.value = 'All';
    } else {
        console.warn('agencyFilter not found during reset');
    }

    if (battalionFilter) {
        battalionFilter.value = 'All';
    } else {
        console.warn('battalionFilter not found during reset');
    }

    if (incidentFilter) {
        incidentFilter.value = 'All';
    } else {
        console.warn('incidentFilter not found during reset');
    }

    populateAgencyDropdown(); // Check if this logs and runs successfully
}

// Functions to populate dropdowns
function populateAgencyDropdown() {
    const reportData = globalState.getState().reportData || [];
    const uniqueAgencyTypes = [...new Set(reportData.map(item => item.agency_type))];

    agencySelect.innerHTML = ''; // Clear existing options
    addAllOption(agencySelect);

    uniqueAgencyTypes.forEach((agencyType) => {
        const option = document.createElement('option');
        option.value = agencyType;
        option.textContent = agencyType;
        agencySelect.appendChild(option);
    });

    // Trigger initial population of next dropdowns
    populateBattalionAndIncidentDropdowns();
}

function populateBattalionAndIncidentDropdowns() {
    const reportData = globalState.getState().reportData || [];
    const selectedAgency = agencySelect.value;
    let filteredData = reportData;

    if (selectedAgency !== 'All') {
        filteredData = filteredData.filter(item => item.agency_type === selectedAgency);
    }

    // Populate Battalion
    const uniqueBattalions = [...new Set(filteredData.map(item => item.battalion))].filter(b => b);
    battalionSelect.innerHTML = '';
    addAllOption(battalionSelect);

    uniqueBattalions.forEach(b => {
        const option = document.createElement('option');
        option.value = b;
        option.textContent = b;
        battalionSelect.appendChild(option);
    });

    // After updating battalion, update incident
    populateIncidentDropdown();
}

function populateIncidentDropdown() {
    const reportData = globalState.getState().reportData || [];
    const selectedAgency = agencySelect.value;
    const selectedBattalion = battalionSelect.value;
    let filteredData = reportData;

    if (selectedAgency !== 'All') {
        filteredData = filteredData.filter(item => item.agency_type === selectedAgency);
    }
    if (selectedBattalion !== 'All') {
        filteredData = filteredData.filter(item => item.battalion === selectedBattalion);
    }

    const uniqueIncidents = [...new Set(filteredData.map(item => item.type_description))].filter(i => i);
    incidentSelect.innerHTML = '';
    addAllOption(incidentSelect);

    uniqueIncidents.forEach(i => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        incidentSelect.appendChild(option);
    });
}

function addAllOption(selectElement) {
    const allOption = document.createElement('option');
    allOption.value = 'All';
    allOption.textContent = 'All';
    selectElement.appendChild(allOption);
}

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
        displayLoadingMessage();

        const reportFilters = {
            dateRange: selectedRange,
            ...customData,
        };

        globalState.setState({
            reportFilters, // Store the filters
        });

        const pageController = globalState.getState().pageController;
        if (!pageController) {
            console.error('PageController is not set in globalState.');
            throw new Error('PageController is not initialized.');
        }

        const orchestrator = new LoadOrchestrator('agencyReport', pageController);
        await orchestrator.orchestrateLoad(); // Orchestrate the loading process

        setupAgencyFilterControls();
        removeLoadingMessage();
        resetFilters();

    } catch (error) {
        console.error('Error in onRangeSelect:', error);
        displayErrorMessage(error);
        removeLoadingMessage(); // Remove loading indicator on error
    } finally {
        fetchButton.disabled = false; // Re-enable the button
    }
}

async function handleApplyFilter() {
    const selectedAgency = document.getElementById('agencyFilter').value;
    const selectedBattalion = document.getElementById('battalionFilter').value;
    const selectedIncident = document.getElementById('incidentFilter').value;

    globalState.setState({
        selectedAgency,
        selectedBattalion,
        selectedIncident,
    });

    const mainData = globalState.getState().mainData || [];
    let filteredData = mainData;

    // Apply filters to mainData
    if (selectedAgency !== 'All') {
        filteredData = filteredData.filter(item => item.agency_type === selectedAgency);
    }
    if (selectedBattalion !== 'All') {
        filteredData = filteredData.filter(item => item.battalion === selectedBattalion);
    }
    if (selectedIncident !== 'All') {
        filteredData = filteredData.filter(item => item.type_description === selectedIncident);
    }

    // Update reportData with the newly filtered data
    globalState.setState({ reportData: filteredData });

    // Decide how to group data in singleAgencyType based on the chosen filters
    let options = {};
    // If the user selected a single incident but all battalions, group by battalion
    if (selectedIncident !== 'All' && selectedBattalion === 'All') {
        options.groupBy = 'battalion';
    } else if (selectedBattalion !== 'All' && selectedIncident === 'All') {
        // If a single battalion is chosen and incident is 'All', show by incident type
        options.groupBy = 'type_description';
    } else {
        // Default scenario (adjust as needed)
        options.groupBy = 'battalion';
    }

    const pageController = globalState.getState().pageController;
    pageController.clearContent();

    const orchestrator = new LoadOrchestrator(globalState.getState().selectedReportType, pageController);

    // Now, how you actually call singleAgencyType depends on your workflow.
    // If singleAgencyType is called inside initializeComponents(), you'll need to pass 'options' somehow.
    // If you're calling singleAgencyType directly here, you can do:

    // Example of direct call (if you're allowed to):
    const agencyTypeComponent = await singleAgencyType(filteredData, options);
    await pageController.addContentToPage(agencyTypeComponent);

    // After adding the agencyType component directly, you may also re-initialize other components as needed.
    // Or if you rely on refreshReport() to rebuild components:
    await orchestrator.refreshReport();
}


function setupAgencyFilterControls() {
    const menuContent = document.getElementById('menuContent');

    // Remove existing filter controls if any
    const existingFilter = menuContent.querySelector('#agencyFilterControlsWrapper');
    if (existingFilter) existingFilter.remove();

    // Create a wrapper to center everything
    const wrapper = document.createElement('div');
    wrapper.id = 'agencyFilterControlsWrapper';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.textAlign = 'center';

    // Insert an SVG (as <img>) above the first label
    const svgImg = document.createElement('div');
    svgImg.innerHTML = `
        <svg width="50" height="50" viewBox="0 0 50 50" aria-hidden="true" style="display:block;">
            <path d="M5 10h40l-15 20v10l-10 5v-15L5 10Z" fill="white" stroke="none"/>
        </svg>
    `;
    // Append svgImg above your label in the wrapper as you did with the img
    wrapper.appendChild(svgImg);

    // Create filter controls container
    const filterContainer = document.createElement('div');
    filterContainer.id = 'agencyFilterControls';
    filterContainer.style.display = 'flex';
    filterContainer.style.flexDirection = 'column';
    filterContainer.style.alignItems = 'center';
    filterContainer.style.width = '100%'; // Adjust width as needed

    // Create agency dropdown
    const agencyLabel = document.createElement('label');
    agencyLabel.textContent = 'Filter by Agency:';
    agencyLabel.setAttribute('for', 'agencyFilter');
    agencyLabel.style.marginBottom = '5px';
    filterContainer.appendChild(agencyLabel);

    agencySelect.id = 'agencyFilter';
    filterContainer.appendChild(agencySelect);

    // Create battalion dropdown
    const battalionLabel = document.createElement('label');
    battalionLabel.textContent = 'Filter by Battalion:';
    battalionLabel.setAttribute('for', 'battalionFilter');
    battalionLabel.style.marginTop = '10px';
    battalionLabel.style.marginBottom = '5px';
    filterContainer.appendChild(battalionLabel);

    battalionSelect.id = 'battalionFilter';
    filterContainer.appendChild(battalionSelect);

    // Create incident type dropdown
    const incidentLabel = document.createElement('label');
    incidentLabel.textContent = 'Filter by Incident Type:';
    incidentLabel.setAttribute('for', 'incidentFilter');
    incidentLabel.style.marginTop = '10px';
    incidentLabel.style.marginBottom = '5px';
    filterContainer.appendChild(incidentLabel);

    incidentSelect.id = 'incidentFilter';
    filterContainer.appendChild(incidentSelect);

    // Add "Apply Filter" button
    const applyFilterButton = document.createElement('button');
    applyFilterButton.id = 'applyFilterButton';
    applyFilterButton.textContent = 'Apply Filter';
    applyFilterButton.style.marginTop = '10px';
    applyFilterButton.addEventListener('click', handleApplyFilter);
    filterContainer.appendChild(applyFilterButton);

    wrapper.appendChild(filterContainer);
    menuContent.appendChild(wrapper);

    // Initial population of agency dropdown
    populateAgencyDropdown();

    // Add event listeners for cascading changes
    agencySelect.addEventListener('change', () => {
        populateBattalionAndIncidentDropdowns();
    });

    battalionSelect.addEventListener('change', () => {
        populateIncidentDropdown();
    });
}

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

function removeLoadingMessage() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
    // Restore scrolling
    document.body.style.overflow = 'auto';
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
