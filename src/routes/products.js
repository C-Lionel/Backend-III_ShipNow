import { Router } from 'express';
import { productsController } from '../controllers/products.controller.js';

const router = Router();

router.get('/', (req, res) => {
  productsController.getAll(req, res);
});

router.get('/:id/shipping-cost', (req, res) => {
  productsController.getShippingCost(req, res);
});

router.get('/:id', (req, res) => {
  productsController.getById(req, res);
});

router.post('/', (req, res) => {
  productsController.create(req, res);
});

router.put('/:id', (req, res) => {
  productsController.update(req, res);
});

router.delete('/:id', (req, res) => {
  productsController.delete(req, res);
});

export default router;