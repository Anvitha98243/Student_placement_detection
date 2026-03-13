import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
```

Then create a new file called **`.env`** inside the `frontend` folder and paste:
```
REACT_APP_API_URL=https://placeai-backend.onrender.com/api