import { FC } from 'react';
import { Alert, Button, Form, Table } from 'react-bootstrap';
import Header from '../../components/Header/Header';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  setMethaneData,
  updateReagentCount,
  removeReagentFromMethaneApplication,
  clearMethaneApplicationOnServer,
} from '../../slices/methaneApplicationDraftSlice';
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs';
import { ROUTE_LABELS } from '../../Routes';
import './MethaneApplicationPage.css';

export const MethaneApplicationPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { reagents, methaneData, error, isDraft, app_id } = useSelector(
    (state: RootState) => state.methaneApplicationDraft
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    dispatch(setMethaneData({ [name]: value }));
  };

  const totalPrice = reagents.reduce(
    (sum, item) => sum + (item.reagent.price || 0) * item.count,
    0
  );

  return (
    <div className="methane-page-root">
      <Header />

      <div className="container methane-page-container">
        <h1 className="methane-page-title">Заявка на синтез метана</h1>
        {error && <Alert variant="danger">{error}</Alert>}

        <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.METHANE_APPLICATION }]} />

        {isDraft && (
          <div className="methane-page-form-block">
            <Form.Group className="mb-3">
              <Form.Label>Название процесса</Form.Label>
              <Form.Control
                type="text"
                name="process_name"
                value={methaneData.process_name ?? ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Температура реагента, °C</Form.Label>
              <Form.Control
                type="text"
                name="reagent_temperature"
                value={methaneData.reagent_temperature ?? ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label>Комментарий</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="comment"
                value={methaneData.comment ?? ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </div>
        )}

        {reagents.length === 0 ? (
          <Alert variant="secondary">Черновик заявки пуст.</Alert>
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
                  {isDraft && <th>Действия</th>}
                </tr>
              </thead>
              <tbody>
                {reagents.map((item) => (
                  <tr key={item.reagent.id}>
                    <td>{item.reagent.name}</td>
                    <td>{item.reagent.formula}</td>
                    <td>{item.reagent.price ?? 0} ₽</td>
                    <td className="methane-qty-cell">
                      {isDraft ? (
                        <Form.Control
                          type="number"
                          min={1}
                          value={item.count}
                          onChange={(e) =>
                            dispatch(
                              updateReagentCount({
                                reagentId: item.reagent.id,
                                count: Number(e.target.value),
                              })
                            )
                          }
                        />
                      ) : (
                        item.count
                      )}
                    </td>
                    <td>{(item.reagent.price ?? 0) * item.count} ₽</td>
                    {isDraft && (
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            dispatch(
                              removeReagentFromMethaneApplication(item.reagent.id)
                            )
                          }
                        >
                          Удалить
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <h4 className="methane-total">Итоговая стоимость: {totalPrice} ₽</h4>

        <div className="methane-actions">
          {isDraft && app_id && (
            <Button
              variant="outline-danger"
              onClick={() =>
                dispatch(clearMethaneApplicationOnServer(String(app_id)))
              }
            >
              Удалить заявку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MethaneApplicationPage;