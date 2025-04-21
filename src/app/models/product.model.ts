export interface Product {
    id: number;
    name: string;
    category: {id:number, name: string }; // si el backend lo entrega anidado
    price: number;
    description: string;
    image: string;
  }
  