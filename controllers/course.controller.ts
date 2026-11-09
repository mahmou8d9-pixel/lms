import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendEmail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import axios from "axios";

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Frontend sends: { data: { name, description, price, ... } }
      // so we must read req.body.data first, then fall back to other shapes
      let data: any = req.body.data || req.body.courseInfo || req.body;

      // Rename courseContentData → courseData to match the Mongoose schema
      if (data.courseContentData && !data.courseData) {
        data.courseData = data.courseContentData;
        delete data.courseContentData;
      }

      // Defaults for computed/optional fields so they never fail required validation
      if (!data.rating) data.rating = 0;
      if (!data.purchased) data.purchased = 0;
      if (!data.level) data.level = "Beginner";
      if (!data.categories) data.categories = "";

      const thumbnail = data.thumbnail;
      if (thumbnail && typeof thumbnail === "string") {
        const result = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Frontend sends { data: { name, description, ... } } so unwrap it
      let data: any = req.body.data || req.body;

      // Rename courseContentData → courseData to match the Mongoose schema
      if (data.courseContentData && !data.courseData) {
        data.courseData = data.courseContentData;
        delete data.courseContentData;
      }

      const thumbnail = data.thumbnail;
      if (thumbnail && typeof thumbnail === "string") {
        // Only destroy old image if it's an existing cloudinary object
        if (data.thumbnail?.public_id) {
          await cloudinary.v2.uploader.destroy(data.thumbnail.public_id);
        }
        const result = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });
        data.thumbnail = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
      const courseId = req.params.id;

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }, // returns the updated document
      );

      // Invalidate Redis caches
      await redis.del(courseId);
      await redis.del("allCourses");

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExist = await redis.get(courseId);
      if (isCacheExist) {
        return res.status(200).json({
          success: true,
          course: JSON.parse(isCacheExist),
        });
      } else {
        const course = await CourseModel.findById(courseId).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
        );
        await redis.set(courseId, JSON.stringify(course), "EX", 604800);
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExist = await redis.get("allCourses");
      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        return res.status(200).json({
          success: true,
          course,
        });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
        );
        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      // }
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;
      const courseExist = userCourseList?.find(
        (course: any) => course.courseId.toString() === courseId,
      );
      if (!courseExist) {
        return next(
          new ErrorHandler("You are not authorized to access this course", 500),
        );
      }
      const course = await CourseModel.findById(courseId);
      const content = course?.courseData;
      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

interface IAddQuestion {
  question: string;
  contentId: string;
  courseId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, contentId, courseId }: IAddQuestion =
        req.body as IAddQuestion;
      const course = await CourseModel.findById(courseId);
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }
      const courseContent = course?.courseData.find(
        (content: any) => content._id.toString() === contentId,
      );
      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 500));
      }
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };
      courseContent.questions.push(newQuestion);
      await NotificationModel.create({
        userId: String(req.user?._id),
        title: "new question received",
        message: `You have anew question in ${courseContent?.title}`,
      });
      await course?.save();
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

interface IAddAnsuwerData {
  answer: string;
  contentId: string;
  courseId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, contentId, courseId, questionId }: IAddAnsuwerData =
        req.body as IAddAnsuwerData;

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const course = await CourseModel.findById(courseId);

      const courseContent = course?.courseData.find(
        (content: any) => content._id.toString() === contentId,
      );
      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const question = courseContent.questions.find(
        (question: any) => question._id.toString() === questionId,
      );
      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      const newAnswer: any = {
        user: req.user,
        answer,
        createAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      question.questionReplies?.push(newAnswer);

      course?.markModified("courseData"); // updata schema inner schema
      await course?.save(); // updata schema

      if (req.user?._id.toString() === question.user._id.toString()) {
        await NotificationModel.create({
          userId: String(req.user?._id),
          title: "new question reply received",
          message: `You have a new question reply in ${courseContent?.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };

        try {
          await sendEmail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question.reply.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

interface IAddReviewData {
  rating: number;
  userId: string;
  review: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;
      const courseExist = userCourseList?.some(
        (course: any) => course.courseId.toString() === courseId.toString(),
      );
      if (!courseExist) {
        return next(
          new ErrorHandler("You are not authorized to access this course", 400),
        );
      }
      const course = await CourseModel.findById(courseId);
      const { rating, review } = req.body as IAddReviewData;

      const newReview: any = {
        user: req.user,
        rating,
        comment: review,
      };
      course?.reviews.push(newReview);
      let avg = 0;
      course?.reviews.forEach((review: any) => {
        avg += review.rating;
      });
      if (course) {
        course.rating = avg / course.reviews.length;
      }
      await course?.save();

      await redis.set(
        courseId,
        JSON.stringify(course),
        "EX",
        60 * 60 * 24 * 30,
      );

      await NotificationModel.create({
        userId: String(req.user?._id),
        title: "new review recived",
        message: `${req.user?.name} added a review to ${course?.name}`,
      });
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;
      const course = await CourseModel.findById(courseId);
      const review = course?.reviews?.find(
        (review: any) => review._id.toString() === reviewId,
      );
      if (!review) {
        return next(new ErrorHandler("Invalid review id", 500));
      }
      const replyData: any = {
        user: req.user,
        comment,
        createdAt: new Date().toISOString(),
      };
      if (!review.commentReplies) {
        review.commentReplies = [];
      }
      review.commentReplies?.push(replyData);

      course?.markModified("reviews");
      await course?.save();
      await redis.set(
        courseId,
        JSON.stringify(course),
        "EX",
        60 * 60 * 24 * 30,
      );
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all courses admin
export const getAllCoursesAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// delete course admin
export const deleteCousre = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const course = await CourseModel.findById(id);
      if (!course) {
        return next(new ErrorHandler("course not found", 500));
      }
      await course.deleteOne();
      await redis.del(id);
      res
        .status(200)
        .json({ success: true, message: "course deleted successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const generateVideoUrl = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.body;
      const response = await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`, // host video (hidden) videos
        { ttl: 60 * 60 * 24 * 30 },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Apisecret ${process.env.VADOCIPHER_API_SECRET || process.env.VIDEO_API_KEY}`,
          },
        },
      );
      res.json(response.data);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
