import { globalState } from '../reactive/state.js'

export async function fetchMainData() {
  try {
    const response = await fetch(
      `https://matrix.911-ens-services.com/data/${userData.key}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch main data')
    }
    console.log('State update triggered')
    const data = await response.json()
    globalState.setState({ mainData: data })
    return data
  } catch (error) {
    console.error('Error fetching data: ', error)
  }
}

// Initialize the repetitive fetch operation
function startFetching() {
  // Fetch data immediately upon start
  fetchMainData()

  // Set up a timer to fetch data every 60 seconds
  //setInterval(fetchMainData, 60000)
}

startFetching()
