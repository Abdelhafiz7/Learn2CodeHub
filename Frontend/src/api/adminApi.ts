import axiosInstance from "./axiosInstance";

export const adminApi = {

    getStats: async () => {
        const res = await axiosInstance.get('/dashboard/admin/stats');
        return res.data;
    },

    getUsers: async (params: { page: number; pageSize: number; search?: string }) => {
        const res = await axiosInstance.get('/dashboard/admin/users', { params });
        return res.data;
    },

    getCourses: async (params: { page: number; pageSize: number }) => {
        const res = await axiosInstance.get('/dashboard/admin/courses', { params });
        return res.data;
    },

    getAnalytics: async () => {
        const res = await axiosInstance.get('/dashboard/admin/analytics');
        return res.data;
    },

    getTopCourses: async () => {
        const res = await axiosInstance.get('/dashboard/admin/top-courses');
        return res.data;
    },

    getLowCourses: async () => {
        const res = await axiosInstance.get('/dashboard/admin/low-courses');
        return res.data;
    },

    getTopInstructors: async () => {
        const res = await axiosInstance.get('/dashboard/admin/top-instructors');
        return res.data;
    },

    getActivityFeed: async () => {
        const res = await axiosInstance.get('/dashboard/admin/activity');
        return res.data;
    },

    updateUserRole: async (id: number, role: string) => {
        const res = await axiosInstance.put(
            `/dashboard/admin/users/${id}/role`,
            JSON.stringify(role),
            { headers: { 'Content-Type': 'application/json' } }
        );
        return res.data;
    },

    toggleUserStatus: async (id: number) => {
        const res = await axiosInstance.patch(`/dashboard/admin/users/${id}/status`);
        return res.data;
    },

    deleteUser: async (id: number) => {
        const res = await axiosInstance.delete(`/dashboard/admin/users/${id}`);
        return res.data;
    },

    submitForReview: async (id: number): Promise<{ status: string; isPublished: boolean }> => {
        const response = await axiosInstance.patch(`/courses/${id}/publish`);
        return response.data;
    },

    approveCourse: async (id: number): Promise<void> => {
        await axiosInstance.patch(`/courses/${id}/approve`);
    },

    rejectCourse: async (id: number, reason: string): Promise<void> => {
        await axiosInstance.patch(`/courses/${id}/reject`, JSON.stringify(reason), {
            headers: { 'Content-Type': 'application/json' },
        });
    },

    getPendingCourses: async () => {
        const res = await axiosInstance.get('/dashboard/admin/pending-courses');
        return res.data;
    },

    previewCourse: async (id: number) => {
        const res = await axiosInstance.get(`/courses/${id}/admin-preview`);
        return res.data;
    },

};