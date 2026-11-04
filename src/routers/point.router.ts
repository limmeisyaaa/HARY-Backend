import { Router } from "express";
import { verifyAccessToken, userTypeGuard } from "../middlewares/auth.middleware";
import PointController from "../modules/point/point.controller";

const pointRouter = Router();

pointRouter.use(verifyAccessToken, userTypeGuard("CUSTOMER"));

//get points customer
pointRouter.get("/", PointController.getPoints);

export default pointRouter;