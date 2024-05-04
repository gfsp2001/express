
// importar dependencias 
const connection = require('./database/connection');
const express = require('express');
const cors = require('cors');
// conexion a ddbb
connection();
// crear servidor node
const app = express();
const puerto = 3900;
// configurar cors
app.use(cors());
// convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cargar conf rutas
const follow_route = require('./Routes/follow_route');
const publication_route = require('./Routes/publication_route');
const user_route = require('./Routes/user_route');

app.use('/api/follow', follow_route);
app.use('/api/publication', publication_route);
app.use('/api/user', user_route);
// poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Sevidor is running...");
    console.log("port: " + puerto);;
});