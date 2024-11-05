import { globalState } from '../reactive/state.js';
import { generatePages } from './components/pageBuilder.js';

export function renderForm() {
    const menuContent = document.getElementById('menuContent');
    const reportTitle = globalState.getState().reportTitle || 'Agency Report';

    // Generate agency type dropdown based on unique values in mainData
    const mainData = globalState.getState().mainData || [];
    const agencyTypes = [...new Set(mainData.map(item => item.agency_type))];

    let agencyTypeSelector = document.getElementById('agencyTypeSelector');
    if (!agencyTypeSelector) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.innerHTML = `
          <label for="agencyTypeSelector">Filter by Agency Type:</label>
          <select id="agencyTypeSelector">
            <option value="all">View All</option>
            ${agencyTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
        `;
        menuContent.appendChild(dropdownContainer);
        agencyTypeSelector = document.getElementById('agencyTypeSelector');
    }

    agencyTypeSelector.addEventListener('change', (e) => {
        const selectedType = e.target.value;
        const filteredData = selectedType === 'all'
          ? mainData
          : mainData.filter(item => item.agency_type === selectedType);

        // Update reportData directly in globalState
        globalState.setState({ reportData: filteredData });
    });

    // Subscribe to globalState updates to render whenever reportData changes
    globalState.subscribe((state) => {
        if (state.reportData) {
            generatePages(reportTitle, state.reportData);
        }
    });

    // Initial call to render using the current reportData in global state
    generatePages(reportTitle, globalState.getState().reportData);
}
