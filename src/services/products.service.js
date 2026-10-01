import { productsRepository } from '../repositories/products.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';

class ProductsService {
  async getAll(showAll = false) {
    if (showAll) {
      return productsRepository.getAll();
    }

    return productsRepository.getAvailable();
  }

  async getById(id) {
    const product = await productsRepository.getById(id);

    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  async create(productData) {
    const { title, code, price } = productData;

    if (!title || !code || price === undefined) {
      const error = new Error('Faltan campos obligatorios');
      error.statusCode = 400;
      throw error;
    }

    if (price < 0) {
      const error = new Error('Precio inválido');
      error.statusCode = 400;
      throw error;
    }

    const existingProduct =
      await productsRepository.getByCode(code);

    if (existingProduct) {
      const error = new Error('Ya existe un producto con ese código');
      error.statusCode = 400;
      throw error;
    }

    const stock = productData.stock || 0;

    return productsRepository.create({
      ...productData,
      stock,
      status: stock > 0
        ? PRODUCT_STATUS.AVAILABLE
        : PRODUCT_STATUS.OUT_OF_STOCK
    });
  }

  async update(id, productData) {
    if (
      productData.status === 'Out_of_stock' ||
      productData.status === 'OUT_OF_STOCK'
    ) {
      productData.status = PRODUCT_STATUS.OUT_OF_STOCK;
    }

    if (productData.stock !== undefined) {
      productData.status = productData.stock > 0
        ? PRODUCT_STATUS.AVAILABLE
        : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    const product = await productsRepository.update(
      id,
      productData
    );

    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  async delete(id) {
    const product = await productsRepository.delete(id);

    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  async getShippingCost(id) {
    const product = await productsRepository.getById(id);

    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const isProduction = false;

    const shippingCost = isProduction
      ? 50 + product.price * 0.01
      : 10;

    return {
      product: product._id,
      declaredValue: product.price,
      shippingCost
    };
  }
}

export const productsService = new ProductsService();