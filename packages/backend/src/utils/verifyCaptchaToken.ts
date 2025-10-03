import axios from "axios";
    
export const verifyCaptchaToken = async (token: string, ip: string) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Store in .env
  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: { secret: secretKey, response: token, remoteip: ip },
    });
    const { success, score, 'error-codes': errorCodes } = response.data;
    if (!success) {
      console.error('CAPTCHA verification failed:', errorCodes); // logging purpose
    }
    return success && score >= 0.5; 
  } catch (err) {
    console.error('CAPTCHA verification error:', err);
    return false;
  }
};