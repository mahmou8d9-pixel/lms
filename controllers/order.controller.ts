import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.model";
import courseModel from "../models/course.model";
import path from "path";
import ejs, { name } from "ejs";
import sendEmail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { newOrder } from "../services/order.service";
import { getAllCoursesService } from "../services/course.service";
import { redis } from "../utils/redis";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body;
      if (payment_info) {
        if (typeof payment_info === "object" && "id" in payment_info) {
          const paymentIntentId = payment_info.id;
          const paymentIntent =
            await stripe.paymentIntents.retrieve(paymentIntentId);
          if (paymentIntent.status !== "succeeded") {
            return next(new ErrorHandler("Invalid payment info", 500));
          }
        }
      }
      const user = await userModel.findById(req.user?._id);
      const courseExistInUser = user?.courses?.some(
        (course: any) => course.courseId.toString() === courseId,
      );
      if (courseExistInUser) {
        return next(
          new ErrorHandler("you have already purchased this course", 500),
        );
      }
      const course: any = await courseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("course not found", 404));
      }
      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      };

      const mailData = {
        order: {
          _id: String(course._id).slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      try {
        if (user) {
          await sendEmail({
            email: user.email,
            subject: "Order Confirmation",
            template: "order.confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
      user?.courses.push({
        courseId: course._id.toString(),
      });
      await redis.set(String(req.user?._id), JSON.stringify(user));
      await user?.save();
      await NotificationModel.create({
        userId: String(user?._id),
        title: "new order",
        message: `You have successfully purchased ${course?.name}`,
      });
      course.purchased = course.purchased + 1;

      await course.save();
      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all orders admin
export const getAllOrders = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const sendStripePublishableKey = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        publishablekey:
          process.env.STRIPE_PUBLISHABLE_KEY ||
          process.env.STRIPE_PUBLLISHABLE_KEY,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const newPayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "USD",
        metadata: {
          company: "ELearning",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      res.status(201).json({
        success: true,
        clientSecret: myPayment.client_secret,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
