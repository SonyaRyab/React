import type { FC } from "react";
import { Button } from "react-bootstrap";
import { BreadCrumbs } from "../../components/BreadCrumbs/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../../Routes";
import type { Reagent } from "../../modules/types";
import { useNavigate } from "react-router-dom";

interface MethanePageProps {
  cartItems: Reagent[];
  removeFromCart: (reagentId: number) => void;
  clearCart: () => void;
}

export const MethanePage: FC<MethanePageProps> = ({ cartItems, removeFromCart, clearCart }) => {
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.METHANE }]} />
        <div className="empty-cart">
          <h3>Заявка пуста</h3>
          <Button onClick={() => navigate(ROUTES.REAGENTS)}>Перейти к реагентам</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.METHANE }]} />
      
      <header className="full-width-header">
        <div className="header-title" style={{ color: '#F59E0B' }}>
          Моя заявка
        </div>
      </header>

      <div className="table-header-card">
        <div className="table-header-row">
          <div className="header-cell">Изображение</div>
          <div className="header-cell">Название</div>
          <div className="header-cell">Формула</div>
          <div className="header-cell">Действия</div>
        </div>
      </div>

      <div className="table-body">
        {cartItems.map((reagent, index) => (
          <div className="table-data-row" key={`${reagent.id}-${index}`}>
            <div className="data-cell">
              <img src={reagent.img || "/default.jpg"} alt={reagent.name} width="50" height="50" />
            </div>
            <div className="data-cell">{reagent.name}</div>
            <div className="data-cell reagent-formula">{reagent.formula}</div>
            <div className="data-cell">
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => removeFromCart(reagent.id)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="application-actions">
        <Button className="save-changes-btn" onClick={() => alert("Заявка сформирована!")}>
          Сформировать заявку
        </Button>
        <Button className="clear-app-btn" onClick={clearCart}>
          Очистить
        </Button>
      </div>
    </div>
  );
};