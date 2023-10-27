const express= require("express")
const router= express.Router()
const middelwar = require("../middelwares/auth")
const publicationController= require("../controllers/publication")
const multer = require ("multer")

//Configuracion de subida de archivos
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./Uploads/publications/")
    },
    filename:(req,file,cb)=>{
        cb(null,"pub-"+Date.now()+"-"+file.originalname)
    }
})
const uploads=multer({storage});
//definir rutas

router.get("/prueba-publication",publicationController.pruebaPublication)
router.post("/save",middelwar,publicationController.save)
router.get("/detail/:id",middelwar,publicationController.detail)
router.delete("/remove/:id",middelwar,publicationController.remove)
router.get("/user/:id/:page?",middelwar,publicationController.user)
router.post("/upload/:id",[middelwar,uploads.single("file0")],publicationController.upload)
router.get("/media/:file",middelwar,publicationController.media)
router.get("/feed/:page?",middelwar,publicationController.feed)





//Exportar el router

module.exports=router;