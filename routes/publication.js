const express= require("express")
const router= express.Router()
const {pruebaPublication}= require("../controllers/publication")

//definir rutas

router.get("/prueba-publication",pruebaPublication)


//Exportar el router

module.exports=router;