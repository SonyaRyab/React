import type { FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../Routes";
import { Button, Col, Container, Row } from "react-bootstrap";
import Header from "../../components/Header/Header";

export const HomePage: FC = () => {
  return (
    <>
    <Header />
    <Container>
      <Row>
        <Col md={6}>
          <h1>Синтез метана по реакции Сабатье</h1>
          <p>
            Добро пожаловать в калькулятор синтеза метана по реакции Сабатье!
          </p>
          <Link to={ROUTES.REAGENTS}>
            <Button variant="primary">Посмотреть реагенты</Button>
          </Link>
        </Col>
      </Row>
    </Container>
    </>
  );
};