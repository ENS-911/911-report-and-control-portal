// singleAgencyType.js

import { globalState } from '../../reactive/state.js';

/**
 * Creates and returns a DOM element containing a pie chart of battalion types and corresponding labels.
 * Utilizes Highcharts for chart rendering.
 * @returns {HTMLElement} - The container DOM element for the battalion types chart and labels.
 */
export async function singleAgencyType() {
    const reportData = globalState.getState().reportData || [];
    const agencyName = reportData.length > 0 ? reportData[0].agency_type : 'Unknown Agency';

    // Create container
    const container = document.createElement('div');
    container.className = 'single-agency-type';

    // Process data for chart and labels
    const battalionCounts = {};
    reportData.forEach((item) => {
        if (item.battalion) { // Ensure battalion exists
            battalionCounts[item.battalion] = (battalionCounts[item.battalion] || 0) + 1;
        }
    });

    const totalEvents = Object.values(battalionCounts).reduce((sum, count) => sum + count, 0);

    const chartData = Object.entries(battalionCounts).map(([battalion, count]) => ({
        name: battalion,
        y: count,
        // Removed 'color' to let Highcharts handle color assignments dynamically
    }));

    // Handle case when chartData is empty
    if (chartData.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'no-data-message';
        noDataMessage.textContent = 'No data available for the selected agency.';
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

    // Add battalion names and counts
    chartData.forEach(({ name, y }) => {
        const battalionLabel = document.createElement('div');
        battalionLabel.className = 'battalion-label';

        const battalionName = document.createElement('span');
        battalionName.textContent = name;
        battalionName.className = 'battalion-name';

        const battalionCount = document.createElement('span');
        battalionCount.textContent = y;
        battalionCount.className = 'battalion-count';

        battalionLabel.appendChild(battalionName);
        battalionLabel.appendChild(battalionCount);
        labelContainer.appendChild(battalionLabel);
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

    console.log('chartData:', chartData);
    console.log('battalionCounts:', battalionCounts);

    // **Wait for the chart to render before returning the container**
    await new Promise((resolve, reject) => {
        try {
            // Render pie chart using Highcharts
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
                        colorByPoint: true, // Let Highcharts assign colors
                        data: chartData,
                    },
                ],
                credits: { enabled: false },
                exporting: { enabled: false },
            });
        } catch (error) {
            console.error('Error rendering Highcharts:', error);
            // Display error message within the chart container
            const errorMsg = document.createElement('div');
            errorMsg.className = 'chart-error';
            errorMsg.textContent = 'Failed to render chart.';
            chartContainer.appendChild(errorMsg);
            // Resolve even if the chart fails to render
            resolve();
        }
    });

    // **Return the container with the chart and labels after the chart has rendered**
    return container;
}
