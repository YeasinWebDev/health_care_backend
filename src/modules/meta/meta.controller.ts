import { Request, Response } from "express";
import { MetaService } from "./meta.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { JwtPayload } from "jsonwebtoken";


const fetchDashboardMetaData = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response) => {

    const user = req.user;
    const result = await MetaService.fetchDashboardMetaData(user as JwtPayload);

    sendResponse(res, {
        statusCode:200,
        success: true,
        message: "Meta data retrival successfully!",
        data: result
    })
});

export const MetaController = {
    fetchDashboardMetaData
}