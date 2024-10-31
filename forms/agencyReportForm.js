import { globalState } from '../reactive/state.js';
import { generateReport } from './components/FormLayout.js'; // Import from FormLayout.js
// Remove the import of FormLayout and TableComponent if not used elsewhere

const state = globalState.getState();

// Use the new generateReport function
export function renderForm(data, title) {
    console.log("Render form called with title:", title, "and data length:", data.length);

    // Resolve title from global state
    const resolvedTitle = state.reportTitle || title;

    // Call the generateReport function
    generateReport(resolvedTitle, data);

    console.log(`Report generation initiated with title: ${resolvedTitle} and data length: ${data.length}`);
}
