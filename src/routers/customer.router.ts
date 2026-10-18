import { Router } from "express";
import { verifyAccessToken, userTypeGuard } from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";
import CustomerController from "../modules/customer/customer.controller";
import { verifyEmail } from "../middlewares/edit.profile.middleware";

const customerRouter = Router();

customerRouter.use(verifyAccessToken, userTypeGuard("CUSTOMER"));

//edit profile
customerRouter.patch("/profile", verifyEmail, CustomerController.updateProfile);

//change profile picture
customerRouter.patch("/profile-picture", imageUploader().single("profilePicture"), CustomerController.changeProfilePicture);

//get data customer
customerRouter.get("/profile", CustomerController.getPofileData);

//change password
customerRouter.patch("/password", CustomerController.changePassword);

export default customerRouter;