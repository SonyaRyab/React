import type { FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";
import { Button, Col, Container, Row } from "react-bootstrap";

export const HomePage: FC = () => {
  return (
    <Container>
      <Row>
        <Col md={6}>
          <h1>Синтез метана</h1>
          <p>
            Добро пожаловать в калькулятор синтеза метана по реакции Сабатье!
          </p>
          <Link to={ROUTES.REAGENTS}>
            <Button variant="primary">Просмотреть реагенты</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};