
import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ShipNow API",
      version: "1.0.0",
      description:
        "Documentación de la API ShipNow: usuarios, pedidos, entregas, mocks y logger."
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Servidor local"
      }
    ],
    tags: [
      { name: "Users", description: "Gestión de usuarios" },
      { name: "Orders", description: "Gestión de pedidos" },
      { name: "Deliveries", description: "Gestión de entregas" },
      { name: "Mocks", description: "Generación y carga de datos de prueba" },
      { name: "Logger", description: "Pruebas del sistema de logging" }
    ]
  },
  apis: ["./src/docs/**/*.yaml"]
};

const swaggerSpecs = swaggerJSDoc(swaggerOptions);

export default swaggerSpecs;
