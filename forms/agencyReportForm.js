import { globalState } from '../reactive/state.js';
import { FormLayout } from './components/FormLayout.js';
import { TableComponent } from './components/tableComponent.js';

const state = globalState.getState();

export function renderForm(data, title) {
    console.log("Render form called with title:", title, "and data length:", data.length);

    // Resolve title from global state
    const resolvedTitle = state.reportTitle || title;

    // Get the array of table elements (header and rows)
    const tableElements = TableComponent({
        title: 'Report Data',
        data
    });

    // Pass the title and table elements to FormLayout
    FormLayout({
        title: resolvedTitle,
        children: tableElements
    });

    console.log(`Render form completed with title: ${resolvedTitle} and data length: ${data.length}`);
}
