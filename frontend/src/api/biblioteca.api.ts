import { axiosClient } from './axiosClient';

export const bibliotecaApi = {
  list: () => axiosClient.get('/biblioteca'),
};
