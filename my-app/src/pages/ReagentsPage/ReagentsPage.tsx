import './ReagentsPage.css';
import type { FC, ChangeEvent } from 'react';
import { useEffect, useMemo } from 'react';
import { Spinner, Button } from 'react-bootstrap';
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
import Header from "../../components/Header/Header";

export const ReagentsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const appid = useSelector(
    (state: RootState) => state.methaneApplicationDraft.appid
  );

  const { searchValue, reagents, loading } = useSelector(
    (state: RootState) => state.reagents
  );

  const draftItems = useSelector(
    (state: RootState) => state.methaneApplicationDraft.reagents
  );

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
              placeholder="Поиск по названию или формуле..."
              value={searchValue}
              onChange={(e) => dispatch(setSearchValue(e.target.value))}
            />
            <button className="search-button" onClick={() => dispatch(getReagentsList())}>
              Найти
            </button>
          </div>
        </div>
        <div className={`calculate-btn ${draftItems.length > 0 ? 'cart-active' : 'cart-disabled'}`}
          onClick={() => navigate( 
            appid
              ? `${ROUTES.METHANE_APPLICATION}/${appid}`
              : ROUTES.METHANE_APPLICATION
          )}
          style={{ cursor: 'pointer' }}>
          <span className="cart-badge">{draftItems.reduce((sum, item) => sum + item.count, 0)}</span>
          <svg className="cart-icon" viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label><b>Мультимодальный поиск по изображению:</b></label>
        <input type="file" accept="image/*" onChange={handleImageSearch} />
        {imageEmbedding && (
          <Button
            variant="secondary"
            size="sm"
            onClick={resetSearch}
            style={{ marginLeft: 12 }}
          >
            Сбросить поиск
          </Button>
        )}
        {!ready && <div>Загрузка модели... {Math.round(progress)}%</div>}
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
            onClick={() => navigate(`${ROUTES.REAGENTS}/${reagent.id}`)}
            onAddToCart={() => dispatch(addReagentToMethaneApplication(reagent))}
            isInCart={draftItems.some((item) => item.reagent?.id === reagent.id)}
            similarityPercent={imageEmbedding ? reagent.score * 100 : undefined}
          />
        ))}
      </div>
    </div>
    </>
  );
};