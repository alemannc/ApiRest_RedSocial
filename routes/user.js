const express= require("express")
const router= express.Router()
const userController= require("../controllers/user")
const multer = require ("multer")
const middelwar = require("../middelwares/auth")

//Configuracion de subida de archivos
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./Uploads/Avatars/")
    },
    filename:(req,file,cb)=>{
        cb(null,"avatar-"+Date.now()+"-"+file.originalname)
    }
})

const uploads=multer({storage});

//definir rutas

router.get("/prueba-user",middelwar,userController.prueba)
router.post("/register",userController.register)
router.post("/login",userController.login)
router.get("/profile/:id",middelwar,userController.profile)
router.get("/list/:page?",middelwar,userController.list)
router.put("/update",middelwar,userController.update)
router.post("/upload",[middelwar,uploads.single("file0")],userController.upload)



//Exportar el router

module.exports=router;