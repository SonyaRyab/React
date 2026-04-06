import "./ReagentsPage.css";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { ReagentCard } from "../../components/ReagentCard/ReagentCard";
import { BreadCrumbs } from "../../components/BreadCrumbs/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../../Routes";
import { getReagents } from "../../modules/api";
import { REAGENTS_MOCK } from "../../modules/mock";
import type { Reagent } from "../../modules/types";
import { useNavigate } from "react-router-dom";

interface ReagentsPageProps {
  cartItems: Reagent[];
  addToCart: (reagent: Reagent) => void;
}

export const ReagentsPage: FC<ReagentsPageProps> = ({ cartItems, addToCart }) => {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const navigate = useNavigate();

  const cartCount = cartItems.length;

  const handleSearch = () => {
    setLoading(true);
    getReagents(searchValue)
      .then((data) => setReagents(data))
      .catch(() => {
        setReagents(
          REAGENTS_MOCK.filter((r) =>
            r.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            r.formula.toLowerCase().includes(searchValue.toLowerCase())
          )
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <>
      <header className="full-width-header">
        <div className="header-title">Калькулятор синтеза метана (Реакция Сабатье)</div>
      </header>

    <div className="container">
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.REAGENTS }]} />

      <div className="tools-panel">
        <div className="search-container">
          <div className="search-form">
            <input
              className="search-input"
              placeholder="Поиск по названию или формуле..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>
              Найти
            </button>
          </div>
        </div>

        <div className={`calculate-btn ${cartCount > 0 ? "cart-active" : "cart-disabled"}`}>
          <span className="cart-badge">{cartCount}</span>
          <svg className="cart-icon" viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
      </div>

      {loading && <div className="loadingBg"><Spinner animation="border" /></div>}

      <div className="product-section">
        {!loading && reagents.length === 0 && <h3>Ничего не найдено</h3>}
        {reagents.map((reagent) => (
          <ReagentCard
            key={reagent.id}
            reagent={reagent}
            onClick={() => navigate(`${ROUTES.REAGENTS}/${reagent.id}`)}
            onAddToCart={() => addToCart(reagent)}
            isInCart={cartItems.some(item => item.id === reagent.id)}
          />
        ))}
      </div>
    </div>
    </>
  );
};