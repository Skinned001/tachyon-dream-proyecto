import { axiosClient } from './axiosClient';

export const articulosApi = {
  list: () => axiosClient.get('/articulos'),
};
