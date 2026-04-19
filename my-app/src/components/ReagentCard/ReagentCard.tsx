import type { FC } from "react";
import { Card, Button } from "react-bootstrap";
// import "./ReagentCard.css";
import defaultImage from "../../assets/default_image.jpg";
import type { Reagent } from "../../modules/types";

interface Props {
  reagent: Reagent;
  onClick?: () => void;
  onAddToCart?: () => void;
  isInCart?: boolean;
}

export const ReagentCard: FC<Props> = ({ reagent, onClick, onAddToCart, isInCart }) => (
  <Card className="reagent-card" onClick={onClick} style={{ cursor: "pointer" }}>
    <div className="product-title-container">
      <Card.Title className="product-name">{reagent.name}</Card.Title>
    </div>
    <Card.Img variant="top" src={reagent.img || defaultImage} height={200} />
    <Card.Body>
      <div className="product-formula">{reagent.formula}</div>
      <Button 
        className={`add-to-cart ${isInCart ? 'in-cart' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart?.();
        }}
        disabled={isInCart}
      >
        {isInCart ? 'В заявке' : 'В заявку'}
      </Button>
    </Card.Body>
  </Card>
);