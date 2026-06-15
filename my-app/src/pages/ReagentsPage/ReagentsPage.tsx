import './ReagentsPage.css';
import type { FC, ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Spinner, Button, Alert } from 'react-bootstrap';
import { ReagentCard } from '../../components/ReagentCard/ReagentCard';
import { ROUTES, ROUTE_LABELS } from '../../Routes';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { REAGENTS_MOCK } from '../../modules/mock';
import { useNavigate } from 'react-router-dom';
import { useReagentSearch } from '../../hooks/useReagentSearch';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getReagentsList, setSearchValue } from '../../slices/reagentsSlice';
import { addReagentToMethaneApplication } from '../../slices/methaneApplicationDraftSlice';
import Header from '../../components/Header/Header';

export const ReagentsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState('');

  const appid = useSelector(
    (state: RootState) => state.methaneApplicationDraft.app_id
  );

  const { searchValue, reagents, loading } = useSelector(
    (state: RootState) => state.reagents
  );

  const draftItems = useSelector(
    (state: RootState) => state.methaneApplicationDraft.reagents
  );

  const draftCount = draftItems.reduce((sum, item) => sum + item.count, 0);

  useEffect(() => {
    dispatch(getReagentsList());
  }, [dispatch]);

  const searchSource = useMemo(
    () => (reagents.length > 0 ? reagents : REAGENTS_MOCK),
    [reagents]
  );

  const {
    items: searchedItems,
    ready,
    progress,
    imageEmbedding,
    searchByImage,
    resetSearch,
  } = useReagentSearch(searchSource);

  const visibleItems = imageEmbedding
    ? searchedItems.filter((item) => item.isVisible)
    : searchedItems;

  const handleImageSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    searchByImage(file);
  };

  const openDraft = async () => {
    if (!appid || draftCount === 0) return;
    navigate(`${ROUTES.METHANE_APPLICATION}/${appid}`);
  };

  const handleAddToDraft = async (reagent_id: number) => {
    setPageError('');
    const result = await dispatch(
      addReagentToMethaneApplication({
        reagent_id,
        count: 1,
      })
    );

    if (addReagentToMethaneApplication.fulfilled.match(result)) {
      const newId = result.payload?.id;
      if (newId) {
        navigate(`${ROUTES.METHANE_APPLICATION}/${newId}`);
      }
      return;
    }

    setPageError(result.payload || 'Не удалось добавить реагент в заявку');
  };

  return (
    <>
      <Header />
      <div className="container">
        <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.REAGENTS }]} />

        <div className="tools-panel">
          <div className="search-container">
            <div className="search-form">
              <input
                className="search-input"
                placeholder="Поиск реагентов..."
                value={searchValue}
                onChange={(e) => dispatch(setSearchValue(e.target.value))}
              />
              <button
                className="search-button"
                onClick={() => dispatch(getReagentsList())}
              >
                Найти
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={openDraft}
            disabled={!appid || draftCount === 0}
            title={!appid || draftCount === 0 ? 'Корзина пуста' : 'Открыть заявку'}
          >
            Заявка ({draftCount})
          </Button>
        </div>

        {pageError && <Alert variant="danger">{pageError}</Alert>}

        <div style={{ marginBottom: 20 }}>
          <label>
            <b>Поиск по изображению:</b>
          </label>
          <input type="file" accept="image/*" onChange={handleImageSearch} />
          {imageEmbedding && (
            <Button
              variant="secondary"
              size="sm"
              onClick={resetSearch}
              style={{ marginLeft: 12 }}
            >
              Сбросить
            </Button>
          )}
          {!ready && <div>Подготовка моделей... {Math.round(progress)}%</div>}
        </div>

        {loading && (
          <div className="loadingBg">
            <Spinner animation="border" />
          </div>
        )}

        <div className="product-section">
          {!loading && visibleItems.length === 0 && <h3>Ничего не найдено</h3>}

          {visibleItems.map((reagent) => (
            <ReagentCard
              key={reagent.id}
              reagent={reagent}
              onClick={() => navigate(`${ROUTES.REAGENT}/${reagent.id}`)}
              onAddToCart={() => handleAddToDraft(reagent.id!)}
              isInCart={draftItems.some((item) => item.reagent?.id === reagent.id)}
              similarityPercent={imageEmbedding ? reagent.score * 100 : undefined}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ReagentsPage;