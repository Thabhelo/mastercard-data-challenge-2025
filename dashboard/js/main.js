import { loadData } from './utils/data-loader.js';
import { initOverview } from './visualizations/overview.js';
import { initRiskMap } from './visualizations/risk-map.js';
import { initTrends } from './visualizations/trends.js';
import { initVulnerability } from './visualizations/vulnerability.js';

let appData = null;

async function init() {
    try {
        appData = await loadData();
        initializeNavigation();
        initOverview(appData);
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showError('Failed to load data. Please ensure data files are available.');
    }
}

function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;
            
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(`${viewName}-view`).classList.add('active');
            
            loadView(viewName);
        });
    });
}

function loadView(viewName) {
    switch(viewName) {
        case 'overview':
            initOverview(appData);
            break;
        case 'risk-map':
            initRiskMap(appData);
            break;
        case 'trends':
            initTrends(appData);
            break;
        case 'vulnerability':
            initVulnerability(appData);
            break;
    }
}

function showError(message) {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #e74c3c;">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}

init();

