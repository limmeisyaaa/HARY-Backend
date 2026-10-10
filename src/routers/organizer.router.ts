import { Router } from "express";
import { verifyAccessToken, userTypeGuard } from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";
import { verifyEmail } from "../middlewares/edit.profile.middleware";
import OrganizerController from "../modules/event-organizer/organizer.controller";

const organizerRouter = Router();

organizerRouter.use(verifyAccessToken, userTypeGuard("ORGANIZER"));

//edit profile
organizerRouter.patch("/profile", imageUploader().single("profilePicture"), verifyEmail, OrganizerController.updateProfile);

//get data customer
organizerRouter.get("/profile", imageUploader().single("profilePicture"), OrganizerController.getPofileData);

//change password
organizerRouter.patch("/password", OrganizerController.changePassword);

export default organizerRouter;