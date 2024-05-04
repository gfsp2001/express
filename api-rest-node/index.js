const { conexion } = require('./database/conexion');
const express = require('express');
const cors = require('cors');
//Inicializar app
console.log("App de node arrancado");
//conectar a la base de datos
conexion();
//Crear servidor Node // hacer peticiones HTTP, rutas, crear middlewares,crear rutas, etc. 
const app = express();
const puerto = 3900;
//Configurar cors
app.use(cors());
//leer y convertir body a objeto js
app.use(express.json()); // recibir datos con content-type app/json
app.use(express.urlencoded({ extended: true })); // recibir datos por form-urlencoded
//crear rutas
//Rutas
const rutas_articulo = require('./routes/articulo_route');

//Cargo las rutas
app.use("/api", rutas_articulo);

//RUTAS DE PRUEBA hardCodeadas
app.get('/probando', (req, res) => {

    console.log("Se ha ejecutado el endpoint probando");
    return res.status(200).json([{
        data: "esto es un dato",
        autor: "giancarlo santi"
    },
    {
        data: "esto es un dato",
        autor: "giancarlo santi"
    }]);
})

app.get('/', (req, res) => {

    console.log("Se ha ejecutado el endpoint probando");
    return res.status(200).send("<h1>Empezando a crear un api rest con node</h1>");
})

app.get("/pokemones", (req, res) => {

    
    fetch("https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20")
        .then((response) => {
            return response.json();
        }).then((resp) => {
            return res.status(200).send({ data: resp });
        });

});

//crear servidor y escuchar peticiones http
app.listen(puerto, () => {
    console.log("servidor corriendo en el puerto " + puerto);
});

