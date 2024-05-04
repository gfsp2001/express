//importar modulos
const jwt = require('jwt-simple');
const moment = require('moment');
//importar clave secreta
const libjwt = require('../Helpers/jwt');
const secret = libjwt.secret;
//MIDDLEWARE de autenticacion
exports.auth = (req, res, next) => {

    // comprobar si me llega la cabecera de autenticacion
    if (!req.headers.authorization) {
        return res.status(403).send({ status: 'error', message: 'la peticion no tiene la cabecera de autenticacion' });
    }
    // limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '');
    // decodificar el token
    try {
        let payload = jwt.decode(token, secret);
        // comprobar expericacion del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({ status: 'error', message: 'Token experido' });
        }
        // agrega datos de usuario a request
        req.user = payload;

    } catch (error) {
        return res.status(403).send({ status: 'error', message: 'Token invalido' });
    }

    // pasar a ejecucion de la siguiente accion (pasar a ejecutar el controlador)
    next();
}
