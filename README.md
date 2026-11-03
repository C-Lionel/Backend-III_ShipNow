
# ShipNow API

API backend de ShipNow desarrollada con Node.js, Express y MongoDB.

El proyecto utiliza una arquitectura por capas para separar las responsabilidades de acceso HTTP, lógica de negocio y persistencia de datos.

A lo largo de las preentregas se incorporaron las siguientes funcionalidades:

- **Módulo 1:** Gestión de usuarios y estructura inicial del proyecto.
- **Módulo 2:** Gestión de pedidos, entregas, generación de Mocks y carga de datos mediante Seed.
- **Módulo 3:** Manejo centralizado de errores mediante `AppError`, `ErrorDictionary` y un middleware global.
- **Módulo 4:** Logging centralizado con Winston y rotación automática de archivos.
- **Módulo 5:** Documentación interactiva de la API mediante Swagger UI y OpenAPI 3.0.0.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- Nodemon
- bcryptjs
- Winston
- winston-daily-rotate-file
- swagger-jsdoc
- swagger-ui-express
- YAML
- OpenAPI 3.0.0

## Arquitectura

La aplicación utiliza una arquitectura por capas para separar las responsabilidades.

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Model
  ↓
MongoDB
```

### Controller

Es la puerta de entrada HTTP de la aplicación.

Se encarga de recibir las solicitudes, llamar al Service correspondiente y devolver las respuestas HTTP de las operaciones exitosas.

Cuando ocurre un error, lo deriva al middleware global mediante `next(error)`.

### Service

Contiene la lógica de negocio de la aplicación.

Por ejemplo:

- Verificar que un email no esté registrado.
- Evitar la asignación de roles privilegiados desde el registro público.
- Aplicar bcrypt a las contraseñas de usuarios.
- Verificar que un pedido pertenezca a un cliente válido.
- Comprobar que un repartidor tenga el rol correspondiente.
- Evitar la creación de entregas duplicadas para un mismo pedido.
- Coordinar la generación e inserción de datos simulados.
- Detectar condiciones de error y lanzar errores personalizados mediante `AppError`.
- Registrar eventos importantes mediante el logger centralizado.

### Repository

Encapsula las operaciones habituales de acceso a MongoDB mediante Mongoose.

Se encarga de realizar consultas, crear documentos, actualizarlos y eliminarlos.

Por ejemplo, el Repository de usuarios excluye la contraseña de las respuestas de consulta.

### Mocks

El módulo de Mocks genera datos simulados para usuarios, repartidores, pedidos y entregas.

Permite probar la estructura de los datos y sus relaciones sin necesidad de insertarlos en MongoDB.

### Middleware de errores

Centraliza el tratamiento de los errores que ocurren durante el procesamiento de las solicitudes.

Recibe los errores derivados desde los Controllers o generados por Express y Mongoose, devuelve respuestas HTTP uniformes y registra los errores mediante Winston.

## Estructura del proyecto

```text
src/
├── config/
│   └── swagger.config.js
├── constants/
├── controllers/
├── docs/
│   ├── schemas.yaml
│   ├── users.yaml
│   ├── orders.yaml
│   ├── deliveries.yaml
│   ├── mocks.yaml
│   └── logger.yaml
├── middlewares/
├── mocks/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
│   ├── errors.js
│   ├── errorDictionary.js
│   └── logger.js
├── app.js
└── server.js
```

Los archivos de registro se generan en la carpeta `logs/`, ubicada en la raíz del proyecto.

## Requisitos

- Node.js 18 o superior.
- MongoDB local o MongoDB Atlas.
- npm.

Para utilizar el proceso de Seed con transacciones, MongoDB debe admitir transacciones, por ejemplo mediante un replica set o un clúster compatible de MongoDB Atlas.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/C-Lionel/Backend-III_ShipNow.git
```

Ingresar al proyecto e instalar las dependencias:

```bash
cd Backend-III_ShipNow
npm install
```

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=8080
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/shipnow
NODE_ENV=development
```

Las variables `PORT`, `MONGODB_URI` y `NODE_ENV` permiten configurar la aplicación.

El archivo `.env` no debe subirse al repositorio porque puede contener información sensible.

## Ejecución

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

Para ejecutar el proyecto normalmente:

```bash
npm start
```

Una vez iniciado el servidor, la API queda disponible en:

```text
http://localhost:8080
```

El nivel de detalle de los registros depende del valor de `NODE_ENV`.

## Endpoints

### Health Check

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verificar el funcionamiento de la API |

### Usuarios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Listar usuarios |
| POST | `/api/users` | Registrar un cliente |
| GET | `/api/users/:id` | Obtener un usuario por ID |
| PUT | `/api/users/:id` | Actualizar un usuario |
| DELETE | `/api/users/:id` | Eliminar un usuario |

El registro público permite crear usuarios con rol `customer`.

Las contraseñas se almacenan utilizando bcrypt y se excluyen de las respuestas de consulta.

### Pedidos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/orders` | Listar pedidos |
| POST | `/api/orders` | Crear un pedido |
| GET | `/api/orders/:id` | Obtener un pedido por ID |
| PUT | `/api/orders/:id` | Actualizar un pedido |
| DELETE | `/api/orders/:id` | Eliminar un pedido |

Cada pedido se relaciona con un usuario de rol `customer` y puede estar asociado a una entrega.

La creación de pedidos valida la existencia del cliente, sus permisos y los ítems enviados.

El total se calcula a partir de los ítems y el costo de envío.

### Entregas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/deliveries` | Listar entregas |
| POST | `/api/deliveries` | Crear una entrega |
| GET | `/api/deliveries/:id` | Obtener una entrega por ID |
| PUT | `/api/deliveries/:id` | Actualizar una entrega |
| DELETE | `/api/deliveries/:id` | Eliminar una entrega |

Cada entrega está asociada a un pedido y puede tener un repartidor asignado.

Los repartidores se representan mediante usuarios con rol `driver`.

No se permite crear más de una entrega para el mismo pedido.

### Mocks

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mocks/users?qty=5` | Generar usuarios simulados |
| GET | `/api/mocks/drivers?qty=5` | Generar repartidores simulados |
| GET | `/api/mocks/orders?qty=5` | Generar pedidos simulados |
| GET | `/api/mocks/deliveries?qty=5` | Generar entregas simuladas |
| POST | `/api/mocks/seed` | Insertar datos simulados en MongoDB |

Los endpoints GET de Mocks generan datos en memoria y no realizan inserciones en la base de datos.

### Logger

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/logger-test` | Generar mensajes de prueba de los seis niveles de Winston |

El endpoint `/api/logger-test` está disponible únicamente cuando `NODE_ENV=development`.

## Seed de datos simulados

El endpoint `POST /api/mocks/seed` permite insertar datos de prueba relacionados en MongoDB.

Ejemplo de solicitud:

```json
{
  "qty": 2
}
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "Datos simulados insertados correctamente",
  "payload": {
    "customers": 2,
    "drivers": 2,
    "orders": 2,
    "deliveries": 2
  }
}
```

El proceso realiza las siguientes operaciones:

1. Genera clientes y repartidores con contraseñas hasheadas mediante bcrypt.
2. Inserta los usuarios en MongoDB.
3. Genera pedidos asociados a los clientes creados.
4. Genera entregas asociadas a los pedidos y repartidores.
5. Actualiza los pedidos con sus correspondientes referencias a las entregas.

Las operaciones se ejecutan dentro de una transacción de MongoDB para evitar inserciones parciales si ocurre un error.

### Restricciones del Seed

- Solo se permite cuando `NODE_ENV=development`.
- La cantidad debe ser un número entero entre 1 y 100.
- Si se solicita una cantidad inválida, la API devuelve un error HTTP `400`.
- Si se intenta ejecutar fuera del entorno de desarrollo, devuelve un error HTTP `403`.

**Importante:** el endpoint de Seed modifica la base de datos. Debe utilizarse únicamente en un entorno de desarrollo controlado.

## Constantes

Las constantes del dominio se encuentran centralizadas en `src/constants/index.js` mediante objetos inmutables.

### Roles de usuario

```text
admin
customer
driver
store
```

### Estados de pedidos

```text
created
assigned
picked_up
in_transit
delivered
cancelled
```

### Estados de entregas

```text
pending
assigned
in_transit
delivered
```

### Prioridades

```text
low
normal
high
```

### Tipos de documentos

```text
user_document
driver_license
delivery_proof
```

Esta centralización evita repetir valores literales en diferentes partes de la aplicación y facilita las validaciones.

## Separación entre Service y Repository

La capa **Service** contiene las reglas y decisiones propias del negocio.

Por ejemplo, valida los datos de los pedidos, verifica los roles de usuarios y repartidores y controla las condiciones necesarias para crear entregas.

La capa **Repository** encapsula las operaciones habituales de persistencia y consulta mediante Mongoose.

Para el proceso de Seed se utiliza un servicio específico que coordina directamente las inserciones y actualizaciones dentro de una transacción de MongoDB.

## Manejo centralizado de errores — Módulo 3

La API implementa un sistema de manejo centralizado de errores para mantener respuestas HTTP consistentes y evitar repetir la lógica de errores en cada Controller.

Este sistema permite identificar los errores mediante códigos específicos y devolver mensajes claros al cliente.

### Componentes del sistema

**1. AppError — `src/utils/errors.js`**

Define una clase personalizada que extiende la clase nativa `Error` de JavaScript.

Permite representar errores mediante las propiedades:

- `message`: descripción del error.
- `statusCode`: código de estado HTTP.
- `code`: identificador interno del error.

Los Services utilizan esta clase para lanzar errores personalizados.

**2. ErrorDictionary — `src/utils/errorDictionary.js`**

Centraliza los errores conocidos de la aplicación.

Cada entrada del diccionario contiene:

- El código HTTP correspondiente.
- Un mensaje descriptivo.
- Un código interno que identifica el error.

Esto evita repetir mensajes y códigos en diferentes partes del proyecto.

**3. errorMiddleware — `src/middlewares/error.middleware.js`**

Es el middleware global encargado de procesar los errores.

Recibe los errores derivados mediante `next(error)` y construye una respuesta HTTP uniforme.

También identifica errores provenientes de Express y Mongoose, como JSON mal formado, identificadores inválidos y errores de validación.

Si ocurre un error inesperado, devuelve una respuesta genérica con el código `INTERNAL_SERVER_ERROR`, evitando exponer detalles internos del servidor.

Desde el Módulo 4, este middleware también registra los errores mediante Winston.

### Funcionamiento del manejo de errores

Cuando un Service detecta una condición inválida, lanza un `AppError` utilizando una entrada del diccionario.

Por ejemplo:

```javascript
throw new AppError(ErrorDictionary.USER_NOT_FOUND);
```

El Controller captura el error y lo deriva:

```javascript
catch (error) {
  next(error);
}
```

Finalmente, el middleware global interpreta el error y devuelve la respuesta HTTP correspondiente.

```text
Solicitud HTTP
      ↓
    Route
      ↓
  Controller
      ↓
   Service
      ↓
Detección del error
      ↓
AppError + ErrorDictionary
      ↓
 next(error)
      ↓
errorMiddleware
      ├── Registro con Winston
      ↓
Respuesta HTTP
```

Los errores originados directamente en Express o Mongoose también pueden llegar al middleware global.

### Formato de las respuestas de error

Todas las respuestas de error utilizan la siguiente estructura:

```json
{
  "status": "error",
  "message": "Usuario no encontrado",
  "code": "USER_NOT_FOUND"
}
```

Donde:

- `status`: indica que la operación terminó con un error.
- `message`: proporciona una descripción clara del problema.
- `code`: permite identificar el error mediante un código interno.

El código de estado HTTP se establece en la respuesta y no se incluye como propiedad del JSON.

### Diccionario de errores

| Código | HTTP | Descripción |
|---|---|---|
| `USER_NOT_FOUND` | 404 | Usuario no encontrado |
| `USER_ROLE_FORBIDDEN` | 403 | Rol no permitido en el registro público |
| `EMAIL_ALREADY_EXISTS` | 409 | Email ya registrado |
| `USER_ROLE_UPDATE_FORBIDDEN` | 403 | Modificación de rol no permitida |
| `INVALID_PASSWORD` | 400 | Contraseña vacía |
| `ORDER_NOT_FOUND` | 404 | Pedido no encontrado |
| `ORDER_CUSTOMER_NOT_FOUND` | 400 | Cliente del pedido inexistente |
| `INVALID_CUSTOMER_ROLE` | 400 | Usuario sin rol customer |
| `ORDER_ITEMS_REQUIRED` | 400 | Pedido sin ítems |
| `ORDER_PROTECTED_FIELDS` | 403 | Modificación de campos protegidos |
| `ORDER_HAS_DELIVERY` | 409 | Pedido con entrega asociada |
| `DELIVERY_NOT_FOUND` | 404 | Entrega no encontrada |
| `INVALID_DELIVERY_ID` | 400 | ID de entrega inválido |
| `INVALID_ORDER_ID` | 400 | ID de pedido inválido |
| `DELIVERY_ALREADY_EXISTS` | 409 | Pedido con entrega existente |
| `INVALID_DRIVER_ID` | 400 | ID de repartidor inválido |
| `INVALID_DRIVER` | 400 | Repartidor inexistente o sin rol driver |
| `DELIVERY_ORDER_CHANGE_FORBIDDEN` | 400 | Cambio de pedido de una entrega no permitido |
| `INVALID_MOCK_QUANTITY` | 400 | Cantidad de mocks inválida |
| `SEED_FORBIDDEN` | 403 | Seed no permitido fuera de desarrollo |
| `INVALID_ID` | 400 | Identificador inválido |
| `INVALID_JSON` | 400 | JSON mal formado |
| `VALIDATION_ERROR` | 400 | Error de validación de Mongoose |
| `ROUTE_NOT_FOUND` | 404 | Ruta inexistente |
| `INTERNAL_SERVER_ERROR` | 500 | Error inesperado del servidor |

### Pruebas del manejo de errores

Se realizaron pruebas con Postman y la terminal para verificar que el middleware global procese correctamente los errores.

| Prueba | Resultado esperado |
|---|---|
| Usuario inexistente | 404 — `USER_NOT_FOUND` |
| Identificador inválido | 400 — `INVALID_ID` |
| Email duplicado | 409 — `EMAIL_ALREADY_EXISTS` |
| Rol no permitido | 403 — `USER_ROLE_FORBIDDEN` |
| Pedido inexistente | 404 — `ORDER_NOT_FOUND` |
| Pedido sin ítems | 400 — `ORDER_ITEMS_REQUIRED` |
| Entrega inexistente | 404 — `DELIVERY_NOT_FOUND` |
| Cantidad inválida de mocks | 400 — `INVALID_MOCK_QUANTITY` |
| Cantidad inválida en Seed | 400 — `INVALID_MOCK_QUANTITY` |
| Ruta inexistente | 404 — `ROUTE_NOT_FOUND` |
| JSON mal formado | 400 — `INVALID_JSON` |
| Validación de Mongoose | 400 — `VALIDATION_ERROR` |

### Ejemplos cURL para verificar errores

Los siguientes comandos pueden ejecutarse desde Git Bash con el servidor iniciado.

**Identificador inválido**

```bash
curl -i http://localhost:8080/api/users/123
```

Resultado esperado: HTTP `400`, código `INVALID_ID`.

**Ruta inexistente**

```bash
curl -i http://localhost:8080/api/ruta-inexistente
```

Resultado esperado: HTTP `404`, código `ROUTE_NOT_FOUND`.

**Cantidad inválida de mocks**

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=500"
```

Resultado esperado: HTTP `400`, código `INVALID_MOCK_QUANTITY`.

**Pedido inexistente**

```bash
curl -i http://localhost:8080/api/orders/000000000000000000000000
```

Resultado esperado: HTTP `404`, código `ORDER_NOT_FOUND`.

**Entrega inexistente**

```bash
curl -i http://localhost:8080/api/deliveries/000000000000000000000000
```

Resultado esperado: HTTP `404`, código `DELIVERY_NOT_FOUND`.

### Beneficios del manejo centralizado de errores

- Centraliza los mensajes y códigos de error.
- Evita duplicar respuestas de error en los Controllers.
- Mantiene una estructura uniforme para los clientes de la API.
- Facilita las pruebas y el mantenimiento.
- Permite diferenciar errores de negocio, validación y errores inesperados.
- Evita exponer detalles técnicos de errores internos.
- Facilita la incorporación de nuevos errores mediante el diccionario.

## Logging y monitoreo básico — Módulo 4

En el Módulo 4 se incorporó un sistema de logging centralizado utilizando **Winston**.

Su objetivo es registrar eventos relevantes de la aplicación, facilitar el seguimiento de operaciones y conservar información sobre errores importantes.

El logger está implementado en:

```text
src/utils/logger.js
```

Este módulo centraliza la configuración de niveles, formato y destinos de los registros.

### Niveles personalizados de logging

Se definieron seis niveles, ordenados de mayor a menor gravedad:

| Nivel | Prioridad | Descripción |
|---|---|---|
| `fatal` | 0 | Fallos críticos que impiden el funcionamiento normal |
| `error` | 1 | Errores inesperados que requieren investigación |
| `warning` | 2 | Errores controlados y situaciones recuperables |
| `info` | 3 | Eventos importantes del funcionamiento de la API |
| `http` | 4 | Información relacionada con solicitudes HTTP |
| `debug` | 5 | Información detallada para desarrollo y diagnóstico |

La prioridad más baja numéricamente representa una mayor gravedad.

### Formato de los registros

Cada mensaje incluye:

- Fecha.
- Hora.
- Nivel de logging.
- Descripción del evento.

Ejemplo:

```text
2026-10-26 15:18:36 [info] Pedido creado correctamente con ID: 6adf997c3a3edf8506725757
```

### Configuración por entorno

La configuración del logger depende de la variable `NODE_ENV`.

**Desarrollo (`NODE_ENV=development`)**

Se muestran en consola los seis niveles:

```text
debug
http
info
warning
error
fatal
```

**Producción (`NODE_ENV=production`)**

Se muestran en consola únicamente:

```text
info
warning
error
fatal
```

Esto permite disponer de información detallada durante el desarrollo y reducir los mensajes menos relevantes en producción.

### Destinos de los registros

Winston utiliza dos transportes principales.

**1. Consola**

Los mensajes se muestran en la terminal mediante `winston.transports.Console()`.

La cantidad de información visible depende del entorno.

**2. Archivos**

Los registros importantes se almacenan mediante `winston-daily-rotate-file`.

Los archivos se generan dentro de la carpeta:

```text
logs/
```

Con nombres como:

```text
error-2026-10-26.log
```

Solamente se almacenan los niveles:

```text
error
fatal
```

Los mensajes `debug`, `http`, `info` y `warning` no se guardan en estos archivos.

### Rotación de archivos

La configuración utiliza los siguientes parámetros:

| Parámetro | Configuración |
|---|---|
| Patrón de fecha | `YYYY-MM-DD` |
| Tamaño máximo por archivo | 10 MB |
| Retención | 14 días |
| Niveles almacenados | `error` y `fatal` |

La rotación permite evitar que los archivos crezcan indefinidamente.

La librería también genera un archivo de auditoría para administrar la retención de registros.

La carpeta `logs/` se encuentra excluida del repositorio mediante `.gitignore`:

```gitignore
/logs/
```

### Integración con el middleware global de errores

El middleware `src/middlewares/error.middleware.js` utiliza Winston para registrar los errores antes de enviar la respuesta HTTP.

Los errores controlados mediante `AppError` se registran como `warning`.

Los errores inesperados se registran como `error`, incluyendo información técnica para facilitar su investigación.

Los fallos críticos de conexión inicial a MongoDB se registran como `fatal`.

La incorporación del logger no modifica los códigos HTTP ni la estructura de las respuestas JSON.

### Eventos registrados

Se incorporaron registros en diferentes puntos importantes de ShipNow:

- Inicio del servidor.
- Conexión con MongoDB.
- Generación de Mocks.
- Cantidades inválidas.
- Creación de pedidos.
- Inicio y finalización del Seed.
- Errores controlados e inesperados de la API.

### Endpoint de prueba del logger

Se incorporó el siguiente endpoint:

```http
GET /api/logger-test
```

Este endpoint está disponible solamente cuando:

```env
NODE_ENV=development
```

Al ejecutarlo, se genera un mensaje de prueba para cada uno de los seis niveles:

```javascript
logger.debug("Prueba de nivel debug");
logger.http("Prueba de nivel http");
logger.info("Prueba de nivel info");
logger.warning("Prueba de nivel warning");
logger.error("Prueba de nivel error");
logger.fatal("Prueba de nivel fatal");
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "Prueba de logging ejecutada correctamente"
}
```

En desarrollo, los seis mensajes aparecen en consola.

Los mensajes de nivel `error` y `fatal` también se guardan en el archivo de errores correspondiente.

Los mensajes generados por este endpoint son simulaciones y no representan fallos reales de la aplicación.

### Beneficios del logging

- Centraliza el registro de eventos.
- Reemplaza los mensajes dispersos de consola.
- Permite distinguir eventos según su gravedad.
- Facilita el diagnóstico de errores inesperados.
- Conserva los registros importantes en archivos.
- Evita acumular archivos indefinidamente mediante rotación.
- Permite configurar distintos niveles de detalle según el entorno.
- Se integra con el manejo de errores existente sin alterar las respuestas HTTP.

## Documentación con Swagger y OpenAPI — Módulo 5

En el Módulo 5 se incorporó documentación interactiva de la API utilizando **Swagger UI**, **swagger-jsdoc** y la especificación **OpenAPI 3.0.0**.

El objetivo es describir los endpoints de ShipNow, sus parámetros, cuerpos de solicitud, respuestas HTTP y estructuras de datos.

La documentación permite consultar y probar las operaciones desde un navegador, sin necesidad de utilizar Postman para cada petición.

### Dependencias utilizadas

Se instalaron las siguientes dependencias:

```bash
npm install swagger-jsdoc swagger-ui-express
```

- `swagger-jsdoc`: genera la especificación OpenAPI a partir de los archivos de documentación.
- `swagger-ui-express`: publica una interfaz gráfica interactiva dentro de Express.

### Configuración de Swagger

La configuración se encuentra en:

```text
src/config/swagger.config.js
```

Se utiliza OpenAPI 3.0.0 con la información general de ShipNow.

La configuración incluye:

- Título: `ShipNow API`.
- Versión: `1.0.0`.
- Servidor local: `http://localhost:8080`.
- Definición de las categorías Users, Orders, Deliveries, Mocks y Logger.
- Lectura de los archivos YAML ubicados en `src/docs/`.

La documentación se genera utilizando la siguiente ubicación:

```javascript
apis: ["./src/docs/**/*.yaml"]
```

Swagger UI se integra en `src/app.js` mediante:

```javascript
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs)
);
```

### Acceso a Swagger UI

Con el servidor iniciado, ingresar desde el navegador a:

```text
http://localhost:8080/api/docs
```

En esa dirección se encuentra la interfaz interactiva de Swagger.

La interfaz permite:

- Consultar todos los endpoints documentados.
- Ver los métodos HTTP disponibles.
- Revisar los parámetros y cuerpos de solicitud.
- Consultar los códigos de respuesta.
- Visualizar los schemas de los recursos.
- Ejecutar solicitudes reales contra la API.

### Organización de la documentación

Los archivos de documentación se encuentran separados por responsabilidad dentro de `src/docs/`.

```text
src/docs/
├── schemas.yaml
├── users.yaml
├── orders.yaml
├── deliveries.yaml
├── mocks.yaml
└── logger.yaml
```

**`schemas.yaml`**

Define los schemas reutilizables de los recursos y las respuestas.

**`users.yaml`**

Documenta las operaciones de consulta, registro, actualización y eliminación de usuarios.

**`orders.yaml`**

Documenta las operaciones CRUD de pedidos y sus validaciones.

**`deliveries.yaml`**

Documenta las operaciones CRUD de entregas y sus relaciones con pedidos y repartidores.

**`mocks.yaml`**

Documenta la generación de datos simulados y el proceso de Seed.

**`logger.yaml`**

Documenta el endpoint de prueba de Winston.

Esta organización permite mantener la documentación separada del código de los Controllers y facilita su mantenimiento.

### Endpoints documentados

Se documentaron **21 endpoints**, organizados en cinco categorías.

| Categoría | Cantidad |
|---|---:|
| Users | 5 |
| Orders | 5 |
| Deliveries | 5 |
| Mocks | 5 |
| Logger | 1 |
| **Total** | **21** |

El endpoint `/api/health` también está disponible en la aplicación, aunque no forma parte de estas cinco categorías documentadas.

### Categoría Users

Se documentaron los siguientes endpoints:

```http
GET /api/users
POST /api/users
GET /api/users/{id}
PUT /api/users/{id}
DELETE /api/users/{id}
```

La documentación incluye:

- Listado de usuarios.
- Registro de clientes.
- Consulta por identificador.
- Actualización de usuarios.
- Eliminación de usuarios.
- Cuerpos de solicitud.
- Respuestas exitosas y errores.

Se especifica que el registro público permite crear usuarios con rol `customer`.

También se documentan los errores relacionados con usuarios inexistentes, emails duplicados, roles no permitidos y validaciones.

### Categoría Orders

Se documentaron los siguientes endpoints:

```http
GET /api/orders
POST /api/orders
GET /api/orders/{id}
PUT /api/orders/{id}
DELETE /api/orders/{id}
```

La documentación incluye:

- Listado de pedidos.
- Creación de pedidos.
- Consulta por identificador.
- Actualización de pedidos.
- Eliminación de pedidos.
- Validaciones de clientes e ítems.
- Campos protegidos.
- Restricciones de eliminación.

Se documentan errores como:

- `ORDER_NOT_FOUND` — HTTP 404.
- `ORDER_CUSTOMER_NOT_FOUND` — HTTP 400.
- `INVALID_CUSTOMER_ROLE` — HTTP 400.
- `ORDER_ITEMS_REQUIRED` — HTTP 400.
- `ORDER_PROTECTED_FIELDS` — HTTP 403.
- `ORDER_HAS_DELIVERY` — HTTP 409.

### Categoría Deliveries

Se documentaron los siguientes endpoints:

```http
GET /api/deliveries
POST /api/deliveries
GET /api/deliveries/{id}
PUT /api/deliveries/{id}
DELETE /api/deliveries/{id}
```

La documentación incluye:

- Listado de entregas.
- Creación de entregas.
- Consulta por identificador.
- Actualización de entregas.
- Eliminación de entregas.
- Validación de pedidos existentes.
- Validación de repartidores.
- Restricción de entregas duplicadas.
- Prohibición de modificar el pedido asociado.

Se documentan errores como:

- `DELIVERY_NOT_FOUND` — HTTP 404.
- `INVALID_DELIVERY_ID` — HTTP 400.
- `INVALID_ORDER_ID` — HTTP 400.
- `DELIVERY_ALREADY_EXISTS` — HTTP 409.
- `INVALID_DRIVER_ID` — HTTP 400.
- `INVALID_DRIVER` — HTTP 400.
- `DELIVERY_ORDER_CHANGE_FORBIDDEN` — HTTP 400.

### Categoría Mocks

Se documentaron los siguientes endpoints:

```http
GET /api/mocks/users
GET /api/mocks/drivers
GET /api/mocks/orders
GET /api/mocks/deliveries
POST /api/mocks/seed
```

Los endpoints GET permiten indicar la cantidad mediante el parámetro de consulta `qty`.

Ejemplo:

```http
GET /api/mocks/users?qty=3
```

La cantidad permitida es un número entero entre 1 y 100.

Si no se proporciona, se utiliza el valor predeterminado de 10.

Los endpoints GET generan datos simulados en memoria y no modifican MongoDB.

El endpoint POST de Seed inserta datos relacionados en la base de datos.

La documentación especifica que el Seed solo está habilitado cuando:

```env
NODE_ENV=development
```

Fuera de desarrollo devuelve HTTP `403` mediante el error `SEED_FORBIDDEN`.

### Categoría Logger

Se documentó el siguiente endpoint:

```http
GET /api/logger-test
```

Permite generar mensajes de prueba para los seis niveles de Winston.

Está disponible únicamente en desarrollo.

Su respuesta exitosa es:

```json
{
  "status": "success",
  "message": "Prueba de logging ejecutada correctamente"
}
```

### Schemas reutilizables

Los schemas compartidos se definen en:

```text
src/docs/schemas.yaml
```

Se incorporaron los siguientes:

| Schema | Descripción |
|---|---|
| `ErrorResponse` | Estructura uniforme de errores |
| `SuccessResponse` | Estructura general de respuesta exitosa |
| `User` | Datos de un usuario |
| `UserCreate` | Datos necesarios para registrar un cliente |
| `OrderItem` | Ítem de un pedido |
| `Order` | Datos de un pedido |
| `Delivery` | Datos de una entrega |

Estos schemas permiten reutilizar las definiciones y evitar duplicar estructuras dentro de cada archivo YAML.

### Uso de referencias `$ref`

OpenAPI permite referenciar schemas definidos en `components`.

Por ejemplo:

```yaml
schema:
  $ref: "#/components/schemas/User"
```

Para documentar errores:

```yaml
schema:
  $ref: "#/components/schemas/ErrorResponse"
```

Esto permite que varios endpoints compartan la misma definición.

Si se modifica un schema reutilizable, los endpoints que lo referencian utilizan esa definición actualizada.

### Documentación de parámetros

Se utilizaron parámetros de ruta para identificar recursos individuales.

Ejemplo:

```yaml
parameters:
  - name: id
    in: path
    required: true
    description: Identificador MongoDB del recurso
    schema:
      type: string
```

También se utilizaron parámetros de consulta para los endpoints de Mocks.

Ejemplo:

```yaml
parameters:
  - name: qty
    in: query
    required: false
    schema:
      type: integer
      minimum: 1
      maximum: 100
      default: 10
```

Los parámetros de ruta y consulta se documentan mediante `parameters`.

Los datos enviados en el cuerpo de una solicitud se documentan mediante `requestBody`.

### Documentación de requestBody

Los endpoints POST y PUT que reciben datos JSON incluyen la definición de `requestBody`.

Ejemplo:

```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required:
          - order
        properties:
          order:
            type: string
          priority:
            type: string
            enum: [low, normal, high]
```

Esto permite que Swagger UI muestre los campos disponibles y sus tipos de datos.

### Documentación de respuestas HTTP

Los endpoints incluyen las respuestas correspondientes a sus operaciones.

Entre los códigos utilizados se encuentran:

| HTTP | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado correctamente |
| 400 | Solicitud o datos inválidos |
| 403 | Operación no permitida |
| 404 | Recurso no encontrado |
| 409 | Conflicto con el estado actual |
| 500 | Error interno del servidor |

Los códigos se documentaron respetando los valores definidos en `ErrorDictionary`.

Por ejemplo:

```yaml
responses:
  "404":
    description: Usuario no encontrado
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/ErrorResponse"
```

La documentación de múltiples respuestas permite conocer tanto los casos exitosos como los errores posibles de una operación.

### Cómo probar los endpoints desde Swagger UI

Para ejecutar una solicitud desde Swagger:

1. Iniciar el servidor con `npm run dev`.
2. Abrir `http://localhost:8080/api/docs`.
3. Seleccionar una categoría.
4. Desplegar el endpoint deseado.
5. Presionar **Try it out**.
6. Completar los parámetros o el JSON cuando corresponda.
7. Presionar **Execute**.
8. Revisar el código HTTP y la respuesta recibida.

Swagger UI permite ejecutar solicitudes reales contra la aplicación.

Las operaciones POST, PUT y DELETE pueden modificar los datos almacenados en MongoDB.

### Ejemplo de prueba: generar usuarios mock

Seleccionar:

```http
GET /api/mocks/users
```

Presionar **Try it out** y completar:

```text
qty = 3
```

Presionar **Execute**.

La API debe responder con HTTP `200` y los tres usuarios simulados generados.

Esta operación no inserta usuarios en MongoDB.

### Ejemplo de prueba: logger

Seleccionar:

```http
GET /api/logger-test
```

Presionar **Try it out** y luego **Execute**.

Con `NODE_ENV=development`, la API responde con HTTP `200`.

También se generan mensajes de prueba de los seis niveles de Winston.

### Consideraciones sobre el Seed

Swagger permite ejecutar:

```http
POST /api/mocks/seed
```

Con un cuerpo como:

```json
{
  "qty": 2
}
```

**Importante:** esta operación inserta documentos reales en MongoDB.

Se recomienda utilizarla únicamente sobre una base de datos de desarrollo.

### Pruebas realizadas con Swagger

Durante la incorporación de la documentación se comprobó:

- Que Swagger UI se encuentra disponible en `/api/docs`.
- Que se visualizan las categorías Users, Orders, Deliveries, Mocks y Logger.
- Que se muestran los endpoints definidos en los archivos YAML.
- Que se pueden consultar los schemas reutilizables.
- Que Swagger permite ejecutar solicitudes mediante **Try it out**.
- Que `GET /api/users` devuelve usuarios registrados.
- Que `GET /api/mocks/users?qty=3` devuelve tres usuarios simulados con HTTP 200.
- Que `GET /api/logger-test` devuelve una respuesta exitosa con HTTP 200 en desarrollo.

Estas comprobaciones verifican la integración de Swagger y el funcionamiento de los endpoints utilizados durante las pruebas.

### Beneficios de Swagger/OpenAPI

- Centraliza la documentación de la API.
- Facilita la comprensión de los endpoints.
- Permite consultar parámetros y cuerpos de solicitud.
- Documenta respuestas exitosas y errores.
- Reutiliza schemas mediante `$ref`.
- Facilita las pruebas desde el navegador.
- Reduce la necesidad de consultar el código fuente para conocer las operaciones disponibles.
- Mejora el mantenimiento de la documentación.
- Facilita el trabajo de otros desarrolladores que consuman la API.

## Scripts

| Comando | Uso |
|---|---|
| `npm install` | Instalar dependencias |
| `npm run dev` | Ejecutar en desarrollo con Nodemon |
| `npm start` | Ejecutar la aplicación |

## Información de la entrega

**Curso:** Backend III

**Proyecto:** ShipNow API

**Entrega:** Pre-entrega Módulo 5 — Documentación con Swagger/OpenAPI

**Documentación interactiva:** `http://localhost:8080/api/docs`

**Repositorio:** https://github.com/C-Lionel/Backend-III_ShipNow
