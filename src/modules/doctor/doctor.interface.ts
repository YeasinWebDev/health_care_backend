import { Gender } from "@prisma/client";

export interface IDoctorUpdateInput{
    email: string;
    contactNumber: string | null;
    address: string;
    registrationNumber: string;
    experience: number;
    gender: Gender;
    appointmentFee: number;
    qualification: string;
    currentWorkPlace: string;
    designation: string;
    isDeleted: boolean;
    specialties: string[];
    doctorSchedules: any[];
    review: any[];
}