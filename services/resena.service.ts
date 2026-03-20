import { axiosInstance } from './auth.service';

export interface Resena {
  id?: number;
  usuarioId: number;
  calificacion: number;
  comentario: string;
  fechaResena?: Date;
}

export const crearResena = async (resena: Omit<Resena, 'id' | 'fechaResena'>) => {
  const response = await axiosInstance.post('/resenas', resena);
  return response.data;
};

export const obtenerResenas = async () => {
  const response = await axiosInstance.get('/resenas');
  return response.data;
};

export const eliminarResena = async (id: number) => {
  const response = await axiosInstance.delete(`/resenas/${id}`);
  return response.data;
};

export const editarResena = async (id: number, data: Partial<Resena>) => {
  const response = await axiosInstance.put(`/resenas/${id}`, data);
  return response.data;
}; 