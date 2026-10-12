# ShipNow API

API backend de ShipNow desarrollada con Node.js, Express y MongoDB.

El proyecto utiliza una arquitectura por capas para separar las responsabilidades de acceso HTTP, lógica de negocio y persistencia de datos.

En el Módulo 2 se incorporó la gestión de pedidos y entregas, junto con un sistema de generación de datos simulados (Mocks) y un proceso de carga de datos de prueba (Seed).

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

Se encarga de recibir las solicitudes, llamar al Service correspondiente y devolver las respuestas HTTP con los códigos de estado adecuados.

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

### Repository

Encapsula las operaciones habituales de acceso a MongoDB mediante Mongoose.

Se encarga de realizar consultas, crear documentos, actualizarlos y eliminarlos.

Por ejemplo, el Repository de usuarios excluye la contraseña de las respuestas de consulta.

### Mocks

El módulo de Mocks genera datos simulados para usuarios, repartidores, pedidos y entregas.

Permite probar la estructura de los datos y sus relaciones sin necesidad de insertarlos en MongoDB.

## Estructura del proyecto

```text
src/
├── config/
├── constants/
├── controllers/
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

Las variables `PORT`, `MONGODB_URI` y `NODE_ENV` son obligatorias para iniciar la aplicación.

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

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Ejecutar en desarrollo con Nodemon |
| `npm start` | Ejecutar la aplicación |

## Información de la entrega

**Curso:** Backend III  
**Entrega:** Pre-entrega Módulo 2 — Mocks y Seed de ShipNow
