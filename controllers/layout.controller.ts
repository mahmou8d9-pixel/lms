import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const isTypeExist = await LayoutModel.findOne({ type });
      if (isTypeExist) {
        return next(new ErrorHandler(`${type} Layout already exist`, 500));
      }
      if (type === "Banner") {
        const { image, title, subtitle } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });
        await LayoutModel.create({
          type: "Banner",
          banner: {
            image: {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            },
            title: String(title),
            subtitle: String(subtitle),
          },
        });
      }
      if (type === "FAQ") {
        const faq = req.body.faq || req.body.feq;
        const faqItems = faq.map((item: any) => {
          return {
            question: String(item.question),
            answer: String(item.answer),
          };
        });
        await LayoutModel.create({ type: "FAQ", faq: faqItems });
      }
      if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItems = categories.map((item: any) => {
          return {
            title: String(item.title),
          };
        });
        await LayoutModel.create({
          type: "Categories",
          categories: categoriesItems,
        });
      }
      res.status(200).json({
        success: true,
        message: "Layout created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// edit layout
export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      if (type === "Banner") {
        const bannerDate: any = await LayoutModel.findOne({ type: "Banner" });
        const { image, title, subtitle } = req.body;

        let bannerImage = bannerDate?.banner?.image;

        if (image) {
          if (!image.startsWith("http")) {
            // if updata image base64 string new else URL
            if (bannerDate?.banner?.image?.public_id) {
              await cloudinary.v2.uploader.destroy(
                bannerDate.banner.image.public_id,
              );
            }
            const myCloud = await cloudinary.v2.uploader.upload(image, {
              folder: "layout",
            });
            bannerImage = {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            };
          }
        }

        const bannerData = {
          type: "Banner",
          banner: {
            image: bannerImage,
            title: String(title),
            subtitle: String(subtitle),
          },
        };

        if (bannerDate) {
          await LayoutModel.findByIdAndUpdate(bannerDate._id, bannerData);
        } else {
          await LayoutModel.create(bannerData);
        }
      }
      if (type === "FAQ") {
        const faq = req.body.faq || req.body.feq;
        const FaqItems = await LayoutModel.findOne({ type: "FAQ" });
        const faqItems = faq.map((item: any) => {
          return {
            question: String(item.question),
            answer: String(item.answer),
          };
        });

        if (FaqItems) {
          await LayoutModel.findByIdAndUpdate(FaqItems._id, {
            type: "FAQ",
            faq: faqItems,
          });
        } else {
          await LayoutModel.create({
            type: "FAQ",
            faq: faqItems,
          });
        }
      }
      if (type === "Categories") {
        const { categories } = req.body;
        const categoryDate = await LayoutModel.findOne({ type: "Categories" });
        const categoriesItems = categories.map((item: any) => {
          return {
            title: String(item.title),
          };
        });

        if (categoryDate) {
          await LayoutModel.findByIdAndUpdate(categoryDate._id, {
            type: "Categories",
            categories: categoriesItems,
          });
        } else {
          await LayoutModel.create({
            type: "Categories",
            categories: categoriesItems,
          });
        }
      }
      res.status(200).json({
        success: true,
        message: "Layout updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get layout
export const getLayoutByType = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      const layout = await LayoutModel.findOne({ type });
      res.status(200).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
