    import axiosInstance from "./axiosInstance";

    export const dashboardApi = {

        getStats: async () => {
            const res = await axiosInstance.get('/dashboard/stats');
            return res.data;
        },

        getLatestReviews: async () => {
            const res = await axiosInstance.get('/dashboard/latestReviews');
            return res.data;
        },

        getLatestEnrollments: async () => {
            const res = await axiosInstance.get('/dashboard/latestEnrollment');
            return res.data;
        },

        replyToReview: async (reviewId: number, reply: string) => {
            await axiosInstance.post(
                `/dashboard/reply/${reviewId}`,
                JSON.stringify(reply),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        },
        
    }
