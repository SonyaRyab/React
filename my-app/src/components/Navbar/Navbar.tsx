import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { useEffect, useState } from "react";
import { getCartIcon } from "../../modules/api";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";
import type { FC } from "react";

interface AppNavbarProps {
  cartCount?: number;
}

export const AppNavbar: FC<AppNavbarProps> = ({ cartCount = 0 }) => {
  const [serverCount, setServerCount] = useState(0);

  useEffect(() => {
    getCartIcon()
      .then((data: { count: number }) => setServerCount(data.count))
      .catch(() => setServerCount(0));
  }, []);

  const totalCount = Math.max(cartCount, serverCount);

  return (
  <Navbar bg="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to={ROUTES.HOME}>
          Синтез Метана
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={ROUTES.HOME}>
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to={ROUTES.REAGENTS}>
              Каталог
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to={ROUTES.METHANE}>
              Заявка {totalCount > 0 && <Badge bg="danger">{totalCount}</Badge>}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
};

export default AppNavbar;