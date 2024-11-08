// reportBuilder.js
import { globalState } from '../reactive/state.js';
import { ReportTypeSelector } from '../forms/components/ReportTypeSelector.js';
import PageController from '../forms/controllers/PageController.js';

export function loadPage() {
    const menuContent = document.getElementById('menuContent');
    const contentBody = document.getElementById('contentBody');

    menuContent.innerHTML = '';
    contentBody.innerHTML = '';
    menuContent.appendChild(ReportTypeSelector());

    globalState.subscribe((state) => {
        const reportType = state.selectedReportType;
        const reportData = state.reportData;

        if (reportType) loadForm(reportType);
        if (reportData) generateReport();
    });
}

async function loadForm(reportType) {
    try {
        const formModule = await import(`../forms/${reportType}Form.js`);

        // Trigger the setup for the specific report type, including the date selector and any other setup logic
        if (formModule.loadReportComponents) {
            formModule.loadReportComponents();
        } else {
            console.warn(`loadReportComponents function not found in ${reportType}Form.js`);
        }
    } catch (error) {
        console.error(`Error loading form for ${reportType}:`, error);
        document.getElementById('contentBody').innerHTML = '<p>Error loading report form</p>';
    }
}

function generateReport() {
    const pageController = new PageController();

    // Request components from the report template
    const reportComponents = globalState.getState().reportComponents || [];

    // Measure and add each component to the pages based on available height
    reportComponents.forEach(component => {
        pageController.addContentToPage(component);
    });

    const pages = pageController.finalizePages();
    renderPages(pages);
}

// Renders each page in the content body
function renderPages(pages) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = '';

    pages.forEach((page) => {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page';

        page.forEach((contentItem) => {
            pageContainer.appendChild(contentItem.element);
        });

        contentBody.appendChild(pageContainer);
    });

    console.log("Final structured pages data:", pages);
}
