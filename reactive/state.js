class State {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  // Get the current state
  getState() {
    return this.state;
  }

  // Set new state, merging with existing state
  setState(newState) {
    this.state = { ...this.state, ...newState };
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
      return data;  // Handle pagination on the backend
    } catch (error) {
      console.error('Error fetching data from server:', error);
      return null;
    }
  }

  // Method to load data in chunks or pages
  async loadPageData(pageNumber = 1, pageSize = 100) {
    const data = await this.fetchDataFromServer('/api/data', { page: pageNumber, size: pageSize });
    if (data) {
      this.setState({ mainData: data });  // Only store the current chunk of data
    }
  }
}

// Export a global state instance
export const globalState = new State({
  clientData: null,   // Non-bulk data, e.g., client profile info
  mainData: [],       // Placeholder for paged data fetched from the server
  userData: null,     // Additional non-bulk user-specific data
});

// Function to initialize data fetching or pagination
export async function loadInitialData() {
  await globalState.loadPageData(1); // Start by loading the first page
}
