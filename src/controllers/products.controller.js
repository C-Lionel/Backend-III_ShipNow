import { productsService } from '../services/products.service.js';

class ProductsController {
  async getAll(req, res) {
    try {
      const showAll = req.query.all === 'true';
      const products = await productsService.getAll(showAll);

      res.json(products);
    } catch (error) {
      res.status(error.statusCode || 500).send(
        error.message || 'Error del servidor'
      );
    }
  }

  async getById(req, res) {
    try {
      const product = await productsService.getById(req.params.id);

      res.json(product);
    } catch (error) {
      res.status(error.statusCode || 500).send(
        error.message || 'Error del servidor'
      );
    }
  }

  async create(req, res) {
    try {
      const product = await productsService.create(req.body);

      res.status(201).json(product);
    } catch (error) {
      res.status(error.statusCode || 500).send(
        error.message || 'Error del servidor'
      );
    }
  }

  async update(req, res) {
    try {
      const product = await productsService.update(
        req.params.id,
        req.body
      );

      res.json(product);
    } catch (error) {
      res.status(error.statusCode || 500).send(
        error.message || 'Error del servidor'
      );
    }
  }

  async delete(req, res) {
    try {
      await productsService.delete(req.params.id);

      res.json({
        message: 'Producto eliminado'
      });
    } catch (error) {
      res.status(error.statusCode || 500).send(
        error.message || 'Error del servidor'
      );
    }
  }

  async getShippingCost(req, res) {
  try {
    const result = await productsService.getShippingCost(
      req.params.id
    );

    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).send(
      error.message || 'Error del servidor'
    );
  }
}
}

export const productsController = new ProductsController();