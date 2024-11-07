// reportComponents/ReportTypeSelector.js

import { globalState } from '../../reactive/state.js';

export function ReportTypeSelector() {
    const container = document.createElement('div');
    container.innerHTML = `
        <label for="reportTypeSelector">Select Report Type</label>
        <select id="reportTypeSelector">
            <option value="" disabled selected>Select a report type</option>
            <option value="agencyReport">Agency Report</option>
            <option value="agencyComparisonReport">Agency Comparison Report</option>
            <option value="departmentReport">Department Report</option>
            <option value="departmentComparisonReport">Department Comparison Report</option>
            <option value="incidentTypeReport">Incident Type Report</option>
            <option value="specificIncidentReport">Specific Incident Report</option>
            <option value="responseTimeReport">Response Time Report</option>
            <option value="timeReport">Time Report</option>
            <option value="timeOfDayReport">Time of Day Report</option>
            <option value="unitNumberReport">Unit # Report</option>
        </select>
    `;

    // Handle changes within the component itself
    container.querySelector('#reportTypeSelector').addEventListener('change', (e) => {
        const reportType = e.target.value;
        globalState.setState({ selectedReportType: reportType });
        console.log(`Report type selected: ${reportType}`);
        // Additional logic for selecting report type can be modularized and managed here
    });

    return container;
}
