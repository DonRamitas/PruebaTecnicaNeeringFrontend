export interface Product {
    id: number;
    name: string;
    category: { name: string }; // si el backend lo entrega anidado
    price: number;
    image: string;
  }
  