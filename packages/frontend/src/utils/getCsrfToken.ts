import axios from '../config/apiConfig';

export default async function getCsrfToken() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/auth/csrf`,
      {
        withCredentials: true,
      }
    );
    return response.data.csrfToken as string;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}
