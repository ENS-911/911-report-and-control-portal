// incidentTypeChart.js

import { globalState } from '../../reactive/state.js';

/**
 * Creates and returns a DOM element containing a column chart of incident types and corresponding labels.
 * Utilizes Highcharts for chart rendering.
 * @returns {HTMLElement} - The container DOM element for the incident types chart.
 */
export function incidentTypeChart() {
    const reportData = globalState.getState().reportData || [];

    // Create container for the component
    const container = document.createElement('div');
    container.className = 'incident-type-chart';

    // Count occurrences of each incident type
    const incidentCounts = {};
    reportData.forEach((item) => {
        if (item.type) { // Ensure incident type exists
            incidentCounts[item.type] = (incidentCounts[item.type] || 0) + 1;
        }
    });

    // Format data for Highcharts
    const chartData = Object.entries(incidentCounts).map(([type, count]) => ({
        name: type,
        y: count,
        // Removed 'color' to let Highcharts handle color assignments dynamically
    }));

    // Handle case when chartData is empty
    if (chartData.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'no-data-message';
        noDataMessage.textContent = 'No incident data available for the selected report.';
        container.appendChild(noDataMessage);
        return container; // Return container with no data message
    }

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'highcharts-container';

    // Append chart container to main container
    container.appendChild(chartContainer);

    // Render column chart using Highcharts
    try {
        Highcharts.chart(chartContainer, {
            chart: {
                type: 'column',
                events: {
                    load: function () {
                        // Chart has finished loading
                        console.log('Highcharts column chart loaded successfully.');
                    },
                },
            },
            title: {
                text: 'Incident Types Distribution',
                style: {
                    fontSize: '16px',
                },
            },
            xAxis: {
                categories: chartData.map((data) => data.name),
                title: {
                    text: 'Incident Types',
                    style: {
                        fontSize: '14px',
                    },
                },
                labels: {
                    style: {
                        fontSize: '12px',
                    },
                },
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Count',
                    style: {
                        fontSize: '14px',
                    },
                },
                labels: {
                    style: {
                        fontSize: '12px',
                    },
                },
            },
            tooltip: {
                pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}',
                        style: {
                            fontSize: '12px',
                        },
                    },
                },
            },
            series: [
                {
                    name: 'Incident Types',
                    data: chartData.map((data) => data.y),
                    colorByPoint: true, // Let Highcharts assign colors dynamically
                },
            ],
            credits: { enabled: false },
            exporting: { enabled: false },
        });
    } catch (error) {
        console.error('Error rendering Highcharts column chart:', error);
        // Display error message within the chart container
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chart-error';
        errorMsg.textContent = 'Failed to render incident types chart.';
        chartContainer.appendChild(errorMsg);
    }

    // Return the container with the chart after rendering
    return container;
}
