// allAgencyTypes.js

import { globalState } from '../../reactive/state.js';

/**
 * Creates and returns a DOM element containing a pie chart of agency types and corresponding labels.
 * Utilizes Highcharts for chart rendering.
 * @returns {HTMLElement} - The container DOM element for the agency types chart and labels.
 */
export async function allAgencyTypes() {
    const reportData = globalState.getState().reportData || [];

    // Early exit if no data is available
    if (reportData.length === 0) {
        console.warn('No report data available to generate agency types chart.');
        const emptyContainer = document.createElement('div');
        emptyContainer.className = 'all-agency-types empty';
        emptyContainer.textContent = 'No data available for Agency Types.';
        return emptyContainer;
    }

    // Create main container
    const container = document.createElement('div');
    container.className = 'all-agency-types';

    // Process data for chart and labels
    const agencyCounts = {};
    reportData.forEach((item) => {
        if (item.agency_type) { // Ensure agency_type exists
            agencyCounts[item.agency_type] = (agencyCounts[item.agency_type] || 0) + 1;
        }
    });

    const totalEvents = Object.values(agencyCounts).reduce((sum, count) => sum + count, 0);

    // Prepare data for Highcharts
    const chartData = Object.entries(agencyCounts).map(([agency, count]) => ({
        name: agency,
        y: count,
        color: getAgencyColor(agency),
    }));

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'pie-chart-container';

    // Render pie chart using Highcharts
    try {
        Highcharts.chart(chartContainer, {
            chart: {
                type: 'pie',
            },
            title: {
                text: 'Agency Type Distribution',
                style: {
                    fontSize: '14px',
                },
            },
            accessibility: {
                point: {
                    valueSuffix: ' events',
                },
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            fontSize: '12px',
                        },
                    },
                },
            },
            series: [
                {
                    name: 'Events',
                    colorByPoint: true,
                    data: chartData,
                },
            ],
        });
        console.log('All Agency Types chart rendered successfully.');
    } catch (error) {
        console.error('Error rendering Highcharts pie chart:', error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chart-error';
        errorMsg.textContent = 'Failed to render chart.';
        chartContainer.appendChild(errorMsg);
    }

    // Create label container
    const labelContainer = document.createElement('div');
    labelContainer.className = 'label-container';

    // Title label
    const titleLabel = document.createElement('h3');
    titleLabel.textContent = 'Number of Events for This Report';
    titleLabel.className = 'label-title';
    labelContainer.appendChild(titleLabel);

    // Add agency names and counts
    chartData.forEach(({ name, y }) => {
        const agencyLabel = document.createElement('div');
        agencyLabel.className = 'agency-label';

        const agencyName = document.createElement('span');
        agencyName.textContent = name;
        agencyName.className = 'agency-name';

        const agencyCount = document.createElement('span');
        agencyCount.textContent = y;
        agencyCount.className = 'agency-count';

        agencyLabel.appendChild(agencyName);
        agencyLabel.appendChild(agencyCount);
        labelContainer.appendChild(agencyLabel);
    });

    // Add total at the bottom
    const totalLabel = document.createElement('div');
    totalLabel.className = 'total-label';

    const totalText = document.createElement('span');
    totalText.textContent = 'Total';
    totalText.className = 'total-text';

    const totalCount = document.createElement('span');
    totalCount.textContent = totalEvents;
    totalCount.className = 'total-count';

    totalLabel.appendChild(totalText);
    totalLabel.appendChild(totalCount);
    labelContainer.appendChild(totalLabel);

    // Append chart and label containers to main container
    container.appendChild(chartContainer);
    container.appendChild(labelContainer);

    return container;
}

/**
 * Returns a color based on the agency type.
 * @param {string} agency - The agency type.
 * @returns {string} - The hexadecimal color code.
 */
function getAgencyColor(agency) {
    switch (agency) {
        case 'Fire':
            return '#FF0000'; // Red
        case 'Law':
            return '#0000FF'; // Blue
        case 'EMS':
            return '#00FF00'; // Green
        default:
            return '#CCCCCC'; // Gray for others
    }
}
