import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { generateLast12MothsData } from "../utils/analytics.generator";
import CourseModel from "../models/course.model";
import OrderModel from "../models/order.model";


// get users analytics admin
export const getUsersAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await generateLast12MothsData(userModel)
        res.status(200).json({success: true, users})
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
}
)

// get course analytics admin
export const getCoursesAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await generateLast12MothsData(CourseModel)
        res.status(200).json({success: true, course})
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
}
)
// get order analytics admin
export const getOrdersAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await generateLast12MothsData(OrderModel)
        res.status(200).json({success: true, orders})
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
}
)