import { Router } from "express";
import AuthController from "../modules/auth/auth.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";
import { imageUploader } from "../middlewares/uploader.middleware";

const authRouter = Router();

//Sign up routes
authRouter.post("/customer/sign-up", imageUploader().single("profilePicture"), AuthController.signUpCustomer);
authRouter.post("/organizer/sign-up", imageUploader().single("profilePicture"), AuthController.signUpOrganizer);

//Sign in routes
authRouter.post("/customer/sign-in", AuthController.signInCustomer);
authRouter.post("/organizer/sign-in", AuthController.signInOrganizer);

//Verify refresh token
authRouter.post("/refresh", AuthController.refreshToken);

// semua rute di bawah ini butuh akses token
authRouter.post("/sign-out", verifyAccessToken, AuthController.signOut);
authRouter.get("/credential", verifyAccessToken, AuthController.getAuthCredential);

export default authRouter;