import axiosInstance from './axiosInstance';

export type WishlistItem = {
  courseId: number;
  course: {
    title: string;
    thumbnailUrl?: string;
    price?: number;
  };
};

export const wishlistApi = {
  getMyList: async (): Promise<WishlistItem[]> => {
    const res = await axiosInstance.get<WishlistItem[]>('/wishlist');
    return res.data;
  },

  add: async (courseId: number): Promise<void> => {
    await axiosInstance.post(`/wishlist/${courseId}`);
  },

  remove: async (courseId: number): Promise<void> => {
    await axiosInstance.delete(`/wishlist/${courseId}`);
  },
};