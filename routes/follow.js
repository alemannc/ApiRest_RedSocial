const express= require("express")
const router= express.Router()
const {pruebaFollow}= require("../controllers/follow")

//definir rutas

router.get("/prueba-follow",pruebaFollow)


//Exportar el router

module.exports=router;