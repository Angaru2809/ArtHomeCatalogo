import axios from 'axios';

const API_URL = 'http://localhost:4000/api/resenas';

export interface Resena {
  id?: number;
  usuarioId: number;
  calificacion: number;
  comentario: string;
  fechaResena?: Date;
}

export const crearResena = async (resena: Omit<Resena, 'id' | 'fechaResena'>) => {
  const response = await axios.post(API_URL, resena);
  return response.data;
};

export const obtenerResenas = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const eliminarResena = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const editarResena = async (id: number, data: Partial<Resena>) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
}; 