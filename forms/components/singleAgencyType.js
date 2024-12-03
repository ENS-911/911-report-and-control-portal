import { globalState } from '../../reactive/state.js';

export async function singleAgencyType() {
    const scaleRatio = globalState.getState().scaleRatio || 1;
    const reportData = globalState.getState().reportData || [];
    const agencyName = reportData.length > 0 ? reportData[0].agency_type : 'Unknown Agency';

    console.log('Scale Ratio in singleAgencyType:', scaleRatio);

    // Create container
    const container = document.createElement('div');
    container.className = 'single-agency-type';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'space-between';
    container.style.alignItems = 'center';

    // Process data for chart and labels
    const battalionCounts = {};
    reportData.forEach((item) => {
        battalionCounts[item.battalion] = (battalionCounts[item.battalion] || 0) + 1;
    });

    const totalEvents = Object.values(battalionCounts).reduce((sum, count) => sum + count, 0);

    const chartData = Object.entries(battalionCounts).map(([battalion, count]) => ({
        name: battalion,
        y: count,
    }));

    // Handle case when chartData is empty
    if (chartData.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.textContent = 'No data available for the selected agency.';
        container.appendChild(noDataMessage);
        return container; // Return container with no data message
    }

    // Left: Create pie chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'pie-chart-container';
    chartContainer.style.width = `${300 * scaleRatio}px`;
    chartContainer.style.height = `${300 * scaleRatio}px`;

    // Right: Create label container
    const labelContainer = document.createElement('div');
    labelContainer.className = 'label-container';
    labelContainer.style.width = '50%';
    labelContainer.style.padding = `${4 * scaleRatio}px`;

    // Add title label
    const titleLabel = document.createElement('h3');
    titleLabel.textContent = 'Number of Events for This Report';
    titleLabel.style.textAlign = 'center';
    titleLabel.style.fontSize = `${14 * scaleRatio}px`;
    labelContainer.appendChild(titleLabel);

    // Add battalion names and counts
    chartData.forEach(({ name, y }) => {
        const battalionLabel = document.createElement('div');
        battalionLabel.style.display = 'flex';
        battalionLabel.style.justifyContent = 'space-between';
        battalionLabel.style.borderBottom = `${1 * scaleRatio}px solid #ccc`;
        battalionLabel.style.padding = `${2 * scaleRatio}px 0`;

        const battalionName = document.createElement('span');
        battalionName.textContent = name;
        battalionName.style.fontSize = `${12 * scaleRatio}px`;

        const battalionCount = document.createElement('span');
        battalionCount.textContent = y;
        battalionCount.style.fontSize = `${12 * scaleRatio}px`;

        battalionLabel.appendChild(battalionName);
        battalionLabel.appendChild(battalionCount);
        labelContainer.appendChild(battalionLabel);
    });

    // Add total at the bottom
    const totalLabel = document.createElement('div');
    totalLabel.style.display = 'flex';
    totalLabel.style.justifyContent = 'space-between';
    totalLabel.style.fontWeight = 'bold';
    totalLabel.style.padding = `${4 * scaleRatio}px 0`;

    const totalText = document.createElement('span');
    totalText.textContent = 'Total';
    totalText.style.fontSize = `${14 * scaleRatio}px`;

    const totalCount = document.createElement('span');
    totalCount.textContent = totalEvents;
    totalCount.style.fontSize = `${14 * scaleRatio}px`;

    totalLabel.appendChild(totalText);
    totalLabel.appendChild(totalCount);
    labelContainer.appendChild(totalLabel);

    // Append chart and label containers to main container
    container.appendChild(chartContainer);
    container.appendChild(labelContainer);

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
                        fontSize: `${12 * scaleRatio}px`,
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
            // Resolve even if the chart fails to render
            resolve();
        }
    });

    // **Return the container with the chart and labels after the chart has rendered**
    return container;
}
