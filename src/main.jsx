import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // HashRouter para resolver 404s em page refresh
import App from '@/App';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { AuthProvider } from '@/contexts/AuthContext';
import { PaymentProvider } from '@/contexts/PaymentContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/index.css';
import PaymentModal from '@/components/payment/PaymentModal';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <ScrollToTop />
        <AuthProvider>
          <PaymentProvider>
            <App />
            <PaymentModal />
          </PaymentProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);