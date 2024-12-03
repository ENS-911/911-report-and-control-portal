import { globalState } from '../../reactive/state.js';
import { fetchReportData } from '../../api/fetchReportData.js';
import { renderPages } from '../components/pageBuilder.js';
import PageController from '../controllers/PageController.js';

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
    
            // Explicitly check if reportData exists and has content
            let reportData = globalState.getState().reportData;
            if (!reportData || reportData.length === 0) {
                console.log("No report data found. Fetching new data...");
                reportData = await this.fetchAndSetReportData();
            }
    
            if (!reportData || reportData.length === 0) {
                throw new Error("No report data available to load components.");
            }
    
            console.log("Report data available for orchestrating load:", reportData);
    
            const componentOrder = this.templateConfig.components;
            console.log("Component order from template:", componentOrder);
    
            this.pageController = new PageController();
            await this.templateConfig.initializeComponents(this.pageController, componentOrder);
    
            const pages = this.pageController.finalizePages()
            console.log("Pages finalized:", pages);
            renderPages(pages);
        } catch (error) {
            console.error("Error in orchestrateLoad:", error);
        }
    }
    
              

    async refreshReport() {
        try {
            // Use existing report data
            const reportData = globalState.getState().reportData || [];
            if (reportData.length === 0) {
                console.error("No report data available for refreshing.");
                return;
            }
    
            // Reload components and re-render
            const componentOrder = this.templateConfig.components;
            console.log("Refreshing components with order:", componentOrder);
    
            this.pageController = new PageController();
    
            // Await the initialization of components
            await this.templateConfig.initializeComponents(this.pageController, componentOrder);
    
            // Finalize pages after components are initialized
            const pages = this.pageController.finalizePages().filter(page => page.length > 0);
            renderPages(pages);
        } catch (error) {
            console.error("Error in refreshReport:", error);
        }
    }    

    async fetchAndSetReportData() {
        try {
            console.log('trying to fetch')
            const state = globalState.getState();
            const reportType = state.selectedReportType;
            const clientKey = state.clientData?.key;

            const reportFilters = this.buildReportFilters();

            const reportData = await fetchReportData(reportType, reportFilters, clientKey);
            console.log('what I fetched: ', reportData)
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
