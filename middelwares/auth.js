const jwt = require ("jwt-simple")
const moment = require ("moment")
const libjwt = require("../services/JWT")
const key = libjwt.key



//MIDDELWAR de auth

const auth=(req,res,next)=>{
    
    //Comprobar si me llega la cabecera de auth
    if(!req.headers.authorization){
        return res.status(403).send({
            status:"error",
            message:"La peticion no tiene la cabecera de autenticacion"
        })
    };
    //Limpiar token
    let token= req.headers.authorization.replace(/['"]+/g,'');
    //Decodificar token 
    try {
        let payload= jwt.decode(token,key);
        //Comprobar expiracion del token
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status:"error",
                message:"Token Expirado",
                error:error
            }) 
        }
        // agregar datos de usuario a la request
        req.user=payload;

    } catch (error) {
        return res.status(404).send({
            status:"error",
            message:"Token invalido",
            error:error
        })
    }
    //Seguir ejecutanto la ruta
    next()
}


module.exports= auth;