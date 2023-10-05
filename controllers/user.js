// import dependencias y modelos
const User = require("../models/user");
const bcrypt = require("bcrypt")

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
                message: "El usuario ya existe"
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

const login = (req, res)=>{
    let params = req.body

    

}



module.exports = {
    register,
    login,
};
