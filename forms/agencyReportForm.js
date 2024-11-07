// agencyReportForm.js
import { DateRangeSelector } from '../forms/components/DateRangeSelector.js';

export function loadDateRangeSelector() {
    const menuContent = document.getElementById('menuContent'); // Sidebar container

    if (!menuContent) {
        console.error('Sidebar element (menuContent) not found');
        return;
    }

    console.log('Appending DateRangeSelector to sidebar');

    // Define a callback for handling the date range selection
    const onRangeSelect = (selectedRange, customData) => {
        console.log(`Selected range: ${selectedRange}`, customData);
        // Handle the date range selection
    };

    // Create the DateRangeSelector component
    const dateRangeSelector = DateRangeSelector(onRangeSelect);
    
    // Clear any previous date selectors
    const existingSelector = menuContent.querySelector('#reportDateRangeSelector');
    if (existingSelector) {
        menuContent.removeChild(existingSelector);
    }

    // Append the DateRangeSelector and log to confirm
    menuContent.appendChild(dateRangeSelector);
}
