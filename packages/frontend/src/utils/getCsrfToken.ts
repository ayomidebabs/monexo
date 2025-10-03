import axios from "../config/apiConfig"

export default async function getCsrfToken() {
  try {
    const response = await axios.get('http://localhost:5000/auth/csrf', {
      withCredentials: true,
    });
    return response.data.csrfToken as string;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}
