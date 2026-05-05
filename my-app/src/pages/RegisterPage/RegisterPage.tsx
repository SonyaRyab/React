//страница регистрации

import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Container, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { ROUTES } from '../../Routes';
import type { AppDispatch, RootState } from '../../store';
import { registerUserAsync } from '../../slices/userSlice';
import LoadingOverlay from '../../components/LoadingOverlay';

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { error } = useSelector((state: RootState) => state.user);

  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    login: '',
    name: '',
    pass: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.login || !formData.name || !formData.pass) {
      return;
    }

    setSubmitting(true);
    const resultAction = await dispatch(registerUserAsync(formData));
    setSubmitting(false);

    if (registerUserAsync.fulfilled.match(resultAction)) {
      setSuccess('Регистрация выполнена успешно. Теперь можно войти.');
      setTimeout(() => navigate(ROUTES.LOGIN), 1200);
    }
  };

  useEffect(() => {
    setSuccess('');
  }, [formData.login, formData.name, formData.pass, formData.role]);

  return (
    <>
      <Header />
      <LoadingOverlay show={submitting} text="Создание пользователя..." />

      <Container style={{ maxWidth: 520 }}>
        <h2 className="mb-4">Регистрация</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="registerLogin">
            <Form.Label>Логин</Form.Label>
            <Form.Control
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Введите логин"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerName">
            <Form.Label>Имя</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите имя"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerPass">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="pass"
              value={formData.pass}
              onChange={handleChange}
              placeholder="Введите пароль"
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="registerRole">
            <Form.Label>Роль</Form.Label>
            <Form.Select name="role" value={formData.role} onChange={handleChange}>
              <option value="researcher">Исследователь</option>
              <option value="professor">Модератор</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex gap-2">
            <Button type="submit">Зарегистрироваться</Button>
            <Link to={ROUTES.LOGIN}>
              <Button variant="outline-secondary">Ко входу</Button>
            </Link>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default RegisterPage;