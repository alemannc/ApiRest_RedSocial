//Acciones de prueba
const Follow = require("../models/follow")
const User = require("../models/user")
const moongosePaginate = require ("mongoose-pagination")
const followService = require("../services/followService")

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje de controlador de pruebaFollow"
    })
}


//Guardar follow (seguir)

const save = async (req, res) => {
    try {
        // recoger datos del body
        const paramas = req.body;

        //id del user identificado
        const identity = req.user.id

        //Crear objeto con modelo follow
        let userToFollow = new Follow({
            user: identity,
            followed: paramas.followed
        })
        //Guardar objeto creado
        let userBBDD = await userToFollow.save()
        return res.status(200).send({
            message: "Seguimiento completado",
            user: req.user,
            userFollow: userBBDD
        })
    } catch (error) {
        return res.status(500).send({
            message: "No se ha podido seguir al usuario",
            error: error,
        })

    }
}

//Borrar follow (dejar de seguir)
const unfollow = async (req, res) => {
    // id del usuario identificado
    const userId = req.user.id;
    //id del usuario al que dejar de seguir
    const followedId = req.params.id;
    //find de coincidencias y hacer remove
    try {
        const result = await Follow.deleteOne({
            "user": userId,
            "followed": followedId
        });

        if (result.deletedCount === 0) {
            return res.status(500).send({
                message: "No se ha dejado de seguir a nadie",
                error: null,
            });
        }

        return res.status(200).send({
            message: "Has dejado de seguir exitosamente",
            user: req.user,
            unfollow: result
        });
    } catch (error) {
        return res.status(500).send({
            message: "Ocurrió un error en la solicitud",
            status: "error",
            error: error
        });
    }
}

//Listado de usuarios a los que sigo
const following =async (req, res) => {

        // id del user identificado
        let userId = req.user.id;
        console.log(req.user.id, "USEEER")
        //comprobar id por la url
        if (req.params.id) userId = req.params.id;
        //comprobar si llega la pagina por la url
        let page = 1;
        if (req.params.page) page = parseInt(req.params.page);
        //usuarios por pagina que quiero mostrar
        itemsPerPage = 5;
        //Find a follow 
        try {
            const follows = await Follow.find({ user: userId }).populate("user followed", "-password -role -__v").paginate(page,itemsPerPage).exec();
            let followUserId= await followService.followUsersId(req.user.id)
            
            return res.status(200).send({
              message: "Listado de usuarios que estás siguiendo",
              follows,
              page,
              itemsPerPage,
              userFollowing:followUserId.followingClean,
              userFollowers:followUserId.followersClean,
            });
          } catch (error) {
            return res.status(500).send({
              message: "Error al obtener la lista de seguidores",
              error: error,
            });
          }
   
}

//Listado de usuarios que me siguen
const follower = (req, res) => {

}


module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    follower
};
