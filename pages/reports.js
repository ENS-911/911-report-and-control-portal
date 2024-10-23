import { globalState } from '../reactive/state.js'

let incidentData = []
const getKey = localStorage.getItem('user')
const decriptClientKey = JSON.parse(getKey)
const clientKey = decriptClientKey.key
const homeContent = document.createElement('div')
let lastSubmittedFormData = new URLSearchParams()
const setStage = document.getElementById('contentBody')

export function loadPage() {
  setStage.innerHTML = ''

  homeContent.innerText = 'Loading content...'
  setStage.appendChild(homeContent)

  datCall()
}

let data

async function datCall(searchParams = new URLSearchParams(), page = 1) {
  try {
    searchParams.set('page', page)
    const url = `https://client-control.911-ens-services.com/fullPull/${clientKey}?${searchParams}`
    const response = await fetch(url)
    data = await response.json()
    incidentData = data.data

    if (response.ok) {
      console.log(data)
      homeContent.innerText = 'Page content loaded with applied filters.'
      initializeFilterInterface()
      tableSpawn()
      createPagination(data)
    } else {
      homeContent.innerText =
        data.error || 'Error loading page content with filters.'
    }
  } catch (error) {
    console.error('Error fetching client data:', error)
    homeContent.innerText = 'Error loading page content.'
  }
}

function createPagination(data) {
  const paginationContainerTop = document.createElement('div')
  setStage.insertBefore(paginationContainerTop, setStage.firstChild)
  renderPaginationControls(paginationContainerTop, data, 25)

  const paginationContainerBottom = document.createElement('div')
  setStage.appendChild(paginationContainerBottom)
  renderPaginationControls(paginationContainerBottom, data, 25)
}

function initializeFilterInterface() {
  const menuContent = document.getElementById('menuContent')
  menuContent.innerHTML = ''

  const form = document.createElement('form')
  form.id = 'dataFilterForm'

  const wrap1 = document.createElement('div')
  form.appendChild(wrap1)
  const tag1 = document.createElement('h4')
  wrap1.appendChild(tag1)
  tag1.innerText = 'Start Date'
  wrap1.appendChild(createInputField('startDate', 'date', 'Start Date'))

  const wrap2 = document.createElement('div')
  form.appendChild(wrap2)
  const tag2 = document.createElement('h4')
  wrap2.appendChild(tag2)
  tag2.innerText = 'End Date'
  wrap2.appendChild(createInputField('endDate', 'date', 'End Date'))

  const agencyTypeWrap = document.createElement('div')
  form.appendChild(agencyTypeWrap)
  const agencyTypeTag = document.createElement('h4')
  agencyTypeTag.innerText = 'Agency Type'
  agencyTypeWrap.appendChild(agencyTypeTag)

  const agencyOptions = [
    { label: 'Select Agency Type', value: '' },
    { label: 'Law', value: 'Law' },
    { label: 'Fire', value: 'Fire' },
    { label: 'EMS', value: 'EMS' },
  ]
  agencyTypeWrap.appendChild(createDropdown('agencyType', agencyOptions))

  const jurisdictionWrap = document.createElement('div')
  form.appendChild(jurisdictionWrap)
  const jurisdictionTag = document.createElement('h4')
  jurisdictionTag.innerText = 'Jurisdiction'
  jurisdictionWrap.appendChild(jurisdictionTag)

  const jurisdictionOptions = data.filters.jurisdictions
    .filter((jurisdiction) => jurisdiction && jurisdiction.trim() !== '')
    .map((jurisdiction) => ({ label: jurisdiction, value: jurisdiction }))

  jurisdictionWrap.appendChild(
    createDropdown('jurisdiction', [
      { label: 'Select Jurisdiction', value: '' },
      ...jurisdictionOptions,
    ]),
  )

  const battalionWrap = document.createElement('div')
  form.appendChild(battalionWrap)
  const battalionTag = document.createElement('h4')
  battalionTag.innerText = 'Battalion'
  battalionWrap.appendChild(battalionTag)

  const battalionOptions = data.filters.battalions
    .filter((battalion) => battalion && battalion.trim() !== '')
    .map((battalion) => ({ label: battalion, value: battalion }))

  battalionWrap.appendChild(
    createDropdown('battalion', [
      { label: 'Select battalion', value: '' },
      ...battalionOptions,
    ]),
  )

  const typesWrap = document.createElement('div')
  form.appendChild(typesWrap)
  const typesTag = document.createElement('h4')
  typesTag.innerText = 'Types'
  typesWrap.appendChild(typesTag)

  const typesOptions = data.filters.types
    .filter((types) => types && types.trim() !== '')
    .map((types) => ({ label: types, value: types }))

  typesWrap.appendChild(
    createDropdown('type', [
      { label: 'Select Type', value: '' },
      ...typesOptions,
    ]),
  )

  const typeDescriptionWrap = document.createElement('div')
  form.appendChild(typeDescriptionWrap)
  const typeDescriptionTag = document.createElement('h4')
  typeDescriptionTag.innerText = 'Type Description'
  typeDescriptionWrap.appendChild(typeDescriptionTag)

  const typeDescriptionOptions = data.filters.typeDescriptions
    .filter(
      (typeDescriptions) => typeDescriptions && typeDescriptions.trim() !== '',
    )
    .map((typeDescriptions) => ({
      label: typeDescriptions,
      value: typeDescriptions,
    }))

  typeDescriptionWrap.appendChild(
    createDropdown('typeDescription', [
      { label: 'Select Type Description', value: '' },
      ...typeDescriptionOptions,
    ]),
  )

  const idWrap = document.createElement('div')
  form.appendChild(idWrap)
  const idTag = document.createElement('h4')
  idTag.innerText = 'Master Incident Id'
  idWrap.appendChild(idTag)
  idWrap.appendChild(createInputField('masterIncidentId', 'text', 'Enter ID'))

  const locationWrap = document.createElement('div')
  form.appendChild(locationWrap)
  const locationTag = document.createElement('h4')
  locationTag.innerText = 'Location'
  locationWrap.appendChild(locationTag)
  locationWrap.appendChild(
    createInputField('location', 'text', 'Enter Location'),
  )

  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.textContent = 'Apply Filters'
  submitButton.className = 'subButt'
  form.appendChild(submitButton)

  const resetButton = document.createElement('button')
  resetButton.type = 'button'
  resetButton.textContent = 'Reset Report'
  resetButton.className = 'resButt'
  resetButton.addEventListener('click', function () {
    window.location.reload()
  })

  form.appendChild(resetButton)

  menuContent.appendChild(form)

  form.addEventListener('submit', handleFilterSubmit)
}

function createDropdown(id, options) {
  const select = document.createElement('select')
  select.id = id
  select.name = id

  options.forEach((option) => {
    const optionElement = document.createElement('option')
    optionElement.value = option.value
    optionElement.textContent = option.label
    select.appendChild(optionElement)
  })

  console.log('Created dropdown:', select)

  return select
}

function createInputField(id, type, placeholder) {
  const input = document.createElement('input')
  input.type = type
  input.id = id
  input.name = id
  input.placeholder = placeholder

  console.log('Created input field:', input)

  return input
}

async function handleFilterSubmit(event) {
  event.preventDefault()
  const form = document.getElementById('dataFilterForm')
  const formData = new FormData(form)

  for (const [key, value] of formData.entries()) {
    if (value.trim() !== '') {
      lastSubmittedFormData.set(key, value)
    }
  }

  console.log('submmit', lastSubmittedFormData)
  datCall(lastSubmittedFormData)
}

function tableSpawn() {
  const specifiedFields = [
    'master_incident_id',
    'agency_type',
    'battalion',
    'creation',
    'jurisdiction',
    'location',
    'type_description',
  ]
  const container = document.getElementById('contentBody')
  container.innerHTML = ''
  const table = document.createElement('table')
  const thead = document.createElement('thead')
  const tbody = document.createElement('tbody')
  table.appendChild(thead)
  table.appendChild(tbody)
  container.appendChild(table)

  const headerRow = document.createElement('tr')
  specifiedFields.forEach((field) => {
    const th = document.createElement('th')
    th.textContent = field
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    headerRow.appendChild(th)
  })
  thead.appendChild(headerRow)

  function formatDate(dateString) {
    const date = new Date(dateString)

    if (date.getHours() === 24) {
      date.setHours(0)
      date.setDate(date.getDate() + 1)
    }

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }

    return new Intl.DateTimeFormat('default', options).format(date)
  }

  incidentData.forEach((item) => {
    const row = document.createElement('tr')
    specifiedFields.forEach((field) => {
      const td = document.createElement('td')
      if (field === 'creation') {
        td.textContent = formatDate(item[field])
      } else {
        td.textContent = item[field]
      }
      row.appendChild(td)
    })
    tbody.appendChild(row)
  })
}

function goToPage(pageNumber) {
  console.log('Go to page:', pageNumber)
  datCall(lastSubmittedFormData, pageNumber)
}

function renderPaginationControls(container, data, entriesPerPage) {
  container.innerHTML = ''

  const startEntry = (data.page - 1) * entriesPerPage + 1
  let endEntry = data.page * entriesPerPage
  endEntry = endEntry > data.totalEntries ? data.totalEntries : endEntry

  const pagination = document.createElement('div')
  pagination.className = 'pagination'

  const prev = document.createElement('a')
  prev.href = '#'
  prev.innerHTML = '&#10094; Prev'
  prev.className = 'pagination-prev'
  prev.addEventListener('click', (e) => {
    e.preventDefault()
    goToPage(data.page - 1)
  })
  pagination.appendChild(prev)

  if (data.page === 1) {
    prev.classList.add('disabled')
  }

  const span = document.createElement('span')
  span.textContent = `Page ${data.page} of ${data.totalPages}`
  pagination.appendChild(span)

  const next = document.createElement('a')
  next.href = '#'
  next.innerHTML = 'Next &#10095;'
  next.className = 'pagination-next'
  next.addEventListener('click', (e) => {
    e.preventDefault()
    goToPage(parseInt(data.page, 10) + 1)
  })
  pagination.appendChild(next)

  if (data.page === data.totalPages) {
    next.classList.add('disabled')
  }

  container.appendChild(pagination)

  const countWrap = document.createElement('div')
  countWrap.className = 'countWrap'
  const entriesInfo = document.createElement('p')
  entriesInfo.className = 'entries-info'
  if (data.total <= 24) {
    entriesInfo.textContent = `Showing ${startEntry}-${data.total} of ${data.total} entries`
  } else {
    entriesInfo.textContent = `Showing ${startEntry}-${endEntry} of ${data.total} entries`
  }
  container.appendChild(countWrap)
  countWrap.appendChild(entriesInfo)
}
