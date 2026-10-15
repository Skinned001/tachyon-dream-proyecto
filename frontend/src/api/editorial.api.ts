import { axiosClient } from './axiosClient';

export const editorialApi = {
  list: () => axiosClient.get('/editorial/convocatorias'),
};
