import { Request } from "express";
import { uploadToCloudinary } from "../../helper/fileUploder";
import { prisma } from "../../config/db";

const inserIntoDB = async (req: Request) => {

    const file = req.file;

    if (file) {
        const uploadToCloudinaryt = await uploadToCloudinary(file);
        req.body.icon = uploadToCloudinaryt?.secure_url;
    }

    const result = await prisma.specialties.create({
        data: req.body
    });

    return result;
};

const getAllFromDB = async () => {
    return await prisma.specialties.findMany();
}

const deleteFromDB = async (id: string) => {
    const result = await prisma.specialties.delete({
        where: {
            id,
        },
    });
    return result;
};

export const SpecialtiesService = {
    inserIntoDB,
    getAllFromDB,
    deleteFromDB
}