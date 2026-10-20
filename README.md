# ShipNow API

API backend de ShipNow desarrollada con Node.js, Express y MongoDB.

El proyecto utiliza una arquitectura por capas para separar las responsabilidades de acceso HTTP, lógica de negocio y persistencia de datos.

En el Módulo 2 se incorporó la gestión de pedidos y entregas, junto con un sistema de generación de datos simulados (Mocks) y un proceso de carga de datos de prueba (Seed).

En el Módulo 3 se implementó un sistema de manejo centralizado de errores mediante errores personalizados, un diccionario de errores y un middleware global de Express. Esto permite devolver respuestas HTTP consistentes y separar la detección de errores de su presentación al cliente.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- Nodemon
- bcryptjs

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

### Repository

Encapsula las operaciones habituales de acceso a MongoDB mediante Mongoose.

Se encarga de realizar consultas, crear documentos, actualizarlos y eliminarlos.

Por ejemplo, el Repository de usuarios excluye la contraseña de las respuestas de consulta.

### Mocks

El módulo de Mocks genera datos simulados para usuarios, repartidores, pedidos y entregas.

Permite probar la estructura de los datos y sus relaciones sin necesidad de insertarlos en MongoDB.

### Middleware de errores

Centraliza el tratamiento de los errores que ocurren durante el procesamiento de las solicitudes.

Recibe los errores derivados desde los Controllers o generados por Express y Mongoose, y devuelve respuestas HTTP uniformes.

## Estructura del proyecto

```text
src/
├── config/
├── constants/
├── controllers/
├── middlewares/
├── mocks/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
├── app.js
└── server.js
```

## Requisitos

- Node.js 18 o superior
- MongoDB local o MongoDB Atlas
- npm

Para utilizar el proceso de Seed con transacciones, MongoDB debe admitir transacciones, por ejemplo mediante un replica set o un clúster compatible de MongoDB Atlas.

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=8080
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/shipnow
NODE_ENV=development
```

Las variables `PORT`, `MONGODB_URI` y `NODE_ENV` son necesarias para configurar la aplicación.

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

El registro público permite crear usuarios con rol `customer`. Las contraseñas se almacenan utilizando bcrypt y se excluyen de las respuestas de consulta.

### Pedidos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/orders` | Listar pedidos |
| POST | `/api/orders` | Crear un pedido |
| GET | `/api/orders/:id` | Obtener un pedido por ID |
| PUT | `/api/orders/:id` | Actualizar un pedido |
| DELETE | `/api/orders/:id` | Eliminar un pedido |

Cada pedido se relaciona con un usuario de rol `customer` y puede estar asociado a una entrega.

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

### Mocks

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mocks/users?qty=5` | Generar usuarios simulados |
| GET | `/api/mocks/drivers?qty=5` | Generar repartidores simulados |
| GET | `/api/mocks/orders?qty=5` | Generar pedidos simulados |
| GET | `/api/mocks/deliveries?qty=5` | Generar entregas simuladas |
| POST | `/api/mocks/seed` | Insertar datos simulados en MongoDB |

Los endpoints GET de Mocks generan datos en memoria y no realizan inserciones en la base de datos.

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
- Si se solicita una cantidad inválida, la API devuelve un error `400`.
- Si se intenta ejecutar fuera del entorno de desarrollo, devuelve un error `403`.

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

### Prioridades de entrega

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

El manejo de errores se organiza en tres archivos principales:

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

El flujo general es:

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

La aplicación contempla errores relacionados con usuarios, pedidos, entregas, mocks y validaciones generales.

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

### Pruebas del manejo de errores con Postman

Se realizaron pruebas sobre los endpoints existentes para verificar que los errores se procesen mediante el middleware global.

**1. Usuario inexistente**

```http
GET /api/users/000000000000000000000000
```

Respuesta esperada:

- HTTP `404`
- Código `USER_NOT_FOUND`

**2. Identificador inválido**

```http
GET /api/users/123
```

Respuesta esperada:

- HTTP `400`
- Código `INVALID_ID`

**3. Email duplicado**

Enviar una solicitud `POST /api/users` utilizando un email que ya exista en MongoDB.

Respuesta esperada:

- HTTP `409`
- Código `EMAIL_ALREADY_EXISTS`

**4. Rol no permitido**

```http
POST /api/users
```

Enviar un usuario con rol `admin` desde el registro público.

Respuesta esperada:

- HTTP `403`
- Código `USER_ROLE_FORBIDDEN`

**5. Pedido inexistente**

```http
GET /api/orders/000000000000000000000000
```

Respuesta esperada:

- HTTP `404`
- Código `ORDER_NOT_FOUND`

**6. Pedido sin ítems**

Enviar una solicitud `POST /api/orders` con un cliente válido y un arreglo `items` vacío.

Respuesta esperada:

- HTTP `400`
- Código `ORDER_ITEMS_REQUIRED`

**7. Entrega inexistente**

```http
GET /api/deliveries/000000000000000000000000
```

Respuesta esperada:

- HTTP `404`
- Código `DELIVERY_NOT_FOUND`

**8. Cantidad inválida de mocks**

```http
GET /api/mocks/users?qty=-5
```

Respuesta esperada:

- HTTP `400`
- Código `INVALID_MOCK_QUANTITY`

**9. Cantidad inválida en Seed**

```http
POST /api/mocks/seed
```

Body:

```json
{
  "qty": -5
}
```

Respuesta esperada:

- HTTP `400`
- Código `INVALID_MOCK_QUANTITY`

**10. Ruta inexistente**

```http
GET /api/ruta-inexistente
```

Respuesta esperada:

```json
{
  "status": "error",
  "message": "Ruta no encontrada",
  "code": "ROUTE_NOT_FOUND"
}
```

Código HTTP: `404`.

**11. JSON mal formado**

Enviar una solicitud `POST /api/users` con un JSON que contenga una coma sobrante antes del cierre del objeto.

Respuesta esperada:

```json
{
  "status": "error",
  "message": "JSON no válido",
  "code": "INVALID_JSON"
}
```

Código HTTP: `400`.

**12. Error de validación de Mongoose**

Enviar una solicitud `POST /api/users` sin el campo obligatorio `email`.

Respuesta esperada:

```json
{
  "status": "error",
  "message": "Los datos proporcionados no son válidos",
  "code": "VALIDATION_ERROR"
}
```

Código HTTP: `400`.

### Beneficios de la implementación

- Centraliza los mensajes y códigos de error.
- Evita duplicar respuestas de error en los Controllers.
- Mantiene una estructura uniforme para los clientes de la API.
- Facilita las pruebas y el mantenimiento.
- Permite diferenciar errores de negocio, validación y errores inesperados.
- Evita exponer detalles técnicos de errores internos.
- Facilita la incorporación de nuevos errores mediante el diccionario.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Ejecutar en desarrollo con Nodemon |
| `npm start` | Ejecutar la aplicación |

## Información de la entrega

**Curso:** Backend III  
**Entrega:** Pre-entrega Módulo 3 — Manejo profesional de errores de ShipNow