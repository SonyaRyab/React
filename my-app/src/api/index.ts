import { Api } from './Api';

export const api = new Api({
  baseURL: 'http://localhost:8080',
  securityWorker: () => {
    const token = localStorage.getItem("token");
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  },
});