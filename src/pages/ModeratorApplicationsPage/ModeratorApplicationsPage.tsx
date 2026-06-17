import { useEffect, useMemo } from 'react';
import { Alert, Button, Container, Form, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import Header from '../../components/Header/Header';
import LoadingOverlay from '../../components/LoadingOverlay';
import { formatDateTimeRu } from '../../utils/format';

import type { AppDispatch, RootState } from '../../store';
import {
  changeApplicationStatus,
  fetchAllApplications,
  setApplicationsFilter,
  setPollingEnabled,
  setCurrentPage,
} from '../../slices/applicationsSlice';

const ModeratorApplicationsPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    items,
    loading,
    error,
    filters,
    pollingEnabled,
    currentPage,
    totalPages,
  } = useSelector((state: RootState) => state.applications);

  // загрузка данных при смене фильтров и/или страницы
  useEffect(() => {
    dispatch(fetchAllApplications());

    if (!pollingEnabled) return;

    const timer = window.setInterval(() => {
      dispatch(fetchAllApplications());
    }, 5000);

    return () => window.clearInterval(timer);
  }, [
    dispatch,
    pollingEnabled,
    filters.status,
    filters.createdFrom,
    filters.createdTo,
    filters.creator,
    currentPage,
  ]);

  // смена страницы
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setCurrentPage(page));
  };

  // фильтр по создателю уже поверх текущей страницы
  const filteredItems = useMemo(() => {
    const creator = filters.creator.trim().toLowerCase();
    if (!creator) return items;

    return items.filter((item) => {
      const researcherLogin = item.researcher?.login?.toLowerCase() ?? '';
      const researcherName = item.researcher?.username?.toLowerCase() ?? '';
      return (
        researcherLogin.includes(creator) ||
        researcherName.includes(creator)
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

        {/* Фильтры */}
        <div className="mb-4 d-flex flex-wrap gap-3 align-items-end">
          <Form.Group>
            <Form.Label>Статус</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={(e) =>
                dispatch(
                  setApplicationsFilter({ key: 'status', value: e.target.value })
                )
              }
            >
              <option value="">Все</option>
              <option value="draft">draft</option>
              <option value="formed">formed</option>
              <option value="completed">completed</option>
              <option value="rejected">rejected</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Дата с</Form.Label>
            <Form.Control
              type="date"
              value={filters.createdFrom}
              onChange={(e) =>
                dispatch(
                  setApplicationsFilter({
                    key: 'createdFrom',
                    value: e.target.value,
                  })
                )
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Дата по</Form.Label>
            <Form.Control
              type="date"
              value={filters.createdTo}
              onChange={(e) =>
                dispatch(
                  setApplicationsFilter({
                    key: 'createdTo',
                    value: e.target.value,
                  })
                )
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Создатель</Form.Label>
            <Form.Control
              type="text"
              placeholder="логин или имя"
              value={filters.creator}
              onChange={(e) =>
                dispatch(
                  setApplicationsFilter({
                    key: 'creator',
                    value: e.target.value,
                  })
                )
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
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Тема</th>
                  <th>Статус</th>
                  <th>Исследователь</th>
                  <th>Температура</th>
                  <th>Результат (объемы), м3</th>
                  <th>Дата создания</th>
                  <th>Дата обновления</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name || 'Без темы'}</td>
                    <td>{item.status || '-'}</td>
                    <td>
                      {item.researcher?.username ||
                        item.researcher?.login ||
                        '-'}
                    </td>
                    <td>{item.temperature ?? '-'}</td>
                    <td>{item.methaneyield ?? '-'}</td>
                    <td>{formatDateTimeRu(item.datecreate)}</td>
                    <td>{formatDateTimeRu(item.datefinish ?? item.date_form ?? item.datecreate)}</td>
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

            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Назад
                </Button>
                <span>
                  Страница {currentPage} из {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Вперёд
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default ModeratorApplicationsPage;