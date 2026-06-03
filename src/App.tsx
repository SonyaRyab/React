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
import { FeedPage } from "./pages/FeedPage/FeedPage";
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
        path="/reagents"
        element={<ReagentsPage />} 
      />
      <Route
        path="/reagents/:id"
        element={<ReagentDetailPage />}
      />
      <Route 
        path="/methane-application"
        element={<MethaneApplicationPage />} 
      />
      <Route
        path="/methane-application/:appid"
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

      <Route
        path={ROUTES.FEED}
        element={
          <ProtectedRoute requireAuth>
            <FeedPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default App;