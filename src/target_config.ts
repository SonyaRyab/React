
const isTauri = Boolean((window as any).__TAURI_INTERNALS__);

export const GITHUB_PAGES_REPO = "/methane_sabatier_reaction_frontend/";
export const LOCAL_BACKEND_IP = "192.168.2.238";
export const API_PORT = "8080";
export const IMG_PORT = "9000";

export const destroot = isTauri ? "/" : GITHUB_PAGES_REPO;

export const apiproxyaddr = `http://${LOCAL_BACKEND_IP}:${API_PORT}`;
export const imgproxyaddr = `http://${LOCAL_BACKEND_IP}:${IMG_PORT}`;

export const destapi = isTauri ? apiproxyaddr : "/api";
export const destimg = isTauri ? imgproxyaddr : "/img-proxy";