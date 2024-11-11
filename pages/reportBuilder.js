// reportBuilder.js
import { globalState } from '../reactive/state.js';
import { ReportTypeSelector } from '../forms/components/ReportTypeSelector.js';

export function loadPage() {
    const menuContent = document.getElementById('menuContent');
    const contentBody = document.getElementById('contentBody');

    menuContent.innerHTML = '';
    contentBody.innerHTML = '';
    menuContent.appendChild(ReportTypeSelector());

    globalState.subscribe((state) => {
        const reportType = state.selectedReportType;
        if (reportType) loadForm(reportType);
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
