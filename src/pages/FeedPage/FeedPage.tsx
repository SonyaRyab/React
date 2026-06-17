import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Button, Alert } from "react-bootstrap";

import Header from "../../components/Header/Header";
import { getReagentById, getFeed } from "../../modules/api";
import type { Reagent } from "../../modules/types";
import { getMediaUrl } from "../../modules/media";
import { buildReagentRoute, ROUTES } from "../../Routes";

export const FeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [feedIds, setFeedIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentReagent, setCurrentReagent] = useState<Reagent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // загружаем id ленты
  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        setError('');
        const ids = await getFeed();
        setFeedIds(ids);
        setCurrentIndex(0);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  // загружаем текущую карточку
  useEffect(() => {
    const loadReagent = async () => {
      if (!feedIds.length) return;
      const id = feedIds[currentIndex];
      if (!id) return;

      try {
        setLoading(true);
        setError('');
        const data = await getReagentById(String(id));
        if (data) {
          setCurrentReagent(data);
        } else {
          setCurrentReagent(null);
        }
      } catch (e: any) {
        setError(e.message);
        setCurrentReagent(null);
      } finally {
        setLoading(false);
      }
    };

    loadReagent();
  }, [feedIds, currentIndex]);

  const handleNext = () => {
    if (currentIndex < feedIds.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // const handleBackToList = () => {
  //   navigate(ROUTES.REAGENTS);
  // };

  const isLast = currentIndex >= feedIds.length - 1;

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: 800, marginTop: 20 }}>
        <h2 className="mb-3">Лента</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading && (
          <div className="d-flex justify-content-center my-4">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && !currentReagent && !error && (
          <Alert variant="secondary">Лента пока пуста.</Alert>
        )}

        {currentReagent && (
          <div>
            <div className="mb-3">
              <strong>
                {currentIndex + 1} / {feedIds.length}
              </strong>
            </div>

            <div className="mb-3">
              <h4>{currentReagent.name}</h4>
              <div className="text-muted">{currentReagent.formula}</div>
            </div>

            <div className="mb-3">
              <video
                key={getMediaUrl(currentReagent.video)}
                src={getMediaUrl(currentReagent.video)}
                className="w-100"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div>

            <p>{currentReagent.description}</p>

            <div className="d-flex gap-2 mt-3 flex-wrap">
              <Button variant="secondary" onClick={() => navigate(ROUTES.REAGENTS)}>
                К списку
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => navigate(buildReagentRoute(currentReagent.id))}
              >
                Подробнее
              </Button>
              <Button variant="primary" onClick={handleNext} disabled={isLast}>
                Далее
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FeedPage;