// FIXED: Explicitly use your live frontend URL domain as the fallback baseline
export const NEXT_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  'https://dj-events-frontend-live.onrender.com';

// This is correct and points to your working Strapi API engine instance
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://dj-events-backend-live.onrender.com';

export const PER_PAGE = 5;
