import React from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './src/pages/Home';
import PlatformStructure from './src/pages/PlatformStructure';
import CoreFunctionalities from './src/pages/CoreFunctionalities';
import AnalyticsInsights from './src/pages/AnalyticsInsights';
import SuperAdminDashboard from './src/pages/SuperAdminDashboard';
import OrgAdminDashboard from './src/pages/OrgAdminDashboard';
import PayPointPage from './src/pages/PayPointPage';
import HowItWorks from './src/pages/HowItWorks';
import Pricing from './src/pages/Pricing';
import Contact from './src/pages/Contact';
import Apply from './src/pages/Apply';
import Login from './src/pages/Login';
import NotFound from './src/pages/NotFound';
import PaypointBuilder from './src/pages/PaypointBuilder';
import PaypointBuilderPreview from './src/pages/PaypointBuilderPreview';
import PaypointReviewPage from './src/pages/PaypointReviewPage';
import PaypointTransactionsPage from './src/pages/PaypointTransactionsPage';

const App: React.FC = () => {
  return (
    <Theme appearance="inherit" radius="large" scaling="100%">
      <Router>
        <main className="min-h-screen font-inter">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/platform-structure" element={<PlatformStructure />} />
            <Route path="/core-functionalities" element={<CoreFunctionalities />} />
            <Route path="/analytics-insights" element={<AnalyticsInsights />} />
            <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/dashboard/org-admin" element={<OrgAdminDashboard />} />
            <Route path="/dashboard/org-admin/paypoints/:paypointId/builder" element={<PaypointBuilder />} />
            <Route path="/dashboard/org-admin/paypoints/:paypointId/builder/live" element={<PaypointBuilderPreview />} />
            <Route path="/dashboard/org-admin/paypoints/:paypointId/transactions" element={<PaypointTransactionsPage />} />
            <Route path="/paypoint/*" element={<PayPointPage />} />
            <Route path="/paypoint/review/*" element={<PaypointReviewPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
          />
        </main>
      </Router>
    </Theme>
  );
}

export default App;
