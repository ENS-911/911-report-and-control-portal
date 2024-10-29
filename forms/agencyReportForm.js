import { FormLayout } from './components/FormLayout.js';
import { TableComponent } from './components/tableComponent.js';

export function renderForm(data, title) {
    
    FormLayout({
        title,
        children: null  // No children are passed here directly
    });

    // Now get the dynamically created content area where the table will be appended
    const formContentArea = document.getElementById('formContentArea');

    // Then, render the table inside the form content area
    TableComponent({
        title: 'Report Data', // Set the table title
        data // Pass in the data to the table component
    });

    // Append the table to the formContentArea
    formContentArea.appendChild(document.querySelector('table'));
}
