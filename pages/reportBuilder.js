// reportBuilder.js
import { globalState } from '../reactive/state.js';
import { ReportTypeSelector } from '../forms/components/ReportTypeSelector.js';

export function loadPage() {
    const menuContent = document.getElementById('menuContent');
    const contentBody = document.getElementById('contentBody');

    // Clear existing content
    menuContent.innerHTML = '';
    contentBody.innerHTML = '';

    // Add the ReportTypeSelector to menuContent
    menuContent.appendChild(ReportTypeSelector());

    // Subscribe to globalState for changes to selectedReportType
    globalState.subscribe((state) => {
        const reportType = state.selectedReportType;
        if (reportType) {
            loadForm(reportType);
        }
    });
}

async function loadForm(reportType) {
  try {
      const formModule = await import(`../forms/${reportType}Form.js`);

      // Call the specific function in agencyReportForm.js to load the date range selector
      if (formModule.loadDateRangeSelector) {
          formModule.loadDateRangeSelector();
      } else {
          console.warn(`loadDateRangeSelector function not found in ${reportType}Form.js`);
      }
  } catch (error) {
      console.error(`Error loading form for ${reportType}:`, error);
      document.getElementById('contentBody').innerHTML = '<p>Error loading report form</p>';
  }
}
