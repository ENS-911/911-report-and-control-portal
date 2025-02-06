// formUtils/loadingScreen.js

export function showLoadingScreen() {
    console.log('load screen on')

    const contentBody = document.getElementById('contentBody');
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.className = 'page';

    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading-content';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Generating your report...';

    loadingContent.appendChild(spinner);
    loadingContent.appendChild(loadingMessage);
    loadingScreen.appendChild(loadingContent);
    contentBody.appendChild(loadingScreen);
}

export function removeLoadingScreen() {
    console.log('load screen off')
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.remove();
    }
}
