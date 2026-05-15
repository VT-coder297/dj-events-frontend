import cookie from 'cookie';

export default async (req, res) => {
  if (req.method === 'POST') {
    // Destroy cookie using modern stringifySetCookie syntax
    res.setHeader('Set-Cookie', [
      cookie.stringifySetCookie({
        name: 'token',
        value: '', // Clear the token contents
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 0, // For modern browsers (seconds)
        expires: new Date(0), // Expire the cookie instantly for old legacy browsers (Date object)
        sameSite: 'strict',
        path: '/',
      }),
      cookie.stringifySetCookie({
        name: 'jwtToken',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 0,
        sameSite: 'strict',
        path: '/',
      }),
      cookie.stringifySetCookie({
        name: 'authjs.session-token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 0,
        sameSite: 'strict',
        path: '/',
      }),
    ]);

    res.status(200).json({ message: 'Successfully logged out' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};
