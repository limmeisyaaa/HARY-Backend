import { Request, Response } from "express";
import PointService from "./point.service";
import { pointPaginationQuerySchema } from "../../validators/point.validator";

const PointController = {
  getPoints: async (req: Request, res: Response) => {
    const customerId = req.auth.id;
    const query = pointPaginationQuerySchema.parse(req.query);

    const result = await PointService.getPoints(customerId, query);

    res.status(200).send({
      data: result.points,
      pagination: {
        pointTotal: result.pointTotal,
        hasNextPage: result.hasNextPage,
        nextCursor: result.nextCursor,
      },
    });
  },
};

export default PointController;
