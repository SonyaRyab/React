import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";
import type { FC } from "react";

interface AppNavbarProps {
  cartCount?: number;
}

export const AppNavbar: FC<AppNavbarProps> = ({ cartCount = 0 }) => (
  <Navbar bg="light" expand="lg" className="mb-3">
    <Container>
      <Navbar.Brand as={Link} to={ROUTES.HOME}>Синтез Метана</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to={ROUTES.HOME}>Главная</Nav.Link>
          <Nav.Link as={Link} to={ROUTES.REAGENTS}>Каталог</Nav.Link>
        </Nav>
        <Nav>
          <Nav.Link as={Link} to={ROUTES.METHANE}>
            Заявка {cartCount > 0 && <Badge bg="danger">{cartCount}</Badge>}
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default AppNavbar;