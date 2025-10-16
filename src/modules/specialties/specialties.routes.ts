import express, { NextFunction, Request, Response } from 'express';
import { SpecialtiesController } from './specialties.controller';
import { upload } from '../../helper/fileUploder';
import { auth } from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { SpecialtiesValidtaion } from './specialties.validation';


export const specialtiesRoutes = express.Router();


specialtiesRoutes.get(
    '/',
    SpecialtiesController.getAllFromDB
);

specialtiesRoutes.post(
    '/',
    upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = SpecialtiesValidtaion.create.parse(JSON.parse(req.body.data))
        return SpecialtiesController.inserIntoDB(req, res, next)
    }
);

specialtiesRoutes.delete(
    '/:id',
    auth(UserRole.ADMIN, UserRole.ADMIN),
    SpecialtiesController.deleteFromDB
);

