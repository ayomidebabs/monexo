import { Router } from 'express';
import { getProduct, getProducts } from '../controllers/products.js';
import { getProductSuggestion } from '../controllers/getProductSuggestions.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', getProducts);
router.get('/product-suggestion', getProductSuggestion);
router.get('/:pId', getProduct);

export default router;
