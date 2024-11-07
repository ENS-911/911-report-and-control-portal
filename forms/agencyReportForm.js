// agencyReportForm.js
import { globalState } from '../reactive/state.js';
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';
import { fetchReportData } from '../api/fetchReportData.js';

export function loadDateRangeSelector() {
    const menuContent = document.getElementById('menuContent'); // Sidebar container

    // Check if DateRangeSelector already exists to avoid re-adding it
    let dateRangeSelector = menuContent.querySelector('#reportDateRangeSelector');
    if (!dateRangeSelector) {
        const onRangeSelect = (selectedRange, customData) => {
            console.log(`Selected range: ${selectedRange}`, customData);
        };

        // Create DateRangeSelector only if it doesn’t already exist
        dateRangeSelector = DateRangeSelector(onRangeSelect);
        menuContent.appendChild(dateRangeSelector);
        
        // Attach the fetch event to the button, ensuring no duplicate listeners
        const fetchButton = dateRangeSelector.querySelector('#fetchReportData');
        fetchButton.addEventListener('click', () => fetchReportData(globalState.getState().selectedReportType));
    }
}
