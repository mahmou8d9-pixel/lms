import express from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCousre,
  editCourse,
  generateVideoUrl,
  getAllCourses,
  getAllCoursesAdmin,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/course.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { updateAccessToken } from "../controllers/user.controller";
const courseRoute = express.Router();

courseRoute.post(
  "/create-course",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse,
);

courseRoute.put(
  "/edit-course/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  editCourse,
);

courseRoute.get("/get-course/:id", getSingleCourse);

courseRoute.get("/get-courses", getAllCourses);

courseRoute.get(
  "/get-course-content/:id",
  updateAccessToken,
  isAuthenticated,
  getCourseByUser,
);

courseRoute.put(
  "/add-question",
  updateAccessToken,
  isAuthenticated,
  addQuestion,
);

courseRoute.put("/add-answer", updateAccessToken, isAuthenticated, addAnswer);

courseRoute.put("/add-review", updateAccessToken, isAuthenticated, addReview);
//
courseRoute.put(
  "/add-review/:id",
  updateAccessToken,
  isAuthenticated,
  addReview,
);
courseRoute.put(
  "/add-reply",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  addReplyToReview,
);

courseRoute.get(
  "/get-admin-courses",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  getAllCoursesAdmin,
);

courseRoute.post("/getVdoCipherOPT", generateVideoUrl);
courseRoute.delete(
  "/delete-course/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCousre,
);

export default courseRoute;
