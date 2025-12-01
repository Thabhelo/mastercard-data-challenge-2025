const isDev = import.meta.env.DEV || false;
const mode = import.meta.env.MODE || 'production';

export const API_URL = isDev ? 'http://localhost:3001' : '';

export const API_ENDPOINTS = {
  predict: `${API_URL}/api/predict`
};

export const CONFIG = {
  isDev,
  mode,
  apiUrl: API_URL
};

