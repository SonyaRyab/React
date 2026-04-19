import { useState } from 'react';
import { AppNavbar } from "./components/Navbar/Navbar";
import { ROUTES } from "./Routes";
import { ReagentsPage } from "./pages/ReagentsPage/ReagentsPage";
import { ReagentDetailPage } from "./pages/ReagentDetailPage/ReagentDetailPage";
import { MethanePage } from "./pages/MethanePage/MethanePage";
import type { Reagent } from './modules/types';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';

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
        <Route
          path={ROUTES.HOME}
          element={<ReagentsPage cartItems={cartItems} addToCart={addToCart} />}
        />
        <Route 
          path={ROUTES.REAGENTS} 
          element={<ReagentsPage cartItems={cartItems} addToCart={addToCart} />} 
        />
        <Route
          path={ROUTES.REAGENT}
          element={<ReagentDetailPage addToCart={addToCart} />}
        />
        <Route
          path={ROUTES.METHANE}
          element={
            <MethanePage
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;