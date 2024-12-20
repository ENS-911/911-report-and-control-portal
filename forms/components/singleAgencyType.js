// singleAgencyType.js

import { globalState } from '../../reactive/state.js';

/**
 * Creates and returns a DOM element containing a pie chart of either battalions or type_descriptions (depending on options).
 * Utilizes Highcharts for chart rendering.
 * 
 * @param {Array} customData - Optional data array to use instead of globalState.reportData.
 * @param {Object} options - Optional configuration object.
 *   options.groupBy can be 'battalion' (default) or 'type_description'.
 * @returns {HTMLElement} - The container DOM element for the chart and labels.
 */
export async function singleAgencyType(customData, options = {}) {
    console.log(customData)
    let data = customData || globalState.getState().reportData || [];

    console.error('Expected data to be an array but got:', data);

    // Ensure data is an array
    if (!Array.isArray(data)) {
        // data is not an array, return early with a no-data container
        const container = document.createElement('div');
        container.className = 'single-agency-type';
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'no-data-message';
        noDataMessage.textContent = 'No data available.';
        container.appendChild(noDataMessage);
        return container;
    }

    const groupByField = (options.groupBy === 'type_description') ? 'type_description' : 'battalion';
    const agencyName = data.length > 0 ? data[0].agency_type : 'Unknown Agency';

    // Create container
    const container = document.createElement('div');
    container.className = 'single-agency-type';

    // Process data for chart and labels
    const counts = {};
    data.forEach((item) => {
        const fieldValue = item[groupByField];
        if (fieldValue) {
            counts[fieldValue] = (counts[fieldValue] || 0) + 1;
        }
    });

    // Calculate total events
    let entries = Object.entries(counts).filter(([_, count]) => count > 0);
    const totalEvents = entries.reduce((sum, [_, count]) => sum + count, 0);

    // Convert to chartData format
    const chartData = entries.map(([name, y]) => ({ name, y }));

    // Handle case when chartData is empty (no data)
    if (chartData.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'no-data-message';
        noDataMessage.textContent = 'No data available.';
        container.appendChild(noDataMessage);
        return container; // Return container with no data message
    }

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'pie-chart-container';

    // Create label container
    const labelContainer = document.createElement('div');
    labelContainer.className = 'label-container';

    // Add title label
    const titleLabel = document.createElement('h3');
    titleLabel.textContent = 'Number of Events for This Report';
    titleLabel.className = 'label-title';
    labelContainer.appendChild(titleLabel);

    // Add names and counts for each entry
    chartData.forEach(({ name, y }) => {
        const entryLabel = document.createElement('div');
        entryLabel.className = 'entry-label';

        const entryName = document.createElement('span');
        entryName.textContent = name;
        entryName.className = 'entry-name';

        const entryCount = document.createElement('span');
        entryCount.textContent = y;
        entryCount.className = 'entry-count';

        entryLabel.appendChild(entryName);
        entryLabel.appendChild(entryCount);
        labelContainer.appendChild(entryLabel);
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

    // Wait for the chart to render before returning the container
    await new Promise((resolve) => {
        try {
            Highcharts.chart(chartContainer, {
                chart: {
                    type: 'pie',
                    events: {
                        load: function () {
                            // Chart has finished loading
                            resolve();
                        },
                    },
                },
                title: {
                    text: `Distribution for ${agencyName}`,
                    style: {
                        fontSize: '12px',
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
                credits: { enabled: false },
                exporting: { enabled: false },
            });
        } catch (error) {
            console.error('Error rendering Highcharts:', error);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'chart-error';
            errorMsg.textContent = 'Failed to render chart.';
            chartContainer.appendChild(errorMsg);
            resolve();
        }
    });

    return container;
}
