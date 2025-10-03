import express from 'express';
import { getProduct, getProducts } from '../controllers/products.js';
import { getProductSuggestion } from '../controllers/getProductSuggestions.js';

const router = express.Router();
router.get('/', getProducts);
router.get('/product-suggestion', getProductSuggestion);
router.get('/:pId', getProduct);

export default router;
