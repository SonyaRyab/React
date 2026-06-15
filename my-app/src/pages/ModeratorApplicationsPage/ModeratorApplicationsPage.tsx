import { useEffect, useMemo } from 'react';
import { Alert, Button, Container, Form, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header/Header';
import type { AppDispatch, RootState } from '../../store';
import {
  changeApplicationStatus,
  fetchAllApplications,
  setApplicationsFilter,
  setPollingEnabled,
} from '../../slices/applicationsSlice';
import LoadingOverlay from '../../components/LoadingOverlay';
import { formatDateTimeRu } from '../../utils/format';

const ModeratorApplicationsPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { items, loading, error, filters, pollingEnabled } = useSelector(
    (state: RootState) => state.applications
  );

  useEffect(() => {
    dispatch(fetchAllApplications());

    if (!pollingEnabled) return;

    const timer = window.setInterval(() => {
      dispatch(fetchAllApplications());
    }, 5000);

    return () => window.clearInterval(timer);
  }, [dispatch, pollingEnabled, filters.status, filters.createdFrom, filters.createdTo, filters.creator]);

  const filteredItems = useMemo(() => {
    const creator = filters.creator.trim().toLowerCase();

    if (!creator) return items;

    return items.filter((item) => {
      const researcherLogin = item.researcher?.login?.toLowerCase() ?? '';
      const researcherName = item.researcher?.username?.toLowerCase() ?? '';
      const topic = (item.topic || item.name || '').toLowerCase();
      return (
        researcherLogin.includes(creator) ||
        researcherName.includes(creator) ||
        topic.includes(creator)
      );
    });
  }, [items, filters.creator]);

  const handleComplete = async (id: number, status: string) => {
    await dispatch(changeApplicationStatus({ id, status }));
    dispatch(fetchAllApplications());
  };

  return (
    <>
      <Header />
      <LoadingOverlay show={loading} text="Обновление списка заявок..." />

      <Container>
        <h2 className="mb-4">Все заявки</h2>

        <div className="mb-4 d-flex flex-wrap gap-3 align-items-end">
          <Form.Group>
            <Form.Label>Статус</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={(e) =>
                dispatch(setApplicationsFilter({ key: 'status', value: e.target.value }))
              }
            >
              <option value="today">За сегодня</option>
              <option value="">Все</option>
              <option value="draft">Черновики</option>
              <option value="formed">Сформированные</option>
              <option value="completed">Завершенные</option>
              <option value="rejected">Отклоненные</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Дата начала</Form.Label>
            <Form.Control
              type="date"
              value={filters.createdFrom}
              onChange={(e) =>
                dispatch(setApplicationsFilter({ key: 'createdFrom', value: e.target.value }))
              }
            />
            <small>{formatDateRuInput(filters.createdFrom)}</small>
          </Form.Group>

          <Form.Group>
            <Form.Label>Дата окончания</Form.Label>
            <Form.Control
              type="date"
              value={filters.createdTo}
              onChange={(e) =>
                dispatch(setApplicationsFilter({ key: 'createdTo', value: e.target.value }))
              }
            />
            <small>{formatDateRuInput(filters.createdTo)}</small>
          </Form.Group>

          <Form.Group>
            <Form.Label>Создатель</Form.Label>
            <Form.Control
              type="text"
              placeholder="Введите логин или имя"
              value={filters.creator}
              onChange={(e) =>
                dispatch(setApplicationsFilter({ key: 'creator', value: e.target.value }))
              }
            />
          </Form.Group>

          <Form.Check
            type="switch"
            id="polling-switch"
            label="Polling 5 сек"
            checked={pollingEnabled}
            onChange={(e) => dispatch(setPollingEnabled(e.target.checked))}
          />
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && filteredItems.length === 0 && (
          <Alert variant="secondary">Заявки не найдены.</Alert>
        )}

        {filteredItems.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Тема</th>
                <th>Статус</th>
                <th>Пользователь</th>
                <th>Температура</th>
                <th>Результат (объем)</th>
                <th>Дата создания</th>
                <th>Дата обновления</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.topic || item.name || 'Без темы'}</td>
                  <td>{item.status || '-'}</td>
                  <td>{item.researcher?.username || item.researcher?.login || '-'}</td>
                  <td>{item.temperature ?? '-'}</td>
                  <td>{item.methaneyield ?? '-'}</td>
                  <td>{formatDateTimeRu(item.datecreate)}</td>
                  <td>{formatDateTimeRu(item.dateupdate)}</td>
                  <td className="d-flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleComplete(item.id, 'completed')}
                      disabled={item.status === 'completed'}
                    >
                      Завершить
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleComplete(item.id, 'rejected')}
                      disabled={item.status === 'rejected'}
                    >
                      Отклонить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
};

export default ModeratorApplicationsPage;