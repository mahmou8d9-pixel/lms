import express, { Request, Response } from "express";
import {
  activateUser,
  deleteUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registrationUser,
  socialAuth,
  updateAccessToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
  updateUserRole,
} from "../controllers/user.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";
const userRoute = express.Router();

userRoute.post("/registration", registrationUser);

userRoute.post("/activate-user", activateUser);

userRoute.post("/login", loginUser);

userRoute.post("/logout", isAuthenticated, logoutUser);

userRoute.get("/refresh", updateAccessToken, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: true,
    accessToken: (req as any).accessToken,
    user: req.user,
  });
});

userRoute.get("/me", updateAccessToken, isAuthenticated, getUserInfo);

userRoute.post("/social-auth", socialAuth);

userRoute.put(
  "/update-user-info",
  updateAccessToken,
  isAuthenticated,
  updateUserInfo,
);

userRoute.put(
  "/update-user-password",
  updateAccessToken,
  isAuthenticated,
  updatePassword,
);

userRoute.put(
  "/update-user-avatar",
  updateAccessToken,
  isAuthenticated,
  updateProfilePicture,
);

userRoute.get(
  "/get-users",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsers,
);

userRoute.put(
  "/update-user",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserRole,
);

userRoute.delete(
  "/delete-user/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUser,
);
export default userRoute;
