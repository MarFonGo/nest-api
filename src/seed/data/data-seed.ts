import * as bcrypt from 'bcryptjs';

interface SeedProduct{
    title: string;
    price: number;
    stock: number;
    info: string;
    tag: string;
    subtag: string;
    images: string[];
    slug: string;
}

interface SeedUser{
    email: string,
    fullName: string,
    password: string,
    roles: string[],

}

interface SeedData{
    users: SeedUser[];
    products: SeedProduct[];
}

export const initialData: SeedData={

    users:[ {
        email: "marlonfontanies@gmail.com",
        fullName: "Marlon",
        password: bcrypt.hashSync('Marlon5', 10),
        roles: ['admin']
    }],
    
    products:[{
        title: "Pechuga de pollo",
        price: 350,
        stock: 10,
        info:"paquete de pechuga de 1kg",
        tag: "comida",
        subtag: "carnicos",
        images: ["pechuga.png"],
        slug:""
    },
    {
        title: "Paquete de perros",
        price: 300,
        stock: 25,
        info:"Paquete de 10 perros",
        tag: "comida",
        subtag: "carnicos",
        images: ["perritos.jpg"],
        slug:""
    },
    {
        title: "Muslo de pollo ",
        price: 200,
        stock: 30,
        info:"Muslos de pollo por libra",
        tag: "comida",
        subtag: "carnicos",
        images: ["muslo.png"],
        slug:""
    },
    {
        title: "Contramuslo de pollo",
        price: 250,
        stock: 20,
        info:"paquete con piezas de pollo de 1kg",
        tag: "comida",
        subtag: "carnicos",
        images: ["contramuslo.png"],
        slug:""
    }]
}