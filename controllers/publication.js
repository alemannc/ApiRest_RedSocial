//Acciones de prueba

const pruebaPublication= (req,res)=>{
    return res.status(200).send({
        message:"Mensaje de controlador de pruebaPublication"
    })
}


module.exports={pruebaPublication:pruebaPublication};
