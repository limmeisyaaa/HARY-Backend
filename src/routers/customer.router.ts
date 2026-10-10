import { Router } from "express";
import { verifyAccessToken, userTypeGuard } from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";
import CustomerController from "../modules/customer/customer.controller";
import { verifyEmail } from "../middlewares/edit.profile.middleware";

const customerRouter = Router();

customerRouter.use(verifyAccessToken, userTypeGuard("CUSTOMER"));

//edit profile
customerRouter.patch("/profile", imageUploader().single("profilePicture"), verifyEmail, CustomerController.updateProfile);

//get data customer
customerRouter.get("/profile", imageUploader().single("profilePicture"), CustomerController.getPofileData);

//change password
customerRouter.patch("/password", CustomerController.changePassword);

export default customerRouter;