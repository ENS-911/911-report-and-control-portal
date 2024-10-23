import { globalState } from '../reactive/state.js';

let incidentData = [];
let lastSubmittedFormData = new URLSearchParams();
const clientKey = JSON.parse(localStorage.getItem('user')).key; // Decrypt client key
const setStage = document.getElementById('contentBody');

// Main function to load the report page
export function loadPage() {
  setStage.innerHTML = ''; // Clear content body
  setStage.appendChild(createLoadingMessage());

  fetchIncidentData(); // Initial data fetch
}

// Display a loading message while fetching data
function createLoadingMessage() {
  const loadingMessage = document.createElement('div');
  loadingMessage.innerText = 'Loading content...';
  return loadingMessage;
}

// Function to fetch data based on filters and pagination
async function fetchIncidentData(searchParams = new URLSearchParams(), page = 1) {
  try {
    searchParams.set('page', page);
    const url = `https://client-control.911-ens-services.com/fullPull/${clientKey}?${searchParams}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      incidentData = data.data;
      renderPageContent(data); // Render table, pagination, and filters
    } else {
      showError(data.error || 'Error loading page content with filters.');
    }
  } catch (error) {
    console.error('Error fetching incident data:', error);
    showError('Error loading page content.');
  }
}

// Display error messages
function showError(message) {
  setStage.innerHTML = `<p>${message}</p>`;
}

// Render page content with filters, table, and pagination
function renderPageContent(data) {
  setStage.innerHTML = ''; // Clear content body
  initializeFilterInterface(data.filters); // Initialize filter interface
  renderTable(); // Render incident data table
  createPagination(data); // Create pagination controls
}

// Filter Interface Initialization
function initializeFilterInterface(filters) {
  const menuContent = document.getElementById('menuContent');
  menuContent.innerHTML = ''; // Clear previous filters

  const form = document.createElement('form');
  form.id = 'dataFilterForm';

  // Dynamically generate filter fields
  form.appendChild(createInputField('startDate', 'date', 'Start Date'));
  form.appendChild(createInputField('endDate', 'date', 'End Date'));
  form.appendChild(createDropdown('agencyType', createAgencyOptions()));
  form.appendChild(createDropdown('jurisdiction', createOptionsFromArray(filters.jurisdictions, 'Jurisdiction')));
  form.appendChild(createDropdown('battalion', createOptionsFromArray(filters.battalions, 'Battalion')));
  form.appendChild(createDropdown('type', createOptionsFromArray(filters.types, 'Type')));
  form.appendChild(createDropdown('typeDescription', createOptionsFromArray(filters.typeDescriptions, 'Type Description')));
  form.appendChild(createInputField('masterIncidentId', 'text', 'Master Incident Id'));
  form.appendChild(createInputField('location', 'text', 'Location'));

  // Add buttons for form submission and reset
  form.appendChild(createButton('submit', 'Apply Filters', 'subButt'));
  form.appendChild(createButton('button', 'Reset Report', 'resButt', () => window.location.reload()));

  menuContent.appendChild(form);

  form.addEventListener('submit', handleFilterSubmit); // Attach filter submission logic
}

// Handle filter form submission
async function handleFilterSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  // Collect non-empty form values
  formData.forEach((value, key) => {
    if (value.trim() !== '') {
      lastSubmittedFormData.set(key, value);
    }
  });

  console.log('Filters applied:', lastSubmittedFormData);
  await fetchIncidentData(lastSubmittedFormData); // Fetch data with applied filters
}

// Helper function to create dropdowns
function createDropdown(id, options) {
  const select = document.createElement('select');
  select.id = id;
  select.name = id;

  options.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  });

  return select;
}

// Helper function to create input fields
function createInputField(id, type, placeholder) {
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;

  return input;
}

// Helper function to create buttons
function createButton(type, text, className, onClick) {
  const button = document.createElement('button');
  button.type = type;
  button.textContent = text;
  button.className = className;
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

// Create dropdown options for agencies
function createAgencyOptions() {
  return [
    { label: 'Select Agency Type', value: '' },
    { label: 'Law', value: 'Law' },
    { label: 'Fire', value: 'Fire' },
    { label: 'EMS', value: 'EMS' },
  ];
}

// Create options from a given array
function createOptionsFromArray(array, label) {
  const filteredArray = array.filter((item) => item && item.trim() !== '');
  return [{ label: `Select ${label}`, value: '' }, ...filteredArray.map((item) => ({ label: item, value: item }))];
}

// Render the table with incident data
function renderTable() {
  const tableContainer = document.getElementById('contentBody');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Define the fields to be displayed in the table
  const specifiedFields = ['master_incident_id', 'agency_type', 'battalion', 'creation', 'jurisdiction', 'location', 'type_description'];
  table.appendChild(thead);
  table.appendChild(tbody);

  // Create table headers
  const headerRow = document.createElement('tr');
  specifiedFields.forEach((field) => {
    const th = document.createElement('th');
    th.textContent = field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Populate table rows with incident data
  incidentData.forEach((item) => {
    const row = document.createElement('tr');
    specifiedFields.forEach((field) => {
      const td = document.createElement('td');
      td.textContent = field === 'creation' ? formatDate(item[field]) : item[field];
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  tableContainer.innerHTML = ''; // Clear old table content
  tableContainer.appendChild(table); // Add new table
}

// Format date fields
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  };
  return new Intl.DateTimeFormat('default', options).format(date);
}

// Create pagination controls
function createPagination(data) {
  const paginationContainerTop = document.createElement('div');
  const paginationContainerBottom = document.createElement('div');

  setStage.insertBefore(paginationContainerTop, setStage.firstChild);
  setStage.appendChild(paginationContainerBottom);

  renderPaginationControls(paginationContainerTop, data, 25);
  renderPaginationControls(paginationContainerBottom, data, 25);
}

// Render pagination controls
function renderPaginationControls(container, data, entriesPerPage) {
  container.innerHTML = ''; // Clear previous pagination

  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  // Previous button
  const prev = createPaginationButton('&#10094; Prev', data.page > 1, () => goToPage(data.page - 1));
  pagination.appendChild(prev);

  // Page number display
  const span = document.createElement('span');
  span.textContent = `Page ${data.page} of ${data.totalPages}`;
  pagination.appendChild(span);

  // Next button
  const next = createPaginationButton('Next &#10095;', data.page < data.totalPages, () => goToPage(data.page + 1));
  pagination.appendChild(next);

  container.appendChild(pagination);

  // Show entries information
  const entriesInfo = document.createElement('p');
  const startEntry = (data.page - 1) * entriesPerPage + 1;
  let endEntry = data.page * entriesPerPage;
  endEntry = endEntry > data.totalEntries ? data.totalEntries : endEntry;

  entriesInfo.textContent = `Showing ${startEntry}-${endEntry} of ${data.totalEntries} entries`;
  container.appendChild(entriesInfo);
}

// Helper to create pagination buttons
function createPaginationButton(text, isEnabled, onClick) {
  const button = document.createElement('a');
  button.href = '#';
  button.innerHTML = text;
  button.className = isEnabled ? 'pagination-btn' : 'pagination-btn disabled';
  if (isEnabled) {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      onClick();
    });
  }
  return button;
}

// Go to specific page
function goToPage(pageNumber) {
  console.log('Go to page:', pageNumber);
  fetchIncidentData(lastSubmittedFormData, pageNumber);
}

