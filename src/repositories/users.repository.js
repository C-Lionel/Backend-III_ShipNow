import User from "../models/user.model.js";

class UsersRepository {
  async findAll() {
    return User.find().select("-password");
  }

  async findById(id) {
    return User.findById(id).select("-password");
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(user) {
    return User.create(user);
  }

  async update(id, updatedUser) {
    return User.findByIdAndUpdate(
      id,
      updatedUser,
      { new: true }
    ).select("-password");
  }

  async delete(id) {
    return User.findByIdAndDelete(id).select("-password");
  }
}

export default new UsersRepository();