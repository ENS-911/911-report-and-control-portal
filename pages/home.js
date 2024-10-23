import { globalState } from '../reactive/state.js'

let chart

export function loadPage() {
  const setStage = document.getElementById('contentBody')
  // Ensure the chart container exists as a separate entity
  setStage.innerHTML =
    '<div id="chartContainer" style="height: 400px; min-width: 60%"></div>'

  // Add home page specific content
  const homeContent = document.createElement('div')
  setStage.insertBefore(homeContent, setStage.firstChild)

  // Initialize the chart in the dedicated container
  chart = Highcharts.chart('chartContainer', {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Live Active Incidents Count by Agency Type',
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Time',
      },
    },
    yAxis: {
      title: {
        text: 'Active Incidents Count',
      },
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
        },
        marker: {
          enabled: true,
          radius: 5,
        },
      },
    },
    series: [
      {
        name: 'Total',
        color: 'black',
        data: [], // Initial empty data for total count
      },
      {
        name: 'Fire',
        color: 'red',
        data: [], // Initial empty data for Fire
      },
      {
        name: 'Law',
        color: 'blue',
        data: [], // Initial empty data for Law
      },
      {
        name: 'EMS',
        color: 'green',
        data: [], // Initial empty data for EMS
      },
    ],
  })

  // Update the chart every 60 seconds
  setInterval(function () {
    console.log('Interval callback executed')
    const state = globalState.getState() // Fetch the current state
    const currentTime = new Date().getTime() // current time
    const counts = { total: 0, fire: 0, law: 0, ems: 0 }

    // Calculate counts based on agency_type
    if (state.mainData) {
      state.mainData.forEach((item) => {
        counts.total++
        if (item.agency_type === 'Fire') counts.fire++
        else if (item.agency_type === 'Law') counts.law++
        else if (item.agency_type === 'EMS') counts.ems++
      })
    }

    console.log(`Adding points for each category and total`)

    // Decide whether to shift the chart
    const shouldShift = chart.series[0].data.length >= 15

    // Add points for each series
    chart.series[0].addPoint([currentTime, counts.total], true, shouldShift) // Total
    chart.series[1].addPoint([currentTime, counts.fire], true, shouldShift) // Fire
    chart.series[2].addPoint([currentTime, counts.law], true, shouldShift) // Law
    chart.series[3].addPoint([currentTime, counts.ems], true, shouldShift) // EMS
  }, 60000)
}
