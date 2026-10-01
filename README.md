# ShipNow API

API backend de ShipNow desarrollada con Node.js, Express y MongoDB.

El proyecto fue refactorizado utilizando una arquitectura por capas para separar las responsabilidades de acceso HTTP, lógica de negocio y persistencia de datos.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- Nodemon

## Arquitectura

La aplicación utiliza una arquitectura de tres capas para separar las responsabilidades de acceso HTTP, lógica de negocio y persistencia de datos.

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

Se encarga de recibir `req` y `res`, llamar al Service correspondiente y devolver la respuesta HTTP con el código de estado adecuado.

### Service

Contiene la lógica de negocio de la aplicación.

Por ejemplo:

- Validar los datos necesarios para crear un producto.
- Evitar productos con códigos duplicados.
- Determinar el estado de un producto según su stock.
- Evitar la creación de usuarios administradores desde el endpoint común.
- Verificar si un email ya se encuentra registrado.

### Repository

Es la única capa que accede directamente a Mongoose y MongoDB.

Se encarga de realizar consultas, aplicar filtros y definir proyecciones de datos.

Por ejemplo, el Repository de productos permite consultar únicamente productos disponibles y el Repository de usuarios excluye la contraseña en las consultas destinadas a devolver información de usuarios.

Esta separación permite que el Service se concentre en las reglas de negocio, mientras que el Repository encapsula los detalles de persistencia y acceso a la base de datos.

## Estructura del proyecto

```text
src/
├── config/
├── constants/
├── controllers/
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
JWT_SECRET=tu_clave_secreta
NODE_ENV=development
```

Las variables `PORT`, `MONGODB_URI` y `NODE_ENV` son validadas al iniciar la aplicación.

Si falta alguna de estas variables, la aplicación informa qué variable falta y no inicia.

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

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Health check de la API |
| GET | `/api/users` | Listar usuarios |
| POST | `/api/users` | Crear un usuario |
| GET | `/api/users/:id` | Obtener un usuario por ID |
| PUT | `/api/users/:id` | Actualizar un usuario |
| DELETE | `/api/users/:id` | Eliminar un usuario |
| GET | `/api/products` | Listar productos disponibles con stock |
| GET | `/api/products?all=true` | Listar todos los productos |
| POST | `/api/products` | Crear un producto |
| GET | `/api/products/:id` | Obtener un producto por ID |
| PUT | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto |
| GET | `/api/products/:id/shipping-cost` | Cotizar el envío de un producto |

## Configuración de entorno

La configuración de las variables de entorno se encuentra centralizada en la capa `config`.

Esto permite evitar llamadas directas a `process.env` desde otras partes de la aplicación.

Las variables obligatorias son:

```text
PORT
MONGODB_URI
NODE_ENV
```

Al iniciar la aplicación se valida la existencia de estas variables. Si alguna no está configurada, se lanza un error descriptivo y la aplicación no inicia.

## Constantes

Los roles de usuario y los estados de los productos se encuentran centralizados mediante objetos de constantes inmutables.

### Roles de usuario

```text
ADMIN
USER
```

### Estados de producto

```text
AVAILABLE
OUT_OF_STOCK
```

Esto permite evitar strings mágicos repetidos a lo largo del código y centralizar los valores utilizados por el dominio.

## Separación entre Service y Repository

La capa **Service** contiene las reglas y decisiones propias del negocio.

Por ejemplo, determina el estado de un producto según su stock, evita la creación de administradores desde el endpoint común y comprueba si un email ya se encuentra registrado.

La capa **Repository**, en cambio, se ocupa exclusivamente del acceso y persistencia de los datos mediante Mongoose.

Los Repositories encapsulan las consultas a MongoDB y pueden aplicar filtros o proyecciones, como obtener únicamente productos disponibles o excluir la contraseña al consultar usuarios.

De esta manera, la lógica de negocio permanece separada de los detalles relacionados con la base de datos.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Ejecutar en desarrollo con Nodemon |
| `npm start` | Ejecutar la aplicación |

## Información de la entrega

**Curso:** Backend III  
**Alumno:** Lionel Cancellieri  
**Entrega:** Pre-entrega Módulo 1 — Estructura profesional de ShipNow