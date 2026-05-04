import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, Navigate } from 'react-router-dom';

import { ReagentsPage } from './pages/ReagentsPage/ReagentsPage';
import { ReagentDetailPage } from './pages/ReagentDetailPage/ReagentDetailPage';
import LoginPage from './pages/LoginPage/LoginPage';
import MethaneApplicationPage from './pages/MethaneApplicationPage/MethaneApplicationPage';
import { ROUTES } from './Routes';

function App() {
  return (
    <Routes>
      <Route 
        path={ROUTES.HOME} 
        element={<Navigate to={ROUTES.REAGENTS} replace />} 
      />
      <Route 
        path={ROUTES.LOGIN} 
        element={<LoginPage />} 
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
    </Routes>
  );
}

export default App;