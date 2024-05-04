const validator = require('validator');

const validate = (params) => {

    let name = !validator.isEmpty(params.name) && validator.isLength(params.name, { min: 3, max: undefined }) && validator.isAlpha(params.name, 'es-ES');
    let nick = !validator.isEmpty(params.nick) && validator.isLength(params.nick, { min: 3, max: undefined });
    let email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
    let password = !validator.isEmpty(params.password);

    if (params.surname) {
        let surname = !validator.isEmpty(params.surname) &&
            validator.isLength(params.surname, { min: 3, max: undefined })
        if (!surname) {
            throw new Error('no se ha superado la validación surname.');
        } else {
            console.log("validación superada.");
        }
    }

    if (!name || !nick || !password || !email) {
        console.log(name);
        console.log(nick);
        console.log(password);
        console.log(email);
        throw new Error('no se ha superado la validación.');

    } else {
        console.log("validación superada.");

    }
}

module.exports = validate;

