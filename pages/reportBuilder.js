// reportBuilder.js
import { globalState } from '../reactive/state.js';
import { ReportTypeSelector } from '../forms/components/ReportTypeSelector.js';
import { renderPages } from '../forms/components/pageBuilder.js';

export function loadPage() {
    const menuContent = document.getElementById('menuContent');
    const contentBody = document.getElementById('contentBody');

    menuContent.innerHTML = '';
    contentBody.innerHTML = '';
    menuContent.appendChild(ReportTypeSelector());

    document.getElementById('reportTypeSelector').addEventListener('change', (e) => {
        const reportType = e.target.value;
        globalState.setState({ selectedReportType: reportType });
        loadForm(reportType);
    });

    // Run generateReport only when both `reportData` and `pageController` are available
    globalState.subscribe((state) => {
        if (state.reportData && state.pageController) {
            generateReport();
        }
    });
}

async function loadForm(reportType) {
    try {
        const formModule = await import(`../forms/${reportType}Form.js`);

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
    const pageController = globalState.getState().pageController;

    if (!pageController) {
        console.error("PageController not found in state");
        return;
    }

    // Finalize pages and render them
    const pages = pageController.finalizePages();
    console.log("Pages to render:", pages); // Log pages to inspect structure before rendering
    renderPages(pages);
}