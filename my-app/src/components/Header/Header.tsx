import { Badge, Button, Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { ROUTES } from '../../Routes';
import { AppDispatch, RootState } from '../../store';
import { logoutUserAsync } from '../../slices/userSlice';
import { clearSearchValue, getReagentsList } from '../../slices/reagentsSlice';
import { resetDraft } from '../../slices/methaneApplicationDraftSlice';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, username, role } = useSelector(
    (state: RootState) => state.user
  );
  const { appid, count } = useSelector(
    (state: RootState) => state.methaneApplicationDraft
  );

  const handleExit = async () => {
    await dispatch(logoutUserAsync());
    dispatch(clearSearchValue());
    dispatch(resetDraft());
    navigate(ROUTES.REAGENTS);
    await dispatch(getReagentsList());
  };

  const handleDraftClick = (e: React.MouseEvent) => {
    if (!appid) {
      e.preventDefault();
    }
  };

  const isModerator = role === 'professor' || role === 'admin';

  return (
    <Navbar bg="light" expand="lg" className="mb-3 app-navbar shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to={ROUTES.HOME} className="app-navbar-brand">
          Синтез Метана
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={ROUTES.HOME}>
              Главная
            </Nav.Link>

            <Nav.Link as={Link} to={ROUTES.REAGENTS}>
              Каталог реагентов
            </Nav.Link>

            {isAuthenticated && !isModerator && (
              <Nav.Link as={Link} to={ROUTES.APPLICATIONS}>
                Мои заявки
              </Nav.Link>
            )}

            {isAuthenticated && isModerator && (
              <Nav.Link as={Link} to={ROUTES.MODERATOR_APPLICATIONS}>
                Все заявки
              </Nav.Link>
            )}

            <Nav.Link
              as={Link}
              to={
                appid
                  ? `${ROUTES.METHANE_APPLICATION}/${appid}`
                  : ROUTES.METHANE_APPLICATION
              }
              onClick={handleDraftClick}
              className={!appid ? 'disabled-draft-link' : ''}
            >
              Заявка {count > 0 && <Badge bg="danger">{count}</Badge>}
            </Nav.Link>
          </Nav>

          <Nav className="align-items-center gap-2">
            {isAuthenticated && username && (
              <Navbar.Text className="app-navbar-username">
                {username}
              </Navbar.Text>
            )}

            {!isAuthenticated ? (
              <>
                <Link to={ROUTES.REGISTER}>
                  <Button className="login-btn" variant="outline-secondary">
                    Регистрация
                  </Button>
                </Link>
                <Link to={ROUTES.LOGIN}>
                  <Button className="login-btn">Вход</Button>
                </Link>
              </>
            ) : (
              <Button className="login-btn" onClick={handleExit}>
                Выход
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;