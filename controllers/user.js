// import dependencias y modelos
const User = require("../models/user");
const bcrypt = require("bcrypt")
const _ = require('lodash');
const jwt = require("../services/JWT");



const prueba = (req,res)=>{
    return res.status(200).send({
        message:"ruta de prueba",
        Usuario:req.user
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
                usuario:users
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
        const userNullPassword =  _.omit(user.toObject(), 'password');
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
            token:token
            
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "Error al buscar el usuario en la base de datos" });
    }

    // Devolver Token
    // Devolver datos del usuario
}


const profile = async (req,res)=>{
    // Recoger id del endpoint
    const id = req.params.id

    //Consultar el usuario con el id
    try {
        const user = await User.findById(id)
        const userFind =  _.omit(user.toObject(), ['password','role']);

        if(!user) res.status(404).send({message: "El usuario no existe",status:"error",error:error})
        res.status(200).send({status:"succes",User:userFind})

        
    } catch (error) {
        res.status(500).send({
            message: "Ocurrio un error en la solicitud",
            status:"error",
            error:error
           })
    }
}



module.exports = {
    prueba,
    register,
    login,
    profile
};
