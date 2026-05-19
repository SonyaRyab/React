import { Api } from './Api';
import { destapi } from "../target_config";

export const getStoredToken = () =>
  sessionStorage.getItem('token') ||
  localStorage.getItem('token') ||
  '';

export const api = new Api({
  baseURL: destapi,
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