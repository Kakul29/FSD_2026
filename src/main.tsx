import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { DietitianPortal } from './components/DietitianPortal';
import './index.css';

// Tiny path switch: /dietitian is the dietitian portal, everything else is the shopper app
const isDietitianPage = window.location.pathname.replace(/\/+$/, '') === '/dietitian';

createRoot(document.getElementById('root')!).render(isDietitianPage ? <DietitianPortal /> : <App />);
