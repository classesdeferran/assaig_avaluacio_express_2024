// Carga de los módulos
const express = require('express')
const app = express()

// Módulo parar las rutas
const path = require('node:path')

// Obtener el numero del puerto
process.loadEnvFile()
const PORT = process.env.PORT
// console.log(PORT);



// Cargar los datos
const datos = require('../data/customers.json')
// console.log(datos);
// Ordenar por apellido del cliente (descendente A->Z)
datos.sort((a, b) => a.surname.localeCompare(b.surname, "es-ES"))
// console.log(datos);


// Indicar la ruta de los ficheros estáticos
app.use(express.static(path.join(__dirname, "../public")))

// Ruta Home = Raíz
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

// Ruta API Global
app.get("/api", (req, res) => {
    res.json(datos)
})

// Ruta para filtrar los clientes por el apellido
app.get("/api/apellido/:cliente_apellido" , (req, res) => {
    const apellido = req.params.cliente_apellido.toLocaleLowerCase()
    const filtroClientes = datos.filter(cliente => cliente.surname.toLocaleLowerCase() == apellido)
    // console.log(filtroClientes);
    if (filtroClientes.length == 0) {
        return res.status(404).send("Cliente no encontrado")
    }
    res.json(filtroClientes)
})

// Ruta para filtrar por nombre y apellido: api/nombre_apellido/John/Bezzos
app.get("/api/nombre_apellido/:cliente_nombre/:cliente_apellido" , (req, res) => {
    const apellido = req.params.cliente_apellido.toLocaleLowerCase()
    const nombre = req.params.cliente_nombre.toLocaleLowerCase()
    const filtroClientes = datos.filter(cliente => cliente.surname.toLocaleLowerCase() == apellido && cliente.name.toLocaleLowerCase() == nombre)
    // console.log(filtroClientes);
    if (filtroClientes.length == 0) {
        return res.status(404).send("Cliente no encontrado")
    }
    res.json(filtroClientes)
})

// Ruta para filtrar por nombre y por las primeras letras del apellido:
// api/nombre/Barbara?apellido=Jo
app.get("/api/nombre/:nombre", (req, res) => {
    const nombre = req.params.nombre.toLocaleLowerCase()
    const apellido = req.query.apellido
    // Si no se incluye el apellido valdrá undefined
    // mostraremos un filtro solo por el nombre
    if (apellido == undefined) {
        // Si no tenemos el apellido filtrar solo por el nombre
        const filtroClientes = datos.filter(cliente => cliente.name.toLocaleLowerCase() == nombre)

        // Nos aseguramos que el array con los clientes no esté vacío
        if (filtroClientes.length == 0) {
            return res.status(404).send("Cliente no encontrado")
        }
        // Devolver el filtro solo por el nombre del cliente
        return res.json(filtroClientes)    
    }

    // console.log(nombre, apellido);

    // para saber cuantas letras tiene el apellido escrito por el usuario
    const letras = apellido.length

    const filtroClientes = datos.filter(cliente => cliente.surname.slice(0, letras).toLocaleLowerCase() == apellido && cliente.name.toLocaleLowerCase() == nombre)

    // Si no se encuentran coincidencias, mostrar un mensaje
    if (filtroClientes.length == 0) {
        return res.status(404).send("Cliente no encontrado")
    }

    // Devolver los datos filtrados
    res.json(filtroClientes)

})

// Filtrar por la marca : qué productos se han comprado de una marca en concreto
// api/marca/:marca
app.get("/api/marca/:marca", (req, res) => {
    const marca = req.params.marca.toLocaleLowerCase()
    // console.log(marca);

    // console.log(datos.flatMap(cliente => cliente.compras));

    const filtroMarca = datos.flatMap(cliente => cliente.compras.filter(compra => compra.marca.toLocaleLowerCase() == marca ))

    if (filtroMarca.length == 0) {
        return res.status(404).send(`No se ha realizado ninguna compra de ${marca}`)
    }

    // Devolver los datos filtrados
    res.json(filtroMarca)
    
})




// Cargar la página 404
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "../public", "404.html")))


// Poner el puerto en escucha
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))






