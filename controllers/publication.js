const Publication = require("../models/publication")
const fs = require("fs")
const path = require("path")
const followService = require("../services/followService")


//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje de controlador de pruebaPublication"
    })
}
//  Guardar publicacion
const save = async (req, res) => {
    try {

        let params = req.body;
        if (!params.text) return res.status(400).send({ status: "error", message: "Debes enviar el texto de la publicacion" })

        //crear y rellenar el modelo 
        let newPublication = await new Publication(params)
        newPublication.user = req.user.id
        let publicationBBDD = await newPublication.save()

        return res.status(200).send({
            status: "Succes",
            message: "Publicacion guardada exitosamente",
            publicationBBDD

        })
    } catch (error) {
        return res.status(500).send({
            message: "No se guardar la publicacion",
            error: error,
        })
    }
}

//Sacar publicacion en concreto
const detail = async (req, res) => {
    try {
        // sacar id de la url
        let id = req.params.id
        //Find de la publ
        const publication = await Publication.findById(id)
        return res.status(200).send({
            status: "Succes",
            message: "Peticion exitosa",
            publication

        })
    } catch (error) {
        return res.status(500).send({
            message: "No se pudo obtener la publicacion",
            error: error,
        })
    }

}



//Eliminar publicacion
const remove = async (req, res) => {
    try {
        // sacar id de la url
        let id = req.params.id
        //Find de la publ
        const publicationDelete = await Publication.deleteOne({ "user": req.user.id, "_id": id })
        return res.status(200).send({
            status: "Succes",
            message: "Peticion exitosa",
            publicationDelete

        })
    } catch (error) {
        return res.status(500).send({
            message: "No se pudo borrar la publicacion",
            error: error,
        })
    }

}

//Listar todas las publicaciones de un usuario

const user = async (req, res) => {
    try {
        //ID del user
        const id = req.params.id
        let page = 1
        if (req.params.page) page = req.params.page
        const itemsPerPage = 5
        let publicationUser = await Publication.find({ "user": id })
        .sort("-create_at")
        .populate("user", "-password -__v -create_at")
        .paginate(page, itemsPerPage)
        if(!publicationUser){
            return res.status(200).send({
                message: "No hay publicaciones para mostrar",
                error: succes,
            })
        }
        return res.status(200).send({
            status: "Succes",
            message: "Peticion exitosa",
            publicationUser,
            page,
            itemsPerPage

        })
    } catch (error) {
        return res.status(500).send({
            message: "Ocurrio un error en la paginacion ",
            error: error,
        })
    }
}

//Subir fichero  
const upload = async (req, res) => {

    try {
        //Recoger el fichero de imagen
        if (!req.file) res.status(404).send({ status: "error", message: "La peticion no incluye imagem" });
        const publicationId= req.params.id
        //Nombre del archivo
        let image = req.file.originalname;

        //Sacar la extencion
        const imgSplit = image.split("\.");
        const extension = imgSplit[1]

        if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
            //Borrar archivo subido
            const filePath = req.file.path;
            const fileDelete = fs.unlinkSync(filePath);
            return res.status(400).send({ status: "error", message: "Extencion del fichero invalida" });
        }
        // Si es correcta guardar la imagen en bbdd
        const publicationUpdate = await Publication.findOneAndUpdate({ "user": req.user.id,"_id":publicationId }, { file: req.file.filename }, { new: true })

        // console.log("id user", req.user.id)
        // console.log("USER", req.user)
        return res.status(200).send({
            message: "Imagen Actualizada",
            Publication: publicationUpdate,
            filePath: req.file,

        })

    } catch (error) {
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);
        res.status(500).send({
            message: "Ocurrió un error en la solicitud",
            status: "error",
            error: error
        });
    }
}


//Devolver archivo multimedia 
const media = (req, res) => {
    // Sacar el parametro de la url 
    const file = req.params.file
    // path de la imagen
    const filePath = "./uploads/publications/" + file;
    // comprobar que exista el path
    fs.stat(filePath, (error, exists) => {
        if (!exists) return res.status(404).send({ status: "error", message: "No existe la imagen" });
    })

    //Devolver file
    return res.sendFile(path.resolve(filePath))
}

//feed de publicaciones
const feed =async (req,res)=>{
    try {
        let page = 1;
        if(req.params.page) page=req.params.page;
    
        let itemsPerPage=5;
    
        const myFollows = await followService.followUsersId(req.user.id);
        const publications= await Publication.find({
            user:myFollows.followingClean
        }).populate("user", "-password -__v -email -role").sort("-create_at").paginate(page,itemsPerPage);
        return res.status(200).send({
            message: "Feed actualizado",
            following: myFollows.followingClean,
            publication: publications
        })
    } catch (error) {
        res.status(500).send({
            message: "No se pudo actualizar el feed en este momento",
            status: "error",
            error: error,
            page,
            itemsPerPage
        });
    }
};

module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
};
