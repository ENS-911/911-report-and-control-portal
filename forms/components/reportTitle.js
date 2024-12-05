export function createTitleComponent(titleText = 'Default Report Title') {
  const title = document.createElement('h1');
  title.className = 'report-title';
  title.textContent = titleText;
  return title;
}