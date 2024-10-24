import { globalState } from '../reactive/state.js';

let chart;

export function loadPage() {
  const setStage = document.getElementById('contentBody');
  setStage.innerHTML = '<div id="chartContainer" style="height: 400px; min-width: 60%"></div>';

  const homeContent = document.createElement('div');
  setStage.insertBefore(homeContent, setStage.firstChild);

  // Initialize the chart with empty data
  chart = Highcharts.chart('chartContainer', {
    chart: { type: 'line' },
    title: { text: 'Live Active Incidents Count by Agency Type' },
    xAxis: { type: 'datetime', title: { text: 'Time' } },
    yAxis: { title: { text: 'Active Incidents Count' } },
    plotOptions: {
      line: {
        dataLabels: { enabled: true },
        marker: { enabled: true, radius: 5 },
      },
    },
    series: [
      { name: 'Total', color: 'black', data: [] },
      { name: 'Fire', color: 'red', data: [] },
      { name: 'Law', color: 'blue', data: [] },
      { name: 'EMS', color: 'green', data: [] },
    ],
  });

  // Fetch initial active calls and today's data
  fetchActiveCalls();
  fetchTodaysData();

  // Update the chart every 60 seconds
  setInterval(updateChart, 60000);
}

// Fetch and store active calls in global state
async function fetchActiveCalls() {
  try {
    const url = `https://matrix.911-ens-services.com/data/${userData.key}`; // Adjust URL as necessary
    const response = await fetch(url);
    const activeData = await response.json();

    if (response.ok) {
      globalState.setState({ activeData });
    } else {
      console.error('Error fetching active calls:', activeData.error);
    }
  } catch (error) {
    console.error('Error fetching active calls:', error);
  }
}

async function fetchTodaysData() {
  try {
    const url = `https://matrix.911-ens-services.com/today/${userData.key}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const todayData = await response.json();  // Ensure body is parsed here
      console.log('Today\'s Data:', todayData);  // Log the parsed data
      globalState.setState({ todayData });  // Store today’s data in global state
    } else {
      console.error('Error fetching today\'s data:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching today\'s data:', error);
  }
}

// Update the chart with new data
function updateChart() {
  console.log('Interval callback executed');

  fetchActiveCalls();
  fetchTodaysData();

  const state = globalState.getState();
  const currentTime = new Date().getTime();
  const counts = { total: 0, fire: 0, law: 0, ems: 0 };

  // Calculate counts based on agency_type from activeData
  if (state.activeData) {
    state.activeData.forEach((item) => {
      counts.total++;
      if (item.agency_type === 'Fire') counts.fire++;
      else if (item.agency_type === 'Law') counts.law++;
      else if (item.agency_type === 'EMS') counts.ems++;
    });
  }

  console.log('Adding points for each category and total');

  const shouldShift = chart.series[0].data.length >= 15;

  // Add points for each series
  chart.series[0].addPoint([currentTime, counts.total], true, shouldShift); // Total
  chart.series[1].addPoint([currentTime, counts.fire], true, shouldShift); // Fire
  chart.series[2].addPoint([currentTime, counts.law], true, shouldShift); // Law
  chart.series[3].addPoint([currentTime, counts.ems], true, shouldShift); // EMS
}
