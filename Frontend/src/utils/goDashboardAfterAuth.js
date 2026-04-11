import { requestStoreSplash } from './storeSplashSession';

/** Navigate to the app home and show the post-login splash (single call from all auth flows). */
export function goDashboardAfterAuth(navigate, path = '/home') {
  requestStoreSplash();
  navigate(path);
}
