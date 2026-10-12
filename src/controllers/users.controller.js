import usersService from "../services/users.service.js";

class UsersController {
  async findAll(req, res, next) {
    try {
      const users = await usersService.findAll();

      return res.status(200).json({
        status: "success",
        payload: users
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const user = await usersService.findById(req.params.id);

      return res.status(200).json({
        status: "success",
        payload: user
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await usersService.create(req.body);

      return res.status(201).json({
        status: "success",
        payload: user
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedUser = await usersService.update(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        status: "success",
        payload: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deletedUser = await usersService.delete(req.params.id);

      return res.status(200).json({
        status: "success",
        payload: deletedUser
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();