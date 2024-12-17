// LoadOrchestrator.js

import { globalState } from '../../reactive/state.js';
import { fetchReportData } from '../../api/fetchReportData.js';
import { renderPages } from '../components/pageBuilder.js';
import PageController from './PageController.js';
import { createTitleComponent } from '../components/reportTitle.js';
import { allAgencyTypes } from '../components/allAgencyTypes.js';
import { createTableComponent } from '../components/tableComponent.js';
import { incidentTypeChart } from '../components/incidentTypeChart.js';

const templateRegistry = new Map();

/**
 * LoadOrchestrator manages the overall process of loading report data and organizing components into pages.
 */
export class LoadOrchestrator {
    /**
     * Initializes the LoadOrchestrator with a specific template configuration.
     * @param {string} templateName - The name of the template to use.
     */
    constructor(templateName) {
        this.templateConfig = templateRegistry.get(templateName);
        if (!this.templateConfig) {
            throw new Error(`Template configuration not found for: ${templateName}`);
        }
        this.pageController = null;
    }

    /**
     * Registers a new template configuration.
     * @param {string} name - The name of the template.
     * @param {object} templateConfig - The configuration object for the template.
     */
    static registerTemplate(name, templateConfig) {
        if (!name || !templateConfig) {
            throw new Error("Template name and configuration are required for registration.");
        }
        templateRegistry.set(name, templateConfig);
    }

    /**
     * Orchestrates the loading of report components into pages.
     */
    async orchestrateLoad() {
        try {
            console.log("Starting orchestrateLoad...");

            // Check if reportData exists and has content
            let reportData = globalState.getState().reportData;
            if (!reportData || reportData.length === 0) {
                console.log("No report data found. Fetching new data...");
                reportData = await this.fetchAndSetReportData();
            }

            if (!reportData || reportData.length === 0) {
                throw new Error("No report data available to load components.");
            }

            console.log("Report data available for orchestrating load:", reportData);

            // Initialize PageController with fixed page height and footer height
            const MAX_PAGE_HEIGHT = 1056; // Fixed page height
            const FOOTER_HEIGHT = 50; // Fixed footer height
            this.pageController = new PageController(MAX_PAGE_HEIGHT, FOOTER_HEIGHT); // Instantiate PageController
            globalState.setState({ pageController: this.pageController });
            console.log("PageController initialized.");

            // Initialize components based on template configuration
            const componentOrder = this.templateConfig.components;
            console.log("Component order from template:", componentOrder);

            for (const componentName of componentOrder) {
                if (!componentName) {
                    console.warn(`Component name is undefined or empty.`);
                    continue; // Skip undefined or empty component names
                }

                let component = null;

                switch (componentName) {
                    case 'title':
                        component = createTitleComponent(this.templateConfig.getTitle());
                        break;
                    case 'agencyType':
                        component = await allAgencyTypes(); // Await asynchronous function
                        break;
                    case 'incidentType':
                        component = await incidentTypeChart(); // Await asynchronous function
                        break;
                    case 'table':
                        component = await createTableComponent(this.pageController); // Await asynchronous function
                        break;
                    default:
                        console.warn(`Unknown component type: ${componentName}`);
                }

                if (component) {
                    await this.pageController.addContentToPage(component);
                    console.log(`Added ${componentName} component.`);
                }
            }

            // Finalize all pages by adding footers to pages without them
            if (typeof this.pageController.finalizePages === 'function') {
                const finalizedPages = this.pageController.finalizePages(); // Now returns pages
                console.log("Pages finalized with footers:", finalizedPages);
            } else {
                console.error("finalizePages method is not defined in PageController.");
            }

            // Render all pages to the DOM
            console.log("Rendering pages:", this.pageController.pages);
            renderPages(this.pageController.pages);
            console.log("Rendered all pages.");
        } catch (error) {
            console.error("Error in orchestrateLoad:", error);
        }
    }
                  
    /**
     * Refreshes the report by re-initializing the PageController and re-adding components.
     */
    async refreshReport() {
        try {
            console.log("Starting refreshReport...");

            // Use existing report data
            const reportData = globalState.getState().reportData || [];
            if (reportData.length === 0) {
                console.error("No report data available for refreshing.");
                return;
            }

            // Initialize a new PageController
            const MAX_PAGE_HEIGHT = 1056; // Fixed page height
            const FOOTER_HEIGHT = 50; // Fixed footer height
            this.pageController = new PageController(MAX_PAGE_HEIGHT, FOOTER_HEIGHT);
            globalState.setState({ pageController: this.pageController });
            console.log("PageController initialized for refresh.");

            // Initialize components based on template configuration
            const componentOrder = this.templateConfig.components;
            console.log("Component order from template:", componentOrder);

            for (const componentName of componentOrder) {
                let component = null;

                switch(componentName) { // Switching directly on the string
                    case 'title':
                        component = createTitleComponent(this.templateConfig.getTitle());
                        break;
                    case 'agencyType':
                        component = await allAgencyTypes();
                        break;
                    case 'incidentType':
                        component = await incidentTypeChart();
                        break;
                    case 'table':
                        component = await createTableComponent(this.pageController);
                        break;
                    default:
                        console.warn(`Unknown component type: ${componentName}`);
                }

                if (component) {
                    await this.pageController.addContentToPage(component);
                    console.log(`Added ${componentName} component.`);
                }
            }

            // Finalize all pages by adding footers
            if (typeof this.pageController.finalizePages === 'function') {
                const finalizedPages = this.pageController.finalizePages(); // Now returns pages
                console.log("Pages finalized with footers:", finalizedPages);
            } else {
                console.error("finalizePages method is not defined in PageController.");
            }

            // Render all pages to the DOM
            console.log("Rendering pages:", this.pageController.pages);
            renderPages(this.pageController.pages);
            console.log("Refreshed and rendered all pages.");
        } catch (error) {
            console.error("Error in refreshReport:", error);
        }
    }    

    /**
     * Fetches report data and sets it in the global state.
     * @returns {Array} - The fetched report data.
     */
    async fetchAndSetReportData() {
        try {
            console.log('Attempting to fetch report data...');
            const state = globalState.getState();
            const reportType = state.selectedReportType;
            const clientKey = state.clientData?.key;

            const reportFilters = this.buildReportFilters();

            const reportData = await fetchReportData(reportType, reportFilters, clientKey);
            console.log('Fetched report data:', reportData);
            globalState.setState({
                reportData,
                dataHold: reportData, // Preserve a master copy
            });

            return reportData;
        } catch (error) {
            console.error("Error fetching and setting report data:", error);
            return [];
        }
    }

    /**
     * Builds report filters based on user input.
     * @returns {object} - The report filters.
     */
    buildReportFilters() {
        const dateRangeSelector = document.getElementById('dateRangeSelector')?.value;
        const filters = {};

        if (dateRangeSelector === 'selectHours') {
            const hoursInput = document.getElementById('hoursInput')?.value;
            if (hoursInput) {
                filters.hours = hoursInput;
            } else {
                throw new Error("Hours input is required for 'selectHours'.");
            }
        } else if (dateRangeSelector === 'selectDateRange') {
            const startDate = document.getElementById('startDate')?.value;
            const endDate = document.getElementById('endDate')?.value;

            if (startDate && endDate) {
                filters.startDate = startDate;
                filters.endDate = endDate;
                filters.dateRange = 'selectDateRange';
            } else {
                throw new Error("Both start and end dates are required.");
            }
        } else {
            filters.dateRange = dateRangeSelector || 'all';
        }

        return filters;
    }
}

export default LoadOrchestrator;
