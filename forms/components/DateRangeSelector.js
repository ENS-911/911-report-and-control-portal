// components/DateRangeSelector.js
export function DateRangeSelector(onRangeSelect) {
    const container = document.createElement('div');
    container.id = 'reportDateRangeSelector';
    container.style.display = 'flex';

    container.innerHTML = `
        <label for="dateRangeSelector">Select Report Date Range</label>
        <select id="dateRangeSelector">
          <option value="currentActive">Current Active</option>
          <option value="currentDay">Current Day</option>
          <option value="last24Hours">Last 24 Hours</option>
          <option value="selectHours">Select Number of Hours</option>
          <option value="currentWeek">Current Week</option>
          <option value="lastWeek">Last Week</option>
          <option value="currentMonth">Current Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="currentQuarter">Current Quarter</option>
          <option value="lastQuarter">Last Quarter</option>
          <option value="currentYear">Current Year</option>
          <option value="lastYear">Last Year</option>
          <option value="selectDateRange">Select Date Range</option>
        </select>
        <div id="customDateInput" style="display: none;"></div>
        <button id="fetchReportData">Fetch Data</button>
    `;

    // Handle changes within the component
    container.querySelector('#dateRangeSelector').addEventListener('change', handleDateRangeChange);

    // Call `onRangeSelect` callback on button click to provide selected data
    container.querySelector('#fetchReportData').addEventListener('click', () => {
        const selectedRange = container.querySelector('#dateRangeSelector').value;
        const customData = getCustomData(container);
        onRangeSelect(selectedRange, customData);
    });

    function handleDateRangeChange() {
        const dateRangeSelector = container.querySelector('#dateRangeSelector');
        const selectedRange = dateRangeSelector.value;
        const customDateInput = container.querySelector('#customDateInput');

        if (selectedRange === 'selectHours') {
            customDateInput.innerHTML = `
                <label for="hoursInput">Enter number of hours:</label>
                <input type="number" id="hoursInput" min="1" />
            `;
            customDateInput.style.display = 'flex';
        } else if (selectedRange === 'selectDateRange') {
            customDateInput.innerHTML = `
                <label for="startDate">Start Date:</label>
                <input type="date" id="startDate" />
                <label for="endDate">End Date:</label>
                <input type="date" id="endDate" />
            `;
            customDateInput.style.display = 'flex';
        } else {
            customDateInput.style.display = 'none';
        }
    }

    function getCustomData(container) {
        const selectedRange = container.querySelector('#dateRangeSelector').value;
        if (selectedRange === 'selectHours') {
            return { hours: container.querySelector('#hoursInput')?.value || null };
        } else if (selectedRange === 'selectDateRange') {
            return {
                startDate: container.querySelector('#startDate')?.value || null,
                endDate: container.querySelector('#endDate')?.value || null,
            };
        }
        return {};
    }

    return container;
}
