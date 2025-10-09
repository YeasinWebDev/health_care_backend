import z from "zod";

export const createZodPatientSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.email({ message: "Email is required" }),
  password: z.string().nonempty({ message: "Password is required" }),
  address: z.string().nonempty({ message: "Address is required" }),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
});
