const isTauri = Boolean((window as any).__TAURI_INTERNALS__);

export const GITHUB_PAGES_REPO = "/methane_sabatier_reaction_frontend";

const LOCAL_API_ORIGIN = "http://localhost:8080";
const LOCAL_IMG_ORIGIN = "http://localhost:9000";

export const destroot = isTauri ? GITHUB_PAGES_REPO : "/";
export const apiproxyaddr = LOCAL_API_ORIGIN;
export const imgproxyaddr = LOCAL_IMG_ORIGIN;

// export const destapi = isTauri ? apiproxyaddr : "http://192.168.2.238:8080";
export const destapi = LOCAL_API_ORIGIN;
export const destimg = isTauri ? imgproxyaddr : imgproxyaddr;