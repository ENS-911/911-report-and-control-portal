import { globalState } from '../../reactive/state.js';
import { fetchReportData } from '../../api/fetchReportData.js';
import { renderPages } from '../components/pageBuilder.js';
import PageController from '../controllers/PageController.js';
import { createTitleComponent } from '../components/reportTitle.js';
import { createTableComponent } from '../components/tableComponent.js';
import { allAgencyTypes } from '../components/allAgencyTypes.js';

export class LoadOrchestrator {
    constructor(templateConfig) {
        this.templateConfig = templateConfig;
        this.templateComponents = templateConfig.components || [];
        this.pageController = new PageController();
    }

    async orchestrateLoad() {
        try {
            // Fetch data and update state
            const reportData = await this.fetchAndSetReportData();

            // Check agency types and update component order dynamically
            const dynamicOrder = this.getDynamicComponentOrder(reportData);

            // Update global state with the component order
            globalState.setState({
                clientComponentOrder: dynamicOrder,
                reportTitle: this.templateConfig.getTitle(),
            });

            // Initialize components based on the dynamic order
            this.initializeComponents(dynamicOrder);

            const pages = this.pageController.finalizePages().filter((page) => page.length > 0);
            console.log("Pages to render:", pages);

            renderPages(pages); // Render the finalized pages
        } catch (error) {
            console.error("Error in orchestrateLoad:", error);
        }
    }

    refreshReport() {
        try {
            // Use existing report data from global state
            const reportData = globalState.getState().reportData;

            if (!reportData || reportData.length === 0) {
                console.error("No report data available for refreshing.");
                return;
            }

            // Determine the component load order dynamically
            const dynamicOrder = this.getDynamicComponentOrder(reportData);

            // Initialize and render components
            this.pageController = new PageController(); // Reset page controller for a fresh render
            this.initializeComponents(dynamicOrder);

            const pages = this.pageController.finalizePages().filter(page => page.length > 0);
            renderPages(pages);
        } catch (error) {
            console.error("Error in refreshReport:", error);
        }
    }

    async fetchAndSetReportData() {
        const state = globalState.getState();
        const reportType = state.selectedReportType;
        const clientKey = state.clientData?.key;

        const reportFilters = this.buildReportFilters();

        const reportData = await fetchReportData(reportType, reportFilters, clientKey);

        globalState.setState({
            reportData,
            dataHold: reportData, // Preserve a master copy
        });

        return reportData;
    }

    buildReportFilters() {
        const dateRangeSelector = document.getElementById('dateRangeSelector').value;
        const filters = {};

        if (dateRangeSelector === 'selectHours') {
            const hoursInput = document.getElementById('hoursInput').value;
            if (hoursInput) {
                filters.hours = hoursInput;
            } else {
                throw new Error("Hours input is required for 'selectHours'.");
            }
        } else if (dateRangeSelector === 'selectDateRange') {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            if (startDate && endDate) {
                filters.startDate = startDate;
                filters.endDate = endDate;
                filters.dateRange = 'selectDateRange';
            } else {
                throw new Error("Both start and end dates are required.");
            }
        } else {
            filters.dateRange = dateRangeSelector;
        }

        return filters;
    }

    getDynamicComponentOrder(reportData) {
        let componentOrder = [...this.templateComponents];

        if (this.templateConfig.name === "Agency Report") {
            const agencyTypes = this.checkAgencyTypes(reportData);
            if (agencyTypes.length > 1 && !componentOrder.includes('agencyType')) {
                componentOrder.splice(1, 0, 'agencyType');
            }
        }

        const userDefinedOrder = globalState.getState().userComponentOrder;
        return userDefinedOrder || componentOrder;
    }

    checkAgencyTypes(reportData) {
        const uniqueTypes = [...new Set(reportData.map(item => item.agency_type))];
        console.log("Agency Types:", uniqueTypes);
        return uniqueTypes;
    }

    initializeComponents(componentOrder) {
        const components = {
            title: () => this.initializeTitleComponent(),
            agencyType: () => this.initializeAgencyTypeComponent(),
            table: () => this.initializeTableComponent(),
        };

        componentOrder.forEach((componentName) => {
            if (components[componentName]) {
                console.log(`Initializing component: ${componentName}`);
                components[componentName]();
            }
        });
    }

    initializeAgencyTypeComponent() {
        const reportData = globalState.getState().reportData;

        if (!reportData || !Array.isArray(reportData)) {
            console.error("Invalid or missing report data for Agency Type Component.");
            return;
        }

        const agencyTypes = this.checkAgencyTypes(reportData);
        const agencyTypeComponent = agencyTypes.length > 1 ? allAgencyTypes() : singleAgencyType();

        this.pageController.addContentToPage(agencyTypeComponent);
    }

    initializeTitleComponent() {
        const title = this.templateConfig.getTitle();
        const titleComponent = createTitleComponent(title);
        this.pageController.addContentToPage(titleComponent, true);
    }

    initializeTableComponent() {
        createTableComponent(this.pageController);
    }
}
