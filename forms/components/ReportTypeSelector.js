export function ReportTypeSelector() {
    const container = document.createElement('div');
    container.id = "reportTypeSelector";

    container.innerHTML = `
        <div class="report-type-selector-wrapper" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <!-- Use an <img> tag to reference your SVG file -->
            <img src="https://portal.911emergensee.com/img/Filter Icon 1.svg" alt="Report Icon" style="width:50px; height:50px; margin-bottom:10px;" />

            <label for="reportTypeSelector" style="margin-bottom:10px;">Select Report Type</label>

            <select id="reportTypeSelector">
                <option value="" disabled selected>Select a report type</option>
                <option value="agencyReport">Agency Report</option>
                <option value="agencyComparisonReport">Agency Comparison Report</option>
                /*<option value="departmentReport">Department Report</option>
                <option value="departmentComparisonReport">Department Comparison Report</option>
                <option value="incidentTypeReport">Incident Type Report</option>
                <option value="specificIncidentReport">Specific Incident Report</option>
                <option value="responseTimeReport">Response Time Report</option>
                <option value="timeReport">Time Report</option>
                <option value="timeOfDayReport">Time of Day Report</option>
                <option value="unitNumberReport">Unit # Report</option>*/
            </select>
        </div>
    `;

    return container;
}