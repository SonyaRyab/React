import type { FC } from "react";
import { Card, Button } from "react-bootstrap";
import "./ReagentCard.css";
import defaultImage from "../../assets/DefaultImage.jpg";
import type { Reagent } from "../../modules/types";


interface Props {
  reagent: Reagent;
  onClick?: () => void;
  onAddToCart?: () => void;
}

export const ReagentCard: FC<Props> = ({ reagent, onClick, onAddToCart }) => (
  <Card className="reagent-card" onClick={onClick} style={{ cursor: "pointer" }}>
    <div className="product-title-container">
      <Card.Title className="product-name">{reagent.name}</Card.Title>
    </div>
    <Card.Img 
      variant="top" 
      src={reagent.img || defaultImage}
      height={200}
      style={{ objectFit: "contain", padding: "10px" }}
    />
    <Card.Body>
      <div className="product-formula">{reagent.formula}</div>
      <Button 
        className="add-to-cart"
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart?.();
        }}
      >
        В заявку
      </Button>
    </Card.Body>
  </Card>
);