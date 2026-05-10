import axios from './axiosInstance';

export const lessonsApi = {
  getBySection: (sectionId: number) =>
    axios.get(`/lessons/section/${sectionId}`),

  create: (data: any) =>
    axios.post('/lessons', data),

  update: (id: number, data: any) =>
    axios.put(`/lessons/${id}`, data),

  delete: (id: number) =>
    axios.delete(`/lessons/${id}`),
};