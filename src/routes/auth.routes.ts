import { Router } from "express";
import AuthController from "../modules/auth/auth.controller";

const authRouter = Router();

authRouter.post("/customer/sign-up", AuthController.signUpCustomer);
authRouter.post("/customer/sign-in", AuthController.signInCustomer);
authRouter.post("/organizer/sign-up", AuthController.signUpOrganizer);
authRouter.post("/organizer/sign-in", AuthController.signInOrganizer);

export default authRouter;