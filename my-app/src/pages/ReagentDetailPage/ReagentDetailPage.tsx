import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { FC } from "react";
import { BreadCrumbs } from "../../components/BreadCrumbs/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../../Routes";
import { getReagentById } from "../../modules/api";
import { REAGENTS_MOCK } from "../../modules/mock";
import type { Reagent } from "../../modules/types";
import { Spinner, Button } from "react-bootstrap";
import "./ReagentDetailPage.css";

interface ReagentDetailPageProps {
  addToCart?: (reagent: Reagent) => void;
}

export const ReagentDetailPage: FC<ReagentDetailPageProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reagent, setReagent] = useState<Reagent>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getReagentById(id)
      .then(setReagent)
      .catch(() => setReagent(REAGENTS_MOCK.find((r) => r.id === Number(id))))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner animation="border" />;
  if (!reagent) return <div>Реагент не найден</div>;

  return (
    <div>
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.REAGENTS, path: ROUTES.REAGENTS },
          { label: reagent.name || "Реагент" },
        ]}
      />
      
      <div className="wibes-card">
        <div className="wibes-header">
          <div className="wibes-avatar">
            <img src={reagent.img || "/default.jpg"} alt={reagent.name} />
          </div>
          <div className="wibes-title-info">
            <div className="wibes-name">{reagent.name}</div>
            <div className="wibes-formula">{reagent.formula}</div>
          </div>
        </div>

        <div className="wibes-video-wrapper">
          {reagent.video ? (
            <video className="wibes-video" autoPlay muted loop playsInline>
              <source src={reagent.video} type="video/mp4" />
            </video>
          ) : (
            <div className="no-video">Видео недоступно</div>
          )}
          
          <div className="wibes-actions">
            <div className="wibes-action-btn">
              <span className="wibes-icon">⚗️</span>
              <span className="wibes-count">В реакцию</span>
            </div>
          </div>
        </div>

        <div className="wibes-video-info">
          <div className="wibes-desc">{reagent.description}</div>
          <div className="wibes-stats">
            <span>Молярная масса: {reagent.molar_mass} г/моль</span>
          </div>
        </div>
      </div>

      <Button className="back-button" onClick={() => navigate(-1)}>
        Назад
      </Button>
    </div>
  );
};