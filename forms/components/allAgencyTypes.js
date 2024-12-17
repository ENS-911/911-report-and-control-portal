// allAgencyTypes.js
import { globalState } from '../../reactive/state.js';

export async function allAgencyTypes() {
    const reportData = globalState.getState().reportData || [];

    if (reportData.length === 0) {
        const emptyContainer = document.createElement('div');
        emptyContainer.className = 'all-agency-types empty';
        emptyContainer.textContent = 'No data available for Agency Types.';
        return emptyContainer;
    }

    const container = document.createElement('div');
    container.className = 'all-agency-types';

    const agencyCounts = {};
    reportData.forEach((item) => {
        if (item.agency_type) {
            agencyCounts[item.agency_type] = (agencyCounts[item.agency_type] || 0) + 1;
        }
    });

    const totalEvents = Object.values(agencyCounts).reduce((sum, count) => sum + count, 0);
    const chartData = Object.entries(agencyCounts).map(([agency, count]) => ({
        name: agency,
        y: count,
        color: getAgencyColor(agency),
    }));

    const chartContainer = document.createElement('div');
    chartContainer.className = 'pie-chart-container';

    // Use a load event to ensure chart is rendered
    try {
        Highcharts.chart(chartContainer, {
            chart: {
                type: 'pie',
                events: {
                    load: function () {
                        console.log('Highcharts chart fully loaded.');
                        // Here you could trigger additional frames or callbacks if needed.
                    }
                }
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
        console.log('All Agency Types chart initiated.');
    } catch (error) {
        console.error('Error rendering Highcharts pie chart:', error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chart-error';
        errorMsg.textContent = 'Failed to render chart.';
        chartContainer.appendChild(errorMsg);
    }

    const labelContainer = document.createElement('div');
    labelContainer.className = 'label-container';

    const titleLabel = document.createElement('h3');
    titleLabel.textContent = 'Number of Events for This Report';
    titleLabel.className = 'label-title';
    labelContainer.appendChild(titleLabel);

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

    container.appendChild(chartContainer);
    container.appendChild(labelContainer);

    return container;
}

function getAgencyColor(agency) {
    switch (agency) {
        case 'Fire':
            return '#FF0000';
        case 'Law':
            return '#0000FF';
        case 'EMS':
            return '#00FF00';
        default:
            return '#CCCCCC';
    }
}
