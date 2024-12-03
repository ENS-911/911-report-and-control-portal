import { globalState } from '../../reactive/state.js';

export function incidentTypeChart() {
    const reportData = globalState.getState().reportData || [];
    const scaleRatio = globalState.getState().scaleRatio || 1;

    // Create container for the component
    const container = document.createElement('div');
    container.style.width = '100%';
    container.className = 'incident-type-chart';
    container.style.padding = `${5 * scaleRatio}px`;
    container.style.boxSizing = 'border-box';

    // Count occurrences of each incident type
    const incidentCounts = {};
    reportData.forEach((item) => {
        incidentCounts[item.type] = (incidentCounts[item.type] || 0) + 1;
    });

    // Format data for Highcharts
    const chartData = Object.entries(incidentCounts).map(([type, count]) => ({
        name: type,
        y: count,
    }));

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '100%';
    chartContainer.style.height = `${300 * scaleRatio}px`;
    container.appendChild(chartContainer);

    // Render bar chart using Highcharts
    Highcharts.chart(chartContainer, {
        chart: {
            type: 'column',
        },
        title: {
            text: 'Incident Types Distribution',
            style: {
                fontSize: `${14 * scaleRatio}px`,
            },
        },
        xAxis: {
            categories: chartData.map((data) => data.name),
            title: {
                text: 'Incident Types',
                style: {
                    fontSize: `${12 * scaleRatio}px`,
                },
            },
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Count',
                style: {
                    fontSize: `${12 * scaleRatio}px`,
                },
            },
        },
        series: [
            {
                name: 'Incident Types',
                data: chartData.map((data) => data.y),
                colorByPoint: true,
            },
        ],
    });

    return container;
}
