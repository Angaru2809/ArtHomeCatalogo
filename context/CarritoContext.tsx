import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ProductoCarrito = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  [key: string]: any;
};

type CarritoContextType = {
  carrito: ProductoCarrito[];
  agregarAlCarrito: (producto: ProductoCarrito) => void;
  quitarDelCarrito: (id: number) => void;
  limpiarCarrito: () => void;
};

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);

  const agregarAlCarrito = (producto: ProductoCarrito) => {
    setCarrito((prev) => {
      // Si el producto ya está, suma cantidad
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: (p.cantidad || 1) + 1 } : p
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (id: number) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const limpiarCarrito = () => setCarrito([]);

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, quitarDelCarrito, limpiarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
}; 