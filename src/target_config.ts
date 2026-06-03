// const isTauri = Boolean((window as any).__TAURI_INTERNALS__);

// export const GITHUB_PAGES_REPO = "/methane_sabatier_reaction_frontend";
// const API_ORIGIN = "http://127.0.0.1:8080";
// const IMG_ORIGIN = "http://127.0.0.1:9000";

// const destroot = isTauri ? "/" : GITHUB_PAGES_REPO;
// export default API_ORIGIN;

// export { isTauri, destroot };
// export const destapi = API_ORIGIN;
// export const destimg = IMG_ORIGIN;
// export const apiproxyaddr = API_ORIGIN;
// export const imgproxyaddr = IMG_ORIGIN;

const isTauri = Boolean((window as any).__TAURI_INTERNALS__);

export const GITHUB_PAGES_REPO = "/methane_sabatier_reaction_frontend";

const TAURI_API_ORIGIN = "http://192.168.2.238:8080";
const DEV_API_ORIGIN = "http://localhost:8080";

const TAURI_IMG_ORIGIN = "http://192.168.2.238:9000";
const DEV_IMG_ORIGIN = "http://192.168.2.238:9000";

export const destroot = isTauri ? "/" : "/";
export const destapi = isTauri ? TAURI_API_ORIGIN : DEV_API_ORIGIN;
export const destimg = isTauri ? TAURI_IMG_ORIGIN : DEV_IMG_ORIGIN;

export const apiproxyaddr = destapi;
export const imgproxyaddr = destimg;

export default destapi;