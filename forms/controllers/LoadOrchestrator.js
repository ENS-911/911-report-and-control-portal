// LoadOrchestrator.js

import { globalState } from '../../reactive/state.js';
import { fetchReportData } from '../../api/fetchReportData.js';
import { renderPages } from '../components/pageBuilder.js';
import PageController from './PageController.js';
import { createTitleComponent } from '../components/reportTitle.js';
import { createDivComponent } from '../components/createDivComponent.js';
import { createTableComponent } from '../components/tableComponent.js';

const templateRegistry = new Map();

export class LoadOrchestrator {
    constructor(templateName) {
        this.templateConfig = templateRegistry.get(templateName);
        if (!this.templateConfig) {
            throw new Error(`Template configuration not found for: ${templateName}`);
        }
        this.pageController = null;
    }

    static registerTemplate(name, templateConfig) {
        if (!name || !templateConfig) {
            throw new Error("Template name and configuration are required for registration.");
        }
        templateRegistry.set(name, templateConfig);
    }

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

            // Initialize PageController with standard page height
            const MAX_PAGE_HEIGHT = 1056; // Adjust as per your requirements
            this.pageController = new PageController(MAX_PAGE_HEIGHT);
            console.log("PageController initialized.");

            // Initialize components based on template configuration
            const componentOrder = this.templateConfig.components;
            console.log("Component order from template:", componentOrder);

            for (const componentName of componentOrder) {
                if (!componentName) {
                    console.warn(`Component name is undefined or empty.`);
                    continue; // Skip undefined or empty component names
                }

                switch (componentName) {
                    case 'title':
                        const title = createTitleComponent(component.text);
                        await this.pageController.addComponent(title);
                        console.log("Added title component.");
                        break;
                    case 'agencyType':
                        const agencyTypeHTML = `
                            <p>All Agency Types Content</p>
                            <!-- Add more HTML as needed -->
                        `;
                        const agencyTypeDiv = createDivComponent('all-agency-types', agencyTypeHTML);
                        await this.pageController.addComponent(agencyTypeDiv);
                        console.log("Added agency type component.");
                        break;
                    case 'incidentType':
                        const incidentTypeHTML = `
                            <p>Incident Type Chart Content</p>
                            <!-- Add more HTML or embed charts as needed -->
                        `;
                        const incidentTypeDiv = createDivComponent('incident-type-chart', incidentTypeHTML);
                        await this.pageController.addComponent(incidentTypeDiv);
                        console.log("Added incident type component.");
                        break;
                    case 'table':
                        const table = createTableComponent(reportData);
                        await this.pageController.addComponent(table);
                        console.log("Added table component.");
                        break;
                    default:
                        console.warn(`Unknown component type: ${component.type}`);
                }
            }

            // Finalize all pages by adding footers
            if (typeof this.pageController.finalizePages === 'function') {
                this.pageController.finalizePages();
                console.log("Pages finalized with footers.");
            } else {
                console.error("finalizePages method is not defined in PageController.");
            }

            // Render all pages to the DOM
            renderPages(this.pageController.pages);
            console.log("Rendered all pages.");
        } catch (error) {
            console.error("Error in orchestrateLoad:", error);
        }
    }
              
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
            const MAX_PAGE_HEIGHT = 1056; // Adjust as per your requirements
            this.pageController = new PageController(MAX_PAGE_HEIGHT);
            console.log("PageController initialized for refresh.");

            // Initialize components based on template configuration
            const componentOrder = this.templateConfig.components;
            console.log("Component order from template:", componentOrder);

            for (const component of componentOrder) {
                switch (component.type) {
                    case 'title':
                        const title = createTitleComponent(component.text);
                        await this.pageController.addComponent(title);
                        console.log("Added title component.");
                        break;
                    case 'agencyType':
                        const agencyTypeHTML = `
                            <p>All Agency Types Content</p>
                            <!-- Add more HTML as needed -->
                        `;
                        const agencyTypeDiv = createDivComponent('all-agency-types', agencyTypeHTML);
                        await this.pageController.addComponent(agencyTypeDiv);
                        console.log("Added agency type component.");
                        break;
                    case 'incidentType':
                        const incidentTypeHTML = `
                            <p>Incident Type Chart Content</p>
                            <!-- Add more HTML or embed charts as needed -->
                        `;
                        const incidentTypeDiv = createDivComponent('incident-type-chart', incidentTypeHTML);
                        await this.pageController.addComponent(incidentTypeDiv);
                        console.log("Added incident type component.");
                        break;
                    case 'table':
                        const table = createTableComponent(reportData);
                        await this.pageController.addComponent(table);
                        console.log("Added table component.");
                        break;
                    default:
                        console.warn(`Unknown component type: ${component.type}`);
                }
            }

            // Finalize all pages by adding footers
            this.pageController.finalizePages();
            console.log("Pages finalized with footers.");

            // Render all pages to the DOM
            renderPages(this.pageController.pages);
            console.log("Refreshed and rendered all pages.");
        } catch (error) {
            console.error("Error in refreshReport:", error);
        }
    }    

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
