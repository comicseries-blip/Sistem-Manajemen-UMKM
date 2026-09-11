import './styles/main.css';
import { initRouter } from './core/router.js';
import { initModals } from './core/ui.js';
import { initDashboard, renderDashboard } from './modules/dashboard.js';
import { initProducts } from './modules/products.js';
import { initPos } from './modules/pos.js';
import { initFinance } from './modules/finance.js';
import { initCustomers } from './modules/customers.js';
import { initReports } from './modules/reports.js';
import { initExport } from './modules/export.js';
import { initSettings, applySettingsToUI } from './modules/settings.js';

initRouter();
initModals();
initDashboard();
initProducts();
initPos();
initFinance();
initCustomers();
initReports();
initExport();
initSettings();

applySettingsToUI();
renderDashboard();