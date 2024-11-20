import { globalState } from '../../reactive/state.js';

export function allAgencyTypes() {
    const scaleRatio = globalState.getState().scaleRatio || 1;

    const reportData = globalState.getState().reportData || [];

    // Create container
    const container = document.createElement('div');
    container.className = 'all-agency-types';
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';
    container.style.alignItems = 'center';

    // Process data for chart and labels
    const agencyCounts = {};
    reportData.forEach((item) => {
        agencyCounts[item.agency_type] = (agencyCounts[item.agency_type] || 0) + 1;
    });

    const totalEvents = Object.values(agencyCounts).reduce((sum, count) => sum + count, 0);

    const chartData = Object.entries(agencyCounts).map(([agency, count]) => ({
        name: agency,
        y: count,
        color: agency === 'Fire' ? '#FF0000' : agency === 'Law' ? '#0000FF' : agency === 'EMS' ? '#00FF00' : '#CCCCCC', // Set color
    }));

    // Left: Create pie chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'pie-chart-container';
    chartContainer.style.width = `${300 * scaleRatio}px`;
    chartContainer.style.height = `${300 * scaleRatio}px`;

    // Render pie chart using global Highcharts
    Highcharts.chart(chartContainer, {
        chart: {
            type: 'pie',
        },
        title: {
            text: 'Agency Type Distribution',
            style: {
                fontSize: `${14 * scaleRatio}px`,
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

    // Right: Create label container
    const labelContainer = document.createElement('div');
    labelContainer.className = 'label-container';
    labelContainer.style.width = '50%';
    labelContainer.style.padding = `${10 * scaleRatio}px`;

    const titleLabel = document.createElement('h3');
    titleLabel.textContent = 'Number of Events for This Report';
    titleLabel.style.textAlign = 'center';
    titleLabel.style.fontSize = `${16 * scaleRatio}px`;
    labelContainer.appendChild(titleLabel);

    // Add agency names and counts
    chartData.forEach(({ name, y }) => {
        const agencyLabel = document.createElement('div');
        agencyLabel.style.display = 'flex';
        agencyLabel.style.justifyContent = 'space-between';
        agencyLabel.style.borderBottom = `${1 * scaleRatio}px solid #ccc`;
        agencyLabel.style.padding = `${5 * scaleRatio}px 0`;

        const agencyName = document.createElement('span');
        agencyName.textContent = name;
        agencyName.style.fontSize = `${14 * scaleRatio}px`;

        const agencyCount = document.createElement('span');
        agencyCount.textContent = y;
        agencyCount.style.fontSize = `${14 * scaleRatio}px`;

        agencyLabel.appendChild(agencyName);
        agencyLabel.appendChild(agencyCount);
        labelContainer.appendChild(agencyLabel);
    });

    // Add total at the bottom
    const totalLabel = document.createElement('div');
    totalLabel.style.display = 'flex';
    totalLabel.style.justifyContent = 'space-between';
    totalLabel.style.fontWeight = 'bold';
    totalLabel.style.padding = `${10 * scaleRatio}px 0`;

    const totalText = document.createElement('span');
    totalText.textContent = 'Total';
    totalText.style.fontSize = `${16 * scaleRatio}px`;

    const totalCount = document.createElement('span');
    totalCount.textContent = totalEvents;
    totalCount.style.fontSize = `${16 * scaleRatio}px`;

    totalLabel.appendChild(totalText);
    totalLabel.appendChild(totalCount);
    labelContainer.appendChild(totalLabel);

    // Append chart and label containers to main container
    container.appendChild(chartContainer);
    container.appendChild(labelContainer);

    return container;
}
