const express= require("express")
const router= express.Router()
const followController= require("../controllers/follow")
const middelwar = require("../middelwares/auth")


//definir rutas

router.get("/prueba-follow",followController.pruebaFollow)
router.post("/save",middelwar,followController.save)
router.delete("/unfollow/:id",middelwar,followController.unfollow)
router.get("/following/:id?/:page?",middelwar,followController.following)
router.get("/prueba-follow",middelwar,followController.follower)




//Exportar el router

module.exports=router;