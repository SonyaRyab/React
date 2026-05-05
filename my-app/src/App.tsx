import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, Navigate } from 'react-router-dom';

import { ReagentsPage } from './pages/ReagentsPage/ReagentsPage';
import { ReagentDetailPage } from './pages/ReagentDetailPage/ReagentDetailPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import MethaneApplicationPage from './pages/MethaneApplicationPage/MethaneApplicationPage';
import ApplicationsPage from './pages/ApplicationsPage/ApplicationsPage';
import ModeratorApplicationsPage from './pages/ModeratorApplicationsPage/ModeratorApplicationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { HomePage } from "./pages/HomePage/HomePage";
import { ROUTES } from './Routes';

function App() {
  return (
    <Routes>
      <Route 
        path={ROUTES.HOME} 
        element={<HomePage />}
      />
      <Route 
        path={ROUTES.LOGIN} 
        element={<LoginPage />} 
      />
      <Route 
      path={ROUTES.REGISTER} 
      element={<RegisterPage />} 
      />
      <Route 
        path={ROUTES.REAGENTS} 
        element={<ReagentsPage />} 
      />
      <Route
        path={ROUTES.REAGENT}
        element={<ReagentDetailPage />}
      />
      <Route 
        path={ROUTES.METHANE_APPLICATION} 
        element={<MethaneApplicationPage />} 
      />
      <Route
        path={`${ROUTES.METHANE_APPLICATION}/:app_id`}
        element={<MethaneApplicationPage />}
      />
      <Route
        path={ROUTES.APPLICATIONS}
        element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <ApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MODERATOR_APPLICATIONS}
        element={
          <ProtectedRoute allowedRoles={['professor', 'admin']}>
            <ModeratorApplicationsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;