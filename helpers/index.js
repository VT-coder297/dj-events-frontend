import cookie from 'cookie';

export function parseCookies(req) {
  // Use the non-deprecated parseCookie method matching your library version
  return cookie.parseCookie(req ? req.headers.cookie || '' : '');
}
