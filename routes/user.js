const express= require("express")
const router= express.Router()
const userController= require("../controllers/user")
const middelwar = require("../middelwares/auth")

//definir rutas

router.get("/prueba-user",middelwar,userController.prueba)
router.post("/register",userController.register)
router.post("/login",userController.login)
router.get("/profile/:id",middelwar,userController.profile)
router.get("/list/:page?",middelwar,userController.list)



//Exportar el router

module.exports=router;