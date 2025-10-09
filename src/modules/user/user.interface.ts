import { Gender } from "@prisma/client";

export type createPatientInput = {
    name: string;
    email: string;
    password: string;
    contactNumber: string;
    address: string;
    gender: Gender;
    profilePhoto?: string;
} 