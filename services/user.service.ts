import { NextFunction, Response } from "express";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";

export const getUserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(200).json({
      success: true,
      user,
    });
  }
};

export const getAllUsersService = async (res: Response) => {
  const users = await userModel.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    users,
  });
};

export const updateUserRoleService = async (
  res: Response,
  id: string | undefined,
  role: string,
  email?: string,
  next?: NextFunction,
) => {
  let user = null;

  if (email) {
    user = await userModel.findOneAndUpdate(
      { email },
      { role },
      { new: true },
    );
  } else if (id) {
    user = await userModel.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    );
  }

  if (!user) {
    if (next) {
      return next(new ErrorHandler("User not found", 404));
    }
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Update user session in redis
  await redis.set(user._id.toString(), JSON.stringify(user));

  res.status(200).json({
    success: true,
    user,
  });
};