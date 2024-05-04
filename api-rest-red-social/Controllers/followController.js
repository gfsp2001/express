//importar modelo
const Follow = require('../Models/Follow');
const User = require('../Models/User');
const mongoosePaginate = require('mongoose-pagination');
const followService = require('../helpers/FollowService')
//Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({ message: "mensaje enviado desde el controlador" })
}

//accion de guardar un follow (accion de seguir)
const guardar_follow_user = (req, res) => {

    //conseguir datos por body 
    const params = req.body;
    // sacar id del usuario identificado
    let identity = req.user;
    // crear objeto de con modelo follow
    let userToFollow = new Follow({ user: identity.id, followed: params.followed });
    // guardar objeto en base de datos
    userToFollow.save((error, followStored) => {

        if (error || !followStored) {
            return res.status(500).send({ status: "error", message: "no se ha podido seguir al usuario" })
        }

        return res.status(200).send({ status: "success", identity: req.user, folow: followStored })
    })

}
//accion de borrar un follow (accion de dejar de seguir)
const unfollow_user = (req, res) => {

    //recoger el id del usuario identificado
    let user_id = req.user.id;
    // recoger el id del usuario que sigo y quiero dejar de seguir
    let followed = req.params.id;
    // find de las coincidencias y hacer remove
    Follow.find({
        "user": user_id,
        "followed": followed
    }).remove(async (error, followDeleted) => {
        if (error || !followDeleted) {
            return res.status(500).json({ status: 'error', message: "error en la consulta" });
        }
        return res.status(200).send({ status: "success", message: "follow eliminado correctamente" })
    })
}
//accion listado de usuarios que cualquier usuario esta siguiendo (siguiendo)
const following = (req, res) => {
    // sacar el id del usuario identificado 
    let userId = req.user.id;
    // comprobar si me llega el id por parametro en url
    if (req.params.id) userId = req.params.id;
    // comrpobar si me llega la pagina
    let page = 1;
    if (req.params.page) page = req.params.page;
    // usuarios por pagina quiero mostrar
    const itemsPerPage = 5;
    // find a follow, popular datos de los usuarios y paginar con mongoose paginate
    Follow.find({ user: userId })
        .populate("user followed", "-password -role -__v -email")
        .paginate(page, itemsPerPage, async (error, follows, total) => {

            // listado de usuarios de carlos, y soy un giancarlo
            //sacar un array de ids de los usuarios que me siguen y los que sigo como giancarlo
            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "listado de usuarios que estoy siguiendo",
                follows,
                total,
                page: Math.ceil(total / itemsPerPage),
                following: followUserIds.following,
                followers: followUserIds.followers
            })
        })

}
//accion listado de usuarios que  siguen a cualquier otro usuario (seguido)
const followers = (req, res) => {
    // sacar el id del usuario identificado 
    let userId = req.user.id;
    // comprobar si me llega el id por parametro en url
    if (req.params.id) userId = req.params.id;
    // comrpobar si me llega la pagina
    let page = 1;
    if (req.params.page) page = req.params.page;
    // usuarios por pagina quiero mostrar
    const itemsPerPage = 5;

    Follow.find({ followed: userId })
        .populate("user", "-password -role -__v -email")
        .paginate(page, itemsPerPage, async (error, follows, total) => {

            if (error || !follows || follows.length <= 0) return res.status(404).send({ status: "error", message: "no hay follows" });

            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "listado de usuarios que estoy siguiendo",
                follows,
                total,
                page: Math.ceil(total / itemsPerPage),
                following: followUserIds.following,
                followers: followUserIds.followers
            })
        })

}

module.exports = {
    pruebaFollow,
    guardar_follow_user,
    unfollow_user,
    following,
    followers

}