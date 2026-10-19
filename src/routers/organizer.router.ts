import { Router } from "express";
import { verifyAccessToken, userTypeGuard } from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";
import { verifyEmail } from "../middlewares/edit.profile.middleware";
import OrganizerController from "../modules/organizer/organizer.controller";

const organizerRouter = Router();

organizerRouter.use(verifyAccessToken, userTypeGuard("ORGANIZER"));

//edit profile
organizerRouter.patch("/profile", verifyEmail, OrganizerController.updateProfile);

//change profile picture
organizerRouter.patch("/profile-picture", imageUploader().single("profilePicture"), OrganizerController.changeProfilePicture);

//get data customer
organizerRouter.get("/profile", OrganizerController.getPofileData);

//change password
organizerRouter.patch("/password", OrganizerController.changePassword);

export default organizerRouter;