import { Api } from './Api';

export const getStoredToken = () =>
  sessionStorage.getItem('token') ||
  localStorage.getItem('token') ||
  '';

export const api = new Api({
  baseURL: 'http://localhost:8080',
  secure: true,
  securityWorker: () => {
    const token = getStoredToken();

    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  },
});