const mongoose= require ("mongoose")

const connection = async()=>{
    try {
        console.log("Contectado a bd mi_redSocial")
        await mongoose.connect("mongodb://127.0.0.1:27017/mi_redSocial");
    } catch (error) {
        console.log(error);
        throw new Error("No se pudo conectar a la base de datos")
    }
}

module.exports=connection;