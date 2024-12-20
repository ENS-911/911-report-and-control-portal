// incidentTypeChart.js

import { globalState } from '../../reactive/state.js';

/**
 * Creates and returns a DOM element containing a column chart of incidents grouped by either `type` or `battalion`.
 * @param {Array} customData - Optional data array to use instead of globalState.reportData.
 * @param {Object} options - Optional configuration object.
 *   options.groupBy can be 'type' (default) or 'battalion'.
 * @returns {HTMLElement} - The container DOM element for the incident types chart.
 */
export function incidentTypeChart(customData, options = {}) {
    const data = customData || globalState.getState().reportData || [];
    const groupByField = options.groupBy === 'battalion' ? 'battalion' : 'type';

    const container = document.createElement('div');
    container.className = 'incident-type-chart';

    // Count occurrences based on groupByField
    const counts = {};
    data.forEach((item) => {
        const fieldValue = item[groupByField];
        if (fieldValue) {
            counts[fieldValue] = (counts[fieldValue] || 0) + 1;
        }
    });

    // Filter out zero or empty
    const entries = Object.entries(counts).filter(([_, count]) => count > 0);
    if (entries.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'no-data-message';
        noDataMessage.textContent = 'No incident data available for the selected report.';
        container.appendChild(noDataMessage);
        return container;
    }

    const chartData = entries.map(([name, y]) => ({ name, y }));

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'highcharts-container';
    container.appendChild(chartContainer);
    
    try {
        Highcharts.chart(chartContainer, {
            chart: {
                type: 'column',
                events: {
                    load: function () {
                        console.log('Highcharts column chart loaded successfully.');
                    },
                },
            },
            title: {
                text: groupByField === 'battalion' ? 'Incidents by Battalion' : 'Incident Types Distribution',
                style: {
                    fontSize: '16px',
                },
            },
            xAxis: {
                categories: chartData.map((data) => data.name),
                title: {
                    text: groupByField === 'battalion' ? 'Battalions' : 'Incident Types',
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
                    name: groupByField === 'battalion' ? 'Battalions' : 'Incident Types',
                    data: chartData.map((data) => data.y),
                    colorByPoint: true,
                },
            ],
            credits: { enabled: false },
            exporting: { enabled: false },
        });
    } catch (error) {
        console.error('Error rendering Highcharts column chart:', error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chart-error';
        errorMsg.textContent = 'Failed to render incident types chart.';
        chartContainer.appendChild(errorMsg);
    }

    return container;
}
