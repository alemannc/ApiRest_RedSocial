//Importar dependencias
const connection = require("./dataBase/connection");
const express= require("express");
const cors= require("cors");

//Mensaje para comprobar que que arrancamos la api de node
console.log("api node arrancada");

//Ejecutar la conexion 
connection();

//Crear servidor
const app=express();
const puerto=3900;

//Configurar cors(Un midelware)
app.use(cors());

//Convertir los datos del body a json
app.use(express.json());//parsea todo lo del body a json
app.use(express.urlencoded({ extended: true }));//Si llega algun formulario lo pasa a json

//cargar conf de rutas
const userRouter = require ("./routes/user")
const userPublication = require ("./routes/publication")
const userFollow = require ("./routes/follow")

app.use("/api/user",userRouter)
app.use("/api/publication",userPublication)
app.use("/api/follow",userFollow)

//Poner al servidor a escuchar peticiones http

app.listen(puerto,()=>{
    console.log("Servidor corriendo en el puerto :"+puerto) 
});