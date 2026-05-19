import type { FC } from "react";
import { Card, Button } from "react-bootstrap";
// import "./ReagentCard.css";
import defaultImage from "../../assets/default_image.jpg";
import type { Reagent } from "../../modules/types";
import { getMediaUrl } from "../../modules/media";

interface Props {
  reagent: Reagent;
  onClick?: () => void;
  onAddToCart?: () => void;
  isInCart?: boolean;
  similarityPercent?: number;
}

export const ReagentCard: FC<Props> = ({ reagent, onClick, onAddToCart, isInCart, similarityPercent }) => (
  <Card className="reagent-card product-card" onClick={onClick} style={{ cursor: "pointer" }}>    
    <div className="product-title-container">
      <Card.Title className="product-name">{reagent.name}</Card.Title>
    </div>
    <Card.Img
      variant="top"
      src={getMediaUrl(reagent.img) || defaultImage}
      height={200}
    />
    <Card.Body>
      <div className="product-formula">{reagent.formula}</div>
      {typeof similarityPercent === 'number' && (
        <div style={{ marginBottom: 12, fontWeight: 600, color: '#0d6efd' }}>
          Схожесть: {Math.round(similarityPercent)}%
        </div>
      )}

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