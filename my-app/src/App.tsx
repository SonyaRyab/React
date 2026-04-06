import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage/HomePage";
import { AppNavbar } from "./components/Navbar/Navbar";
import { ReagentsPage } from "./pages/ReagentsPage/ReagentsPage";
import { ReagentDetailPage } from "./pages/ReagentDetailPage/ReagentDetailPage";
import { MethanePage } from "./pages/MethanePage/MethanePage";
import { ROUTES } from "./Routes";
import type { Reagent } from "./modules/types";
import { useState } from "react";

function App() {
   const [cartItems, setCartItems] = useState<Reagent[]>([]);

  const addToCart = (reagent: Reagent) => {
    setCartItems((prev) => [...prev, reagent]);
  };

  const removeFromCart = (reagentId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== reagentId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <>
      <AppNavbar cartCount={cartItems.length} />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route 
          path={ROUTES.REAGENTS} 
          element={<ReagentsPage cartItems={cartItems} addToCart={addToCart} />} 
        />
        <Route path={ROUTES.REAGENT} element={<ReagentDetailPage addToCart={addToCart} />} />
        <Route 
          path={ROUTES.METHANE} 
          element={<MethanePage cartItems={cartItems} removeFromCart={removeFromCart} clearCart={clearCart} />} 
        />
      </Routes>
    </>
  );
}

export default App;