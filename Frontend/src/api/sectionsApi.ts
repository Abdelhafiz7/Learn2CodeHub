import axios from './axiosInstance';

export const sectionsApi = {
  getByCourse: (courseId: string) =>
    axios.get(`/sections/course/${courseId}`),

  create: (data: any) =>
    axios.post('/sections', data),

  update: (id: number, data: any) =>
    axios.put(`/sections/${id}`, data),

  delete: (id: number) =>
    axios.delete(`/sections/${id}`),

  reorder: (data: { id: number; order: number }[]) =>
  axios.put('/sections/reorder', data),
};