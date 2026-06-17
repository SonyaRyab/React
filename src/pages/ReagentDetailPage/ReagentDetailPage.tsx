import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import type { FC } from "react";
import { BreadCrumbs } from "../../components/BreadCrumbs/BreadCrumbs";
import { Spinner, Button, Alert } from "react-bootstrap";
import { ROUTES, ROUTE_LABELS, buildReagentRoute } from "../../Routes";
import { getFeed, getReagentById, getReagents } from "../../modules/api";
import type { Reagent } from "../../modules/types";
import { ReagentCard } from "../../components/ReagentCard/ReagentCard";
import { getMediaUrl } from "../../modules/media";
import Header from "../../components/Header/Header";

import "./ReagentDetailPage.css"; 

interface ReagentDetailPageProps {
  addToCart?: (reagent: Reagent) => void;
}

export const ReagentDetailPage: FC<ReagentDetailPageProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reagent, setReagent] = useState<Reagent | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarReagents, setSimilarReagents] = useState<Reagent[]>([]);  
  const workerRef = useRef<Worker | null>(null);
  const [feedIds, setFeedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getReagentById(id)
      .then((data) => setReagent(data))
      .catch(() => setReagent(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getFeed()
      .then(setFeedIds)
      .catch(() => setFeedIds([]));
  }, []);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../workers/search.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'similarready') setSimilarReagents(data);
    };

    return () => workerRef.current?.terminate();
  }, []);

  useEffect(() => {
    if (!reagent) return;

    getReagents()
      .then((allReagents) =>
        workerRef.current?.postMessage({
          type: 'similar',
          data: {
            items: allReagents.map((item) => ({
              id: item.id,
              description: item.description,
              name: item.name,
              formula: item.formula,
              img: item.img,
              price: item.price,
              molarmass: item.molarmass,
            })),
            currentId: reagent.id,
            limit: 3,
          },
        }),
      )
      .catch(() => setSimilarReagents([]));
  }, [reagent]);

  const currentIndex = reagent ? feedIds.findIndex((feedId) => feedId === reagent.id) : -1;
  const nextId =
    currentIndex >= 0 && currentIndex < feedIds.length - 1 ? feedIds[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="container">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!reagent) {
    return (
      <div>
      <Header />
      <div className="container">
        <BreadCrumbs
          crumbs={[
            { label: ROUTE_LABELS.REAGENTS, path: ROUTES.REAGENTS },
            { label: "Реагент не найден" },
          ]}
        />
        <h3>Реагент не найден</h3>
        <Button className="back-button" onClick={() => navigate(ROUTES.REAGENTS)}>
          Назад к списку
        </Button>
      </div>
      </div>
    );
  }

   return (
    <div>
      <Header />
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.REAGENTS, path: ROUTES.REAGENTS },
          { label: reagent.name },
        ]}
      />

      <div className="detail-section">
        <div className="detail-card">
          <div className="detail-container">
            <div className="detail-video-wrapper">
                <video 
                  key={getMediaUrl(reagent.video)}
                  className="detail-video"
                  src={getMediaUrl(reagent.video)} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  controls
                >
                </video>
              
              <div className="detail-video-info">
                <div className="detail-desc">{reagent.description}</div>
                <div className="detail-desc">Формула: {reagent.formula}</div>
                <div className="detail-desc">Молярная масса: {reagent.molar_mass} г/моль
                </div>
                {reagent.price !== undefined && (
                  <div className="detail-desc">Цена: {reagent.price} ₽</div>
                )}
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <Button className="back-button" onClick={() => navigate(-1)}>
                    Назад
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => nextId && navigate(buildReagentRoute(nextId))}
                    disabled={!nextId}
                  >
                    Далее
                  </Button>
                </div>
                {currentIndex >= 0 && (
                  <Alert variant="light" className="mt-3 mb-0">
                    Позиция в персональной ленте: {currentIndex + 1} / {feedIds.length}
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {similarReagents.length > 0 && (
      <div className="similar-section container">
        <h3>Похожие реагенты</h3>
        <div className="product-section">
          {similarReagents.map((item) => (
            <ReagentCard
              key={item.id}
              reagent={item}
              onClick={() => navigate(buildReagentRoute(item.id!))}
            />
          ))}
        </div>
      </div>
      )}
    </div>
  );
};