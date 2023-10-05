//Acciones de prueba

const pruebaFollow= (req,res)=>{
    return res.status(200).send({
        message:"Mensaje de controlador de pruebaFollow"
    })
}


module.exports={pruebaFollow:pruebaFollow};
