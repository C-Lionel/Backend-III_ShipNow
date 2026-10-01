import Product from '../models/product.model.js';
import { PRODUCT_STATUS } from '../constants/index.js';

class ProductsRepository {
  async getAll() {
    return Product.find();
  }

  async getAvailable() {
  return Product.find({
    stock: { $gt: 0 },
    status: PRODUCT_STATUS.AVAILABLE
  });
}

  async getById(id) {
    return Product.findById(id);
  }

  async getByCode(code) {
    return Product.findOne({ code });
  }

  async create(productData) {
    return Product.create(productData);
  }

  async update(id, productData) {
    return Product.findByIdAndUpdate(
      id,
      productData,
      { new: true }
    );
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
}

export const productsRepository = new ProductsRepository();