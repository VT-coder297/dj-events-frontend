import cookie from 'cookie';
import { API_URL } from '@/config/index';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { username, email, password } = req.body;

    // Strapi 5 registration endpoint
    const strapiRes = await fetch(`${API_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await strapiRes.json();

    if (strapiRes.ok) {
      // Modern cookie library syntax: stringifySetCookie
      res.setHeader(
        'Set-Cookie',
        cookie.stringifySetCookie({
          name: 'token',
          value: String(data.jwt),
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          sameSite: 'strict',
          path: '/',
        }),
      );

      res.status(200).json({ user: data.user });
    } else {
      // Modern Strapi 5 error mapping
      const errorMessage = data.error?.message || 'Registration failed';
      const errorStatus = data.error?.status || 400;

      res.status(errorStatus).json({ message: errorMessage });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};
