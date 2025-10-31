const isDev = import.meta.env.DEV;

export const API_URL = isDev ? 'http://localhost:8000' : '';

export const API_ENDPOINTS = {
  predict: `${API_URL}/api/predict`
};

