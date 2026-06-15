import { useEffect, useMemo, useState, type FC } from 'react';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '../../components/Header/Header';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS, ROUTES } from '../../Routes';
import type { AppDispatch, RootState } from '../../store';

import {
  setMethaneData,
  updateReagentCountLocal,
  removeReagentFromMethaneApplication,
  clearMethaneApplicationOnServer,
  resetDraft,
  getMethaneApplication,
  loadDraftFromServer,
  saveMethaneTemperature,
  saveMethaneVolume,
  saveMethaneApplicationForm,
  saveReagentVolume,
} from '../../slices/methaneApplicationDraftSlice';

import {
  confirmDraftApplication,
  fetchApplicationById,
  clearCurrentApplication,
} from '../../slices/applicationsSlice';

import { formatDateTimeRu } from '../../utils/format';
import './MethaneApplicationPage.css';

type ViewReagent = {
  id: number;
  name: string;
  formula: string;
  price: number;
  count: number;
};

export const MethaneApplicationPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { appid: appidParam } = useParams<{ appid: string }>();
  const [successText, setSuccessText] = useState('');

  const draftState = useSelector((state: RootState) => state.methaneApplicationDraft);
  const applicationsState = useSelector((state: RootState) => state.applications);

  const { reagents, methaneData, error, isDraft, app_id: appidFromStore } = draftState;
  const { currentItem, loading } = applicationsState;

  const currentAppId = appidParam ? Number(appidParam) : appidFromStore;
  const isExplicitRoute = Boolean(appidParam);

  useEffect(() => {
    const load = async () => {
      if (appidParam) {
        const id = Number(appidParam);
        if (Number.isNaN(id)) return;

        const result = await dispatch(fetchApplicationById(id));
        if (fetchApplicationById.fulfilled.match(result)) {
          const item: any = result.payload;
          if ((item?.status ?? '') === 'draft') {
            dispatch(loadDraftFromServer(item));
          }
        }
      } else {
        await dispatch(getMethaneApplication());
      }
    };

    void load();

    return () => {
      dispatch(clearCurrentApplication());
    };
  }, [dispatch, appidParam]);

  const editableDraft =
    isDraft &&
    !!draftState.app_id &&
    (!isExplicitRoute || Number(appidParam) === draftState.app_id);

  const readonlyReagents: ViewReagent[] = useMemo(() => {
    if (!currentItem?.reagents) return [];
    return currentItem.reagents.map((item: any, index: number) => ({
      id: item.reagent?.id ?? index + 1,
      name: item.reagent?.name ?? `Реагент #${index + 1}`,
      formula: item.reagent?.formula ?? '-',
      price: Number(item.reagent?.price ?? 0),
      count: Number(item.volume ?? 0),
    }));
  }, [currentItem]);

  const displayReagents: ViewReagent[] = editableDraft
    ? reagents.map((item) => ({
        id: item.reagent.id,
        name: item.reagent.name,
        formula: item.reagent.formula,
        price: Number(item.reagent.price ?? 0),
        count: item.count,
      }))
    : readonlyReagents;

  const totalPrice = useMemo(
    () => displayReagents.reduce((sum, item) => sum + item.price * item.count, 0),
    [displayReagents]
  );

  const totalCount = useMemo(
    () => displayReagents.reduce((sum, item) => sum + item.count, 0),
    [displayReagents]
  );

  const pageError = error || applicationsState.error;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    dispatch(setMethaneData({ [name]: value }));
  };

  const handleDecrease = (reagentId: number, currentCount: number) => {
    if (currentCount <= 1) return;
    dispatch(updateReagentCountLocal({ reagentId, count: currentCount - 1 }));
  };

  const handleIncrease = (reagentId: number, currentCount: number) => {
    dispatch(updateReagentCountLocal({ reagentId, count: currentCount + 1 }));
  };

  const handleCountChange = (reagentId: number, value: string) => {
    const nextCount = Number(value);
    if (Number.isNaN(nextCount) || nextCount < 1) return;
    dispatch(updateReagentCountLocal({ reagentId, count: nextCount }));
  };

  const handleSaveTemperature = async () => {
    if (!draftState.app_id) return;
    const result = await dispatch(
      saveMethaneTemperature({
        appId: draftState.app_id,
        temperature: methaneData.reagenttemperature ?? '0',
      })
    );
    if (saveMethaneTemperature.fulfilled.match(result)) {
      setSuccessText('Температура сохранена');
    }
  };

  const handleSaveVolume = async () => {
    if (!draftState.app_id) return;
    const result = await dispatch(
      saveMethaneVolume({
        appId: draftState.app_id,
        volume: methaneData.volume ?? '0',
      })
    );
    if (saveMethaneVolume.fulfilled.match(result)) {
      setSuccessText('Объемы сохранены');
    }
  };

  const handleSaveDraftForm = async () => {
    const result = await dispatch(saveMethaneApplicationForm());
    if (saveMethaneApplicationForm.fulfilled.match(result)) {
      setSuccessText('Поля заявки сохранены');
    }
  };

  const handleSaveVolume = async (reagentId: number, count: number) => {
    const result = await dispatch(saveReagentVolume({ reagentId, count }));
    if (saveReagentVolume.fulfilled.match(result)) {
      setSuccessText(`Количество для реагента #${reagentId} сохранено`);
    }
  };

  const handleRemove = async (reagentId: number) => {
    await dispatch(removeReagentFromMethaneApplication(reagentId));
  };

  const handleClearDraft = async () => {
    if (!draftState.app_id) return;

    await dispatch(clearMethaneApplicationOnServer(String(draftState.app_id)));
    dispatch(resetDraft());
    navigate(`${ROUTES.REAGENTS}`);
  };

  const handleSubmitApplication = async () => {
    if (!draftState.app_id) return;

    const result = await dispatch(
      confirmDraftApplication({
        id: draftState.app_id,
        payload: {
          name: methaneData.topic ?? '',
          temperature: Number(methaneData.reagenttemperature ?? 0),
          methaneyield: Number(methaneData.volume ?? 0),
        },
      })
    );

    if (confirmDraftApplication.fulfilled.match(result)) {
      dispatch(resetDraft());
      navigate(`${ROUTES.APPLICATIONS}`);
    }
  };

  const title = editableDraft
    ? 'Черновик заявки на синтез метана'
    : `Заявка #${currentAppId ?? currentItem?.id ?? ''}`;

  return (
    <div className="methane-page-root">
      <Header />

      <div className="container methane-page-container">
        <BreadCrumbs
          crumbs={[{ label: ROUTE_LABELS.METHANE_APPLICATION }]}
        />

        <h1 className="methane-page-title">{title}</h1>

        {loading && <Spinner animation="border" />}
        {pageError && <Alert variant="danger">{pageError}</Alert>}
        {successText && <Alert variant="success">{successText}</Alert>}

        {editableDraft && (
          <div className="methane-page-form-block">
            <Form.Group className="mb-3">
              <Form.Label>Тема</Form.Label>
              <Form.Control
                type="text"
                name="topic"
                value={methaneData.topic ?? ''}
                onChange={handleInputChange}
                placeholder="Введите тему заявки"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Температура, °C</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="number"
                  name="reagenttemperature"
                  value={methaneData.reagenttemperature ?? ''}
                  onChange={handleInputChange}
                  placeholder="Например: 300"
                />
                <Button variant="outline-primary" onClick={handleSaveTemperature}>
                  Сохранить температуру
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Объемы</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="number"
                  name="volume"
                  value={methaneData.volume ?? ''}
                  onChange={handleInputChange}
                  placeholder="Введите объем"
                />
                <Button variant="outline-primary" onClick={handleSaveVolume}>
                  Сохранить объемы
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Комментарий</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="comment"
                value={methaneData.comment ?? ''}
                onChange={handleInputChange}
                placeholder="Комментарий к заявке"
              />
            </Form.Group>

            <Button variant="primary" onClick={handleSaveDraftForm}>
              Сохранить поля заявки
            </Button>
          </div>
        )}

        {!editableDraft && currentItem && (
          <div className="methane-page-form-block">
            <p><b>Тема:</b> {currentItem.name || '-'}</p>
            <p><b>Статус:</b> {currentItem.status || '-'}</p>
            <p><b>Температура:</b> {currentItem.temperature ?? '-'}</p>
            <p>
              <b>Исследователь:</b>{' '}
              {currentItem.researcher?.username || currentItem.researcher?.login || '-'}
            </p>
            <p>
              <b>Создана:</b> {formatDateTimeRu(currentItem.datecreate)}
            </p>
          </div>
        )}

        {displayReagents.length === 0 ? (
          <Alert variant="secondary">В заявке пока нет реагентов.</Alert>
        ) : (
          <div className="methane-page-table-wrapper">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Реагент</th>
                  <th>Формула</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                  {editableDraft && <th>Действия</th>}
                </tr>
              </thead>
              <tbody>
                {displayReagents.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.formula}</td>
                    <td>{item.price}</td>
                    <td>
                      {editableDraft ? (
                        <div className="qty-controls d-flex gap-2 align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleDecrease(item.id, item.count)}
                          >
                            -
                          </Button>

                          <Form.Control
                            type="number"
                            min={1}
                            value={item.count}
                            onChange={(e) =>
                              handleCountChange(item.id, e.target.value)
                            }
                            className="qty-input"
                          />

                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleIncrease(item.id, item.count)}
                          >
                            +
                          </Button>
                        </div>
                      ) : (
                        item.count
                      )}
                    </td>
                    <td>{item.price * item.count}</td>

                    {editableDraft && (
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleSaveVolume(item.id, item.count)}
                          >
                            Сохранить количество
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemove(item.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <div className="methane-summary">
          <h4>Всего позиций: {totalCount}</h4>
          <h4>Общая стоимость: {totalPrice}</h4>
        </div>

        {editableDraft && (
          <div className="methane-actions d-flex gap-2 flex-wrap">
            <Button
              variant="success"
              onClick={handleSubmitApplication}
              disabled={!draftState.app_id || displayReagents.length === 0}
            >
              Подтвердить заявку
            </Button>

            <Button
              variant="outline-danger"
              onClick={handleClearDraft}
              disabled={!draftState.app_id || displayReagents.length === 0}
            >
              Очистить всю заявку
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MethaneApplicationPage;