// import dependencias y modelos
const User = require("../models/user");
const bcrypt = require("bcrypt")
const _ = require('lodash');
const jwt = require("../services/JWT");
const fs = require("fs")
const moongosePaginate = require("mongoose-pagination")
const path = require("path")
const followService = require("../services/followService")


const prueba = (req, res) => {
    return res.status(200).send({
        message: "ruta de prueba",
        Usuario: req.user
    })
}

//Registro de usuarios 
const register = async (req, res) => {
    //recoger datos de la peticion
    let params = req.body;


    //Comprobar que me llegan los datos y validarlos
    if (!params.name || !params.email || !params.password || !params.nick) {

        return res.status(400).json({
            message: "Faltan parametros",
            params
        })

    }
    try {
        //Cifrar contraseña
        const hashedPassword = (await bcrypt.hash(params.password, 10));
        console.log(hashedPassword)

        params.password = hashedPassword;
        //Crear objeto usuario
        let userToSave = new User(params);


        //Control de usuarios duplicados
        const users = await User.find({ $or: [{ email: userToSave.email.toLowerCase() }, { nick: userToSave.nick.toLowerCase() }] })

        if (users && users.length > 0) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
                usuario: users
            });
        }

        //Guardar el nuevo usuario en la base de datos 
        try {
            const userStored = await userToSave.save();
            return res.status(200).send({
                status: "success",
                message: "Usuario registrado",
                user: userStored
            });
        } catch (saveError) {
            return res.status(500).send({ status: "error", message: "Error al guardar el usuario" });
        }

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error en la consulta al servidor" });
    }



}

const login = async (req, res) => {
    // Recoger parametros del body
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({ status: "error", message: "Faltan datos por enviar" });
    }

    try {
        // Buscar el usuario por email
        const user = await User.findOne({ email: params.email.toLowerCase() });
        if (!user) {
            return res.status(400).send({ status: "error", message: "No se encontró el usuario en la base de datos" });
        }
        const userNullPassword = _.omit(user.toObject(), 'password');
        // Comparar la contraseña proporcionada con la contraseña almacenada
        const passwordMatch = await bcrypt.compare(params.password, user.password);

        if (!passwordMatch) {
            return res.status(400).send({ status: "error", message: "Contraseña incorrecta" });
        }
        const token = jwt.createToken(user)
        // Si las credenciales son correctas, puedes devolver el usuario
        return res.status(200).send({
            status: "success",
            message: "Te has identificado correctamente",
            userNullPassword,
            token: token

        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "Error al buscar el usuario en la base de datos" });
    }

    // Devolver Token
    // Devolver datos del usuario
}


const profile = async (req, res) => {
    // Recoger id del endpoint
    const id = req.params.id

    //Consultar el usuario con el id
    try {
        const user = await User.findById(id)
        const userFind = _.omit(user.toObject(), ['password', 'role']);

        if (!user) res.status(404).send({ message: "El usuario no existe", status: "error", error: error })

        const followInfo = await followService.followThisUser(req.user.id, id)
        res.status(200).send({
            status: "succes",
            User: userFind,
            user_following: followInfo.following,
            user_follow_me: followInfo.followers
        })
    } catch (error) {
        res.status(500).send({
            message: "Ocurrio un error en la solicitud",
            status: "error",
            error: error
        })
    }
}

const list = async (req, res) => {
    // Controlar en qué página estamos
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);

    // Cantidad de elementos por página
    let itemsPerPage = 5;

    // Calcular el valor de "skip" para la paginación
    const skip = (page - 1) * itemsPerPage;

    try {
        const users = await User.find()
            .sort("_id")
            .skip(skip)
            .limit(itemsPerPage)
            .exec();

        const total = await User.countDocuments();
        const followInfo = await followService.followUsersId(req.user.id)
        res.status(200).send({
            status: "success",
            users: users,
            page: page,
            itemsPerPage: itemsPerPage,
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            userFollowing:followUserId.followingClean,
            userFollowers:followUserId.followersClean,
        });
    } catch (error) {
        res.status(500).send({
            message: "Ocurrió un error en la solicitud",
            status: "error",
            error: error
        });
    }
}

const update = async (req, res) => {
    try {
        // Recoger info del usuario para actualizar
        let userToken = req.user;
        let userToUpdate = req.body;
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        // Comprobar si el user ya existe
        const users = await User.find({ $or: [{ email: userToUpdate.email.toLowerCase() }, { nick: userToUpdate.nick.toLowerCase() }] });
        let flag = false;
        users.forEach(user => { if (user && user._id != userToken.id) flag = true });
        if (flag) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
            });
        }
        if (userToUpdate.password) {
            userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10);
        }

        // Buscar y actualizar
        console.log(userToken)
        let updateUser = await User.findByIdAndUpdate(userToken.id, userToUpdate, { new: true });
        console.log(updateUser)
        // Enviar la respuesta después de la actualización
        res.status(200).send({ status: "success", message: "Metodo de actualizar usuario", user: updateUser });
    } catch (error) {
        res.status(500).send({
            message: "Ocurrió un error en la solicitud",
            status: "error",
            error: error
        });
    }
}



const upload = async (req, res) => {

    try {
        //Recoger el fichero de imagen
        if (!req.file) res.status(404).send({ status: "error", message: "La peticion no incluye imagem" });

        //Nombre del archivo
        let image = req.file.originalname;

        //Sacar la extencion
        const imgSplit = image.split("\.");
        const extension = imgSplit[1]

        if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
            //Borrar archivo subido
            const filePath = req.file.path;
            const fileDelete = fs.unlinkSync(filePath);
            return res.status(400).send({ status: "error", message: "Extencion del fichero invalida" });
        }
        // Si es correcta guardar la imagen en bbdd
        const UserImageUpdate = await User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })

        // console.log("id user", req.user.id)
        // console.log("USER", req.user)
        return res.status(200).send({
            message: "Imagen Actualizada",
            Usuario: UserImageUpdate,
            filePath: req.file,

        })

    } catch (error) {
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);
        res.status(500).send({
            message: "Ocurrió un error en la solicitud",
            status: "error",
            error: error
        });
    }
}

const avatar = (req, res) => {
    // Sacar el parametro de la url 
    const file = req.params.file
    // path de la imagen
    const filePath = "./uploads/avatars/" + file;
    // comprobar que exista el path
    fs.stat(filePath, (error, exists) => {
        if (!exists) return res.status(404).send({ status: "error", message: "No existe la imagen" });
    })

    //Devolver file
    return res.sendFile(path.resolve(filePath))
}
module.exports = {
    prueba,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
};
