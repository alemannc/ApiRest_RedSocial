// importar dependencias
const jwt = require("jwt-simple")
const moment = require ("moment")
const key= "key_redSocial"


//Crear una funcion para  generar tokens
const createToken= (user)=>{
    const payload={
        id:user._id,
        name:user.name,
        surname:user.surname,
        nick:user.nick,
        email:user.email,
        role:user.role,
        image:user.image,
        iat: moment().unix(),
        exp:  moment().add(30,"days").unix()
    }
    // devolver jwt codificado

    return jwt.encode(payload,key)
}

module.exports = {createToken,key};