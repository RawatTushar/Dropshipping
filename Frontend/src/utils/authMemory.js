/** JWT held in memory only (never localStorage) — sent as Bearer until cookie session works. */
let accessToken = null;

export function setAccessToken(token) {
  accessToken =
    typeof token === 'string' && token.length > 10 ? token : null;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}
