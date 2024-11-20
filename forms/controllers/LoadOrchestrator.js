// LoadOrchestrator.js
import { globalState } from '../../reactive/state.js';
import { fetchReportData } from '../../api/fetchReportData.js';
import { createTitleComponent } from '../components/reportTitle.js';
import { createTableComponent } from '../components/tableComponent.js';
import { allAgencyTypes } from '../components/allAgencyTypes.js';
import { singleAgencyType } from '../components/singleAgencyType.js';
import { renderPages } from '../components/pageBuilder.js';
import PageController from '../controllers/PageController.js';

// Component Registry
const componentRegistry = {
    title: { required: true, templates: ['all'], defaultOrder: 0 },
    agencyType: { required: false, templates: ['agencyReport'], defaultOrder: 1 },
    table: { required: true, templates: ['all'], defaultOrder: 2 },
    // Additional components...
};

// Template Configurations
const templateConfigurations = {
    agencyReport: ['title', 'agencyType', 'table'],
    otherReport: ['title', 'customComponent', 'table'],
    // Other templates...
};

export class LoadOrchestrator {
    constructor(templateName) {
        this.templateName = templateName;
        this.templateComponents = templateConfigurations[templateName] || [];
        this.pageController = new PageController();
    }

    async orchestrateLoad() {
        // Fetch data and update state
        const reportData = await this.fetchAndSetReportData();

        // Check agency types and update component order dynamically
        const dynamicOrder = this.getDynamicComponentOrder(reportData);

        // Update global state with the component order
        globalState.setState({ clientComponentOrder: dynamicOrder });

        // Initialize components based on the dynamic order
        this.initializeComponents(dynamicOrder);

        const pageController = this.pageController;
    if (pageController) {
        const pages = pageController.finalizePages().filter(page => page.length > 0);
        console.log("Pages to render after orchestrating load:", pages);
        renderPages(pages); // Explicitly trigger rendering
    } else {
        console.error("PageController not initialized.");
    }
    }

    async fetchAndSetReportData() {
        const reportType = globalState.getState().selectedReportType;
        
        // Fetch report data
        await fetchReportData(reportType);

        const reportData = globalState.getState().reportData;
        console.log("Fetched report data:", reportData);
    
        if (!reportData || reportData.length === 0) {
            console.error("No report data fetched or data is empty.");
            return [];
        }
    
        // Ensure `checkAgencyTypes` runs after state is updated
        const agencyTypes = this.checkAgencyTypes(reportData);
        const dynamicOrder = this.getDynamicComponentOrder(reportData, agencyTypes);
    
        // Set the component order in global state
        globalState.setState({ clientComponentOrder: dynamicOrder });

        console.log("Fetched and set report data:", reportData);
    
        return reportData; // Return the fetched report data for further use
    }
    
    getDynamicComponentOrder() {
        
        const reportData = globalState.getState().reportData;
        // Determine agency types from the report data
        const agencyTypes = this.checkAgencyTypes(reportData);
        console.log("Determined agency types for dynamic component order:", agencyTypes);
    
        // Start with the default component order from the template
        let componentOrder = [...this.templateComponents];
    
        // If there are multiple agency types, include the `agencyType` component
        if (agencyTypes.length > 1 && !componentOrder.includes('agencyType')) {
            componentOrder.splice(1, 0, 'agencyType'); // Insert at the second position
        }
    
        // If the user has defined a specific load order, override it
        const userDefinedOrder = globalState.getState().userComponentOrder;
        if (userDefinedOrder) {
            console.log("Applying user-defined component order:", userDefinedOrder);
            componentOrder = userDefinedOrder;
        }
    
        console.log("Final dynamic component order:", componentOrder);
        return componentOrder;
    }
    
    

    initializeComponents(componentOrder) {
        const components = {
            title: () => this.initializeTitleComponent(),
            agencyType: () => this.initializeAgencyTypeComponent(),
            table: () => this.initializeTableComponent(),
            // Additional component initialization functions...
        };

        componentOrder.forEach((componentName) => {
            if (components[componentName]) {
                console.log(`Initializing component: ${componentName}`);
                components[componentName]();
            }
            console.log("Dynamic component order determined:", componentOrder);
        });
        
    }

    initializeTitleComponent() {
        const titleComponent = createTitleComponent(globalState.getState().reportTitle || 'Default Report Title');
        this.pageController.addContentToPage(titleComponent, true);
    }

    initializeAgencyTypeComponent() {

        const reportData = globalState.getState().reportData;

        if (!reportData || !Array.isArray(reportData)) {
            console.error("Invalid or missing report data for Agency Type Component.");
            return;
        }

        
    
        const agencyTypes = this.checkAgencyTypes(reportData); // Pass reportData to ensure accurate results
        console.log("Agency Types for rendering:", agencyTypes);
    
        // Choose the component based on agency types
        const agencyTypeComponent = agencyTypes.length > 1 ? allAgencyTypes() : singleAgencyType();
    
        // Add the selected component to the page
        this.pageController.addContentToPage(agencyTypeComponent);
    }

    refreshReport() {
        // Ensure the necessary data exists in state
        const reportData = globalState.getState().reportData;
        if (!reportData || reportData.length === 0) {
            console.warn("No data available for refresh.");
            return;
        }
    
        // Get the current dynamic component order
        const dynamicOrder = globalState.getState().clientComponentOrder || this.templateComponents;
    
        // Log the operation
        console.log("Refreshing report with current state:", { dynamicOrder, reportData });
    
        // Re-initialize components and re-render pages
        this.initializeComponents(dynamicOrder);
    
        if (this.pageController) {
            const pages = this.pageController.finalizePages().filter(page => page.length > 0);
            console.log("Pages to render during refresh:", pages);
            renderPages(pages);
        } else {
            console.error("PageController not initialized during refresh.");
        }
    }

    checkAgencyTypes(reportData) {
        const uniqueTypes = [...new Set(reportData.map((item) => item.agency_type))];
        console.log('Agency Types:', uniqueTypes);
        return uniqueTypes;
    }

    initializeTableComponent() {
        createTableComponent(this.pageController);
    }
}
