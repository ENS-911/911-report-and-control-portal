// ./reactive/state.js
class State {
  constructor(initialState) {
    this.state = initialState || { mainData: [] }
    this.listeners = []
  }

  getState() {
    return this.state
  }

  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.listeners.forEach((listener) => listener(this.state))
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => (this.listeners = this.listeners.filter((l) => l !== listener)) // Return unsubscribe function
  }
}

// Export a global state instance
export const globalState = new State({
  clientData: null,
  mainData: null,
})
