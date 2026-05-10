import type { Enrollment } from "@/types";
import axiosInstance from "./axiosInstance";

// enrollments.ts
export const enrollmentsApi = {
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const res = await axiosInstance.get("/enrollments/my-courses"); // ← fix this
    return res.data;
  }
};