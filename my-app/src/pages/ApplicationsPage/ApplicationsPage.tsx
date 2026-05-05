//список заявок пользователя

import { useEffect } from 'react';
import { Alert, Button, Container, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import type { AppDispatch, RootState } from '../../store';
import { fetchMyApplications } from '../../slices/applicationsSlice';
import LoadingOverlay from '../../components/LoadingOverlay';
import { ROUTES } from '../../Routes';

const ApplicationsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { items, loading, error } = useSelector((state: RootState) => state.applications);

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  return (
    <>
      <Header />
      <LoadingOverlay show={loading} text="Загрузка заявок..." />

      <Container>
        <h2 className="mb-4">Мои заявки</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && items.length === 0 && (
          <Alert variant="secondary">У вас пока нет заявок.</Alert>
        )}

        {items.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Дата обновления</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name || 'Без названия'}</td>
                  <td>{item.status || '-'}</td>
                  <td>{item.date_create ? new Date(item.date_create).toLocaleString() : '-'}</td>
                  <td>{item.date_update ? new Date(item.date_update).toLocaleString() : '-'}</td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`${ROUTES.METHANE_APPLICATION}/${item.id}`)
                      }
                    >
                      Открыть
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

export default ApplicationsPage;