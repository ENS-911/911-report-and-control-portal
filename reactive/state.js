class State {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  // Get the current state
  getState() {
    return this.state;
  }

  // Set new state, merging with existing state.
  // Also update window.clientData and window.activeData if present.
  setState(newState) {
    this.state = { ...this.state, ...newState };

    // Update global variables if these keys are present:
    if (newState.clientData !== undefined) {
      window.clientData = newState.clientData;
    }
    if (newState.mainData !== undefined) {
      window.mainData = newState.mainData;
    }
    
    console.log('Updated Global State:', this.state);
    this.notifyListeners();
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    }; // Return unsubscribe function
  }

  // Notify all listeners of state changes
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Fetch large datasets from the server (paged or filtered)
  async fetchDataFromServer(endpoint, params = {}) {
    try {
      const response = await fetch(`${endpoint}?${new URLSearchParams(params)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data from server:', error);
      return null;
    }
  }

  // Method to load data in chunks or pages
  async loadPageData(pageNumber = 1, pageSize = 100) {
    const data = await this.fetchDataFromServer('/api/data', { page: pageNumber, size: pageSize });
    if (data) {
      this.setState({ mainData: data });
    }
  }

  // Method to load report data based on filters
  async loadReportData(clientKey, filters = {}) {
    const endpoint = `/report/${clientKey}`;
    const reportData = await this.fetchDataFromServer(endpoint, filters);
    if (reportData) {
      this.setState({ reportData });
    }
  }
}

// Export a global state instance with initial keys.
export const globalState = new State({
  clientData: null,
  mainData: null,
  activeData: [],
  todayData: [],
  reportData: null,
});

// Function to initialize data fetching or pagination.
export async function loadInitialData() {
  await globalState.loadPageData(1);
}
