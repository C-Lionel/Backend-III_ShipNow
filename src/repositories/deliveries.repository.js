
import Delivery from "../models/delivery.model.js";

class DeliveriesRepository {
  async findAll() {
    return Delivery.find()
      .populate("order")
      .populate("driver", "firstName lastName email role");
  }

  async findById(id) {
    return Delivery.findById(id)
      .populate("order")
      .populate("driver", "firstName lastName email role");
  }

  async findByOrder(orderId) {
    return Delivery.findOne({ order: orderId });
  }

  async create(deliveryData) {
    return Delivery.create(deliveryData);
  }

  async update(id, deliveryData) {
    return Delivery.findByIdAndUpdate(id, deliveryData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return Delivery.findByIdAndDelete(id);
  }
}

export default new DeliveriesRepository();
