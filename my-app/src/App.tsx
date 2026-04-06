import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage/HomePage";
import { AppNavbar } from "./components/Navbar/Navbar";
import { ReagentsPage } from "./pages/ReagentsPage/ReagentsPage";
import { ReagentDetailPage } from "./pages/ReagentDetailPage/ReagentDetailPage";
import { ROUTES } from "./Routes";
import { useState } from "react";

function App() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <>
      <AppNavbar cartCount={cartCount} />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route 
          path={ROUTES.REAGENTS} 
          element={<ReagentsPage cartCount={cartCount} setCartCount={setCartCount} />} 
        />
        <Route path={ROUTES.REAGENT} element={<ReagentDetailPage />} />
      </Routes>
    </>
  );
}

export default App;