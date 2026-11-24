# ShipNow API

API backend de ShipNow desarrollada con Node.js, Express y MongoDB.

El proyecto utiliza una arquitectura por capas para separar las responsabilidades de acceso HTTP, lógica de negocio y persistencia de datos.

## Módulos desarrollados

- **Módulo 1:** Gestión de usuarios y estructura inicial del proyecto.
- **Módulo 2:** Gestión de pedidos, entregas, generación de Mocks y carga de datos mediante Seed.
- **Módulo 3:** Manejo centralizado de errores mediante `AppError`, `ErrorDictionary` y middleware global.
- **Módulo 4:** Logging centralizado con Winston y rotación automática de archivos.
- **Módulo 5:** Documentación interactiva mediante Swagger UI y OpenAPI 3.0.0.
- **Módulo 6:** Testing automatizado mediante Mocha, Chai y Supertest.
- **Módulo 7:** Carga de archivos mediante Multer, validación de documentos, almacenamiento local, persistencia de metadatos y rutas relativas para garantizar la portabilidad del almacenamiento.

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
- Mocha
- Chai
- Supertest
- cross-env
- mongodb-memory-server
- Multer

## Arquitectura

La aplicación utiliza una arquitectura por capas:

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

Recibe las solicitudes HTTP, invoca los Services y devuelve las respuestas correspondientes.

Cuando ocurre un error, lo deriva al middleware global mediante `next(error)`.

### Service

Contiene las reglas de negocio de la aplicación.

Entre sus responsabilidades se encuentran:

- Validar los datos recibidos.
- Verificar la existencia de usuarios y pedidos.
- Controlar los roles permitidos.
- Aplicar bcrypt a las contraseñas.
- Calcular los importes de los pedidos.
- Evitar entregas duplicadas.
- Generar datos simulados.
- Lanzar errores personalizados mediante `AppError`.
- Registrar eventos mediante Winston.
- Validar y registrar documentos asociados a usuarios.
- Registrar comprobantes asociados a entregas.
- Persistir metadatos de archivos en MongoDB.
- Almacenar rutas relativas al directorio `uploads/`.
- Impedir la modificación directa de los arreglos de documentos y comprobantes mediante PUT.
- Intentar eliminar los archivos físicos cuando falla una operación de carga.

### Repository

Encapsula las operaciones de acceso a MongoDB mediante Mongoose.

Permite consultar, crear, actualizar y eliminar documentos, manteniendo separada la lógica de persistencia.

### Middlewares

Los middlewares permiten incorporar funcionalidades transversales a las solicitudes HTTP.

Entre ellos se encuentran:

- Manejo centralizado de errores.
- Procesamiento de archivos mediante Multer.
- Validación de tipos y tamaños de archivos.
- Creación automática de directorios de almacenamiento.
- Normalización de extensiones de archivos.
- Conversión y resolución de rutas de almacenamiento.

## Estructura del proyecto

```text
src/
├── config/
│   └── swagger.config.js
├── constants/
│   └── index.js
├── controllers/
├── docs/
│   ├── schemas.yaml
│   ├── users.yaml
│   ├── orders.yaml
│   ├── deliveries.yaml
│   ├── mocks.yaml
│   └── logger.yaml
├── middlewares/
│   ├── error.middleware.js
│   └── upload.middleware.js
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

tests/
├── config/
│   └── test.setup.js
├── users/
│   ├── users.test.js
│   └── documents.test.js
├── orders/
│   └── orders.test.js
├── deliveries/
│   ├── deliveries.test.js
│   └── proofs.test.js
├── mocks/
│   └── mocks.test.js
├── logger/
│   └── logger.test.js
└── swagger/
    └── swagger.test.js

uploads/
├── temp/
├── user-documents/
├── driver-licenses/
└── delivery-proofs/

logs/
```

Las carpetas `uploads/` y `logs/` contienen archivos generados durante la ejecución y están excluidas del repositorio mediante `.gitignore`.

Los directorios de almacenamiento de archivos se crean automáticamente al inicializar el middleware de carga.

## Requisitos

- Node.js en una versión LTS compatible con las dependencias del proyecto.
- Se recomienda utilizar Node.js 24 LTS.
- npm.
- MongoDB local o MongoDB Atlas para ejecutar la aplicación.

Para ejecutar el Seed con transacciones, MongoDB debe admitir transacciones, por ejemplo mediante un replica set o un clúster compatible de MongoDB Atlas.

Los tests utilizan una instancia temporal de MongoDB mediante `mongodb-memory-server`.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/C-Lionel/Backend-III_ShipNow.git
```

Ingresar al proyecto:

```bash
cd Backend-III_ShipNow
```

Instalar todas las dependencias, incluyendo las dependencias de desarrollo:

```bash
npm install --include=dev
```

También es posible realizar una instalación limpia utilizando las versiones registradas en `package-lock.json`:

```bash
npm ci --include=dev
```

Esta última opción es la recomendada para reproducir el entorno del proyecto en una computadora nueva.

Las dependencias de desarrollo son necesarias para ejecutar la suite de testing.

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=8080
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/shipnow
NODE_ENV=development
```

Las credenciales deben reemplazarse por los datos reales de la conexión.

El archivo `.env` no debe subirse al repositorio.

## Ejecución

Modo desarrollo:

```bash
npm run dev
```

Ejecución normal:

```bash
npm start
```

La API queda disponible en:

```text
http://localhost:8080
```

La documentación Swagger está disponible en:

```text
http://localhost:8080/api/docs
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
| POST | `/api/users/:id/documents` | Cargar un documento de usuario |

El registro público permite crear usuarios con rol `customer`.

Las contraseñas se almacenan utilizando bcrypt y se excluyen de las respuestas de consulta.

Los documentos se cargan mediante solicitudes `multipart/form-data`.

No se permite modificar directamente el arreglo `documents` mediante el endpoint PUT de usuarios.

### Pedidos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/orders` | Listar pedidos |
| POST | `/api/orders` | Crear un pedido |
| GET | `/api/orders/:id` | Obtener un pedido por ID |
| PUT | `/api/orders/:id` | Actualizar un pedido |
| DELETE | `/api/orders/:id` | Eliminar un pedido |

Cada pedido pertenece a un usuario con rol `customer`.

La creación valida la existencia del cliente, su rol y los ítems enviados.

El total se calcula a partir del valor de los ítems y el costo de envío.

No se permite modificar directamente campos protegidos como `customer`, `items`, `total` o `shippingCost`.

### Entregas

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/deliveries` | Listar entregas |
| POST | `/api/deliveries` | Crear una entrega |
| GET | `/api/deliveries/:id` | Obtener una entrega por ID |
| PUT | `/api/deliveries/:id` | Actualizar una entrega |
| DELETE | `/api/deliveries/:id` | Eliminar una entrega |
| POST | `/api/deliveries/:id/proof` | Cargar un comprobante de entrega |

Cada entrega está asociada a un pedido y puede tener un repartidor asignado.

Los repartidores son usuarios con rol `driver`.

No se permite crear más de una entrega para el mismo pedido.

Una entrega puede almacenar múltiples comprobantes en su arreglo `proofs`.

No se permite modificar directamente el arreglo `proofs` mediante el endpoint PUT de entregas.

### Mocks

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mocks/users?qty=5` | Generar usuarios simulados |
| GET | `/api/mocks/drivers?qty=5` | Generar repartidores simulados |
| GET | `/api/mocks/orders?qty=5` | Generar pedidos simulados |
| GET | `/api/mocks/deliveries?qty=5` | Generar entregas simuladas |
| POST | `/api/mocks/seed` | Insertar datos simulados en MongoDB |

Los endpoints GET generan datos en memoria y no realizan inserciones en MongoDB.

El parámetro `qty` permite indicar una cantidad entre 1 y 100. Si no se proporciona, se utiliza 10.

### Logger

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/logger-test` | Generar mensajes de prueba de Winston |

Este endpoint está disponible en los entornos `development` y `test`, pero no en producción.

## Seed de datos simulados

El endpoint `POST /api/mocks/seed` permite insertar datos relacionados en MongoDB.

Ejemplo:

```json
{
  "qty": 2
}
```

Respuesta exitosa:

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

El proceso:

1. Genera clientes y repartidores.
2. Hashea las contraseñas mediante bcrypt.
3. Inserta los usuarios.
4. Genera pedidos asociados a los clientes.
5. Genera entregas asociadas a pedidos y repartidores.
6. Actualiza las referencias entre pedidos y entregas.

Las operaciones se realizan dentro de una transacción de MongoDB.

### Restricciones

- Solo puede ejecutarse con `NODE_ENV=development`.
- La cantidad debe ser un entero entre 1 y 100.
- Una cantidad inválida genera HTTP `400`.
- Un intento fuera de desarrollo genera HTTP `403`.

**Importante:** el Seed modifica la base de datos y debe ejecutarse únicamente en un entorno de desarrollo controlado.

## Constantes

Las constantes del dominio se encuentran centralizadas en `src/constants/index.js`.

### Roles

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

## Manejo centralizado de errores — Módulo 3

La API implementa un sistema centralizado para mantener respuestas HTTP consistentes.

### AppError

Archivo:

```text
src/utils/errors.js
```

Define una clase personalizada que extiende `Error`.

Permite representar errores con:

- `message`
- `statusCode`
- `code`

### ErrorDictionary

Archivo:

```text
src/utils/errorDictionary.js
```

Centraliza los códigos HTTP, mensajes e identificadores de error.

### Middleware global

Archivo:

```text
src/middlewares/error.middleware.js
```

Procesa los errores derivados mediante `next(error)`.

También contempla errores de Express, Mongoose y Multer.

### Formato de respuesta

```json
{
  "status": "error",
  "message": "Usuario no encontrado",
  "code": "USER_NOT_FOUND"
}
```

El código HTTP se establece en la respuesta y no se incluye dentro del JSON.

### Diccionario de errores

| Código | HTTP | Descripción |
|---|---|---|
| `USER_NOT_FOUND` | 404 | Usuario no encontrado |
| `USER_ROLE_FORBIDDEN` | 403 | Rol no permitido |
| `EMAIL_ALREADY_EXISTS` | 409 | Email duplicado |
| `USER_ROLE_UPDATE_FORBIDDEN` | 403 | Modificación de rol no permitida |
| `INVALID_PASSWORD` | 400 | Contraseña inválida |
| `ORDER_NOT_FOUND` | 404 | Pedido inexistente |
| `ORDER_CUSTOMER_NOT_FOUND` | 400 | Cliente inexistente |
| `INVALID_CUSTOMER_ROLE` | 400 | Rol de cliente inválido |
| `ORDER_ITEMS_REQUIRED` | 400 | Pedido sin ítems |
| `ORDER_PROTECTED_FIELDS` | 403 | Modificación de campos protegidos |
| `ORDER_HAS_DELIVERY` | 409 | Pedido con entrega asociada |
| `DELIVERY_NOT_FOUND` | 404 | Entrega inexistente |
| `INVALID_DELIVERY_ID` | 400 | ID de entrega inválido |
| `INVALID_ORDER_ID` | 400 | ID de pedido inválido |
| `DELIVERY_ALREADY_EXISTS` | 409 | Entrega duplicada |
| `INVALID_DRIVER_ID` | 400 | ID de repartidor inválido |
| `INVALID_DRIVER` | 400 | Repartidor inválido |
| `DELIVERY_ORDER_CHANGE_FORBIDDEN` | 400 | Cambio de pedido no permitido |
| `INVALID_MOCK_QUANTITY` | 400 | Cantidad de mocks inválida |
| `SEED_FORBIDDEN` | 403 | Seed no permitido |
| `INVALID_ID` | 400 | Identificador inválido |
| `INVALID_JSON` | 400 | JSON mal formado |
| `VALIDATION_ERROR` | 400 | Error de validación |
| `ROUTE_NOT_FOUND` | 404 | Ruta inexistente |
| `INTERNAL_SERVER_ERROR` | 500 | Error interno |
| `FILE_REQUIRED` | 400 | Archivo obligatorio |
| `INVALID_FILE_TYPE` | 400 | Formato de archivo no permitido |
| `FILE_TOO_LARGE` | 413 | Archivo superior al tamaño máximo |
| `INVALID_FILE_FIELD` | 400 | Campo de archivo incorrecto |
| `INVALID_DOCUMENT_TYPE` | 400 | Tipo de documento inválido |
| `FILE_UPLOAD_ERROR` | 500 | Error durante la carga del archivo |

### Ejemplos de pruebas

Identificador inválido:

```bash
curl -i http://localhost:8080/api/users/123
```

Ruta inexistente:

```bash
curl -i http://localhost:8080/api/ruta-inexistente
```

Cantidad inválida:

```bash
curl -i "http://localhost:8080/api/mocks/users?qty=500"
```

Pedido inexistente:

```bash
curl -i http://localhost:8080/api/orders/000000000000000000000000
```

Estas solicitudes permiten comprobar que el middleware devuelve los errores correspondientes.

## Logging y monitoreo — Módulo 4

Se incorporó Winston para centralizar los registros de la aplicación.

Archivo:

```text
src/utils/logger.js
```

### Niveles personalizados

| Nivel | Prioridad | Descripción |
|---|---:|---|
| `fatal` | 0 | Fallos críticos |
| `error` | 1 | Errores inesperados |
| `warning` | 2 | Errores controlados |
| `info` | 3 | Eventos importantes |
| `http` | 4 | Información HTTP |
| `debug` | 5 | Diagnóstico |

La prioridad numérica más baja representa una mayor gravedad.

### Formato

Los registros incluyen fecha, hora, nivel y mensaje.

Ejemplo:

```text
2026-10-26 15:18:36 [info] Pedido creado correctamente
```

### Configuración por entorno

En `development` y `test` se utiliza el nivel `debug`, permitiendo registrar los seis niveles.

En `production` se utiliza `info`, reduciendo la cantidad de mensajes.

### Transportes

Winston utiliza:

- Consola, para visualizar registros en la terminal.
- DailyRotateFile, para almacenar errores en archivos.

Los archivos se generan en:

```text
logs/error-YYYY-MM-DD.log
```

Configuración de rotación:

- Tamaño máximo: 10 MB.
- Retención: 14 días.
- Niveles almacenados: `error` y `fatal`.

La carpeta `logs/` está excluida mediante `.gitignore`.

### Endpoint de prueba

```http
GET /api/logger-test
```

Ejecuta mensajes de prueba en los seis niveles.

Respuesta:

```json
{
  "status": "success",
  "message": "Prueba de logging ejecutada correctamente"
}
```

El endpoint está habilitado en desarrollo y testing, pero no en producción.

### Integración con errores

El middleware global utiliza Winston para registrar:

- Errores controlados como `warning`.
- Errores inesperados como `error`.

Esto permite conservar información útil sin modificar las respuestas HTTP de la API.

## Documentación Swagger/OpenAPI — Módulo 5

Se incorporó documentación interactiva utilizando:

- swagger-jsdoc
- swagger-ui-express
- OpenAPI 3.0.0
- YAML

### Configuración

Archivo:

```text
src/config/swagger.config.js
```

La documentación se organiza en:

```text
src/docs/
├── schemas.yaml
├── users.yaml
├── orders.yaml
├── deliveries.yaml
├── mocks.yaml
└── logger.yaml
```

### Acceso

Con el servidor iniciado:

```text
http://localhost:8080/api/docs
```

Swagger UI permite:

- Consultar endpoints.
- Revisar parámetros.
- Visualizar cuerpos de solicitud.
- Consultar respuestas HTTP.
- Revisar schemas.
- Ejecutar solicitudes reales mediante `Try it out`.
- Cargar documentos mediante formularios `multipart/form-data`.
- Consultar los metadatos de los archivos cargados.
- Verificar las rutas relativas devueltas por la API.

### Endpoints documentados

| Categoría | Cantidad |
|---|---:|
| Users | 6 |
| Orders | 5 |
| Deliveries | 6 |
| Mocks | 5 |
| Logger | 1 |
| **Total** | **23** |

El endpoint `/api/health` también está disponible, aunque no forma parte de estas cinco categorías.

### Schemas reutilizables

Archivo:

```text
src/docs/schemas.yaml
```

Incluye definiciones como:

- `ErrorResponse`
- `SuccessResponse`
- `User`
- `UserCreate`
- `OrderItem`
- `Order`
- `Delivery`
- `UploadedDocument`

El esquema `UploadedDocument` representa los metadatos de los archivos almacenados.

El campo `path` contiene una ruta relativa al directorio `uploads/`.

Ejemplo de referencia:

```yaml
schema:
  $ref: "#/components/schemas/User"
```

### Documentación de parámetros

Los parámetros de ruta se definen mediante `in: path`.

Los filtros y parámetros de consulta se definen mediante `in: query`.

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

### Documentación de respuestas

Los endpoints incluyen respuestas exitosas y errores.

| HTTP | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Datos inválidos |
| 403 | Operación prohibida |
| 404 | Recurso inexistente |
| 409 | Conflicto |
| 413 | Archivo demasiado grande |
| 500 | Error interno |

Los endpoints de carga de archivos devuelven HTTP `200` cuando el documento o comprobante se asocia correctamente al recurso existente.

### Uso de Swagger UI

1. Ejecutar `npm run dev`.
2. Abrir `http://localhost:8080/api/docs`.
3. Seleccionar una categoría.
4. Desplegar un endpoint.
5. Presionar `Try it out`.
6. Completar los datos.
7. Presionar `Execute`.
8. Revisar la respuesta HTTP.

**Importante:** las operaciones POST, PUT y DELETE pueden modificar MongoDB.

## Testing automatizado — Módulo 6

En el Módulo 6 se incorporó una suite de pruebas automatizadas para verificar el comportamiento de la API ShipNow.

Posteriormente, en el Módulo 7, se agregaron pruebas específicas para la carga de documentos y comprobantes.

Se utilizaron las siguientes herramientas:

- **Mocha:** organiza y ejecuta los tests.
- **Chai:** permite realizar aserciones sobre los resultados.
- **Supertest:** ejecuta solicitudes HTTP contra la aplicación Express.
- **cross-env:** configura el entorno de testing de forma compatible con diferentes sistemas operativos.
- **mongodb-memory-server:** inicia una instancia temporal de MongoDB para ejecutar las pruebas sin depender de una base de datos externa.

### Dependencias de testing

Las herramientas de testing están declaradas como dependencias de desarrollo en `package.json`.

Entre ellas se encuentran:

- `mocha`
- `chai`
- `supertest`
- `cross-env`
- `mongodb-memory-server`

Para instalar todas las dependencias:

```bash
npm install --include=dev
```

Para una instalación limpia y reproducible:

```bash
npm ci --include=dev
```

El parámetro `--include=dev` garantiza que npm incluya las dependencias de desarrollo en la instalación.

Si las dependencias de desarrollo se omiten, el comando `npm test` puede fallar debido a la ausencia de herramientas como `cross-env` o Mocha.

Para verificar las dependencias instaladas:

```bash
npm ls --depth=0
```

Si aparece el error:

```text
cross-env: not found
```

Se recomienda ejecutar:

```bash
npm ci --include=dev
```

Y posteriormente:

```bash
npm test
```

No es necesario instalar las herramientas de testing globalmente ni trasladarlas a las dependencias de producción.

### Configuración del entorno

Los tests se ejecutan utilizando:

```env
NODE_ENV=test
```

El script definido en `package.json` configura automáticamente esta variable mediante `cross-env`.

Durante las pruebas no es necesario configurar credenciales de MongoDB Atlas ni disponer de un archivo `.env.test`.

La base de datos de testing se crea automáticamente mediante `mongodb-memory-server`.

El nombre utilizado para la base temporal es:

```text
shipnow_test
```

Esta base se encuentra separada de la base de desarrollo utilizada por la aplicación mediante MongoDB Atlas.

### MongoDB en memoria

El funcionamiento es el siguiente:

1. Se ejecuta `npm test`.
2. Mocha carga la configuración de testing.
3. `mongodb-memory-server` inicia una instancia local de MongoDB.
4. Mongoose establece una conexión con esa instancia.
5. Se ejecutan los tests automatizados.
6. Los tests crean y consultan documentos temporales.
7. Al finalizar, Mongoose cierra la conexión.
8. La instancia temporal de MongoDB se detiene y sus datos se descartan.

**Nota:** durante la primera ejecución, `mongodb-memory-server` puede necesitar descargar el ejecutable de MongoDB.

### Configuración de Mocha

El script de testing definido en `package.json` es:

```json
{
  "scripts": {
    "test": "cross-env NODE_ENV=test mocha --file tests/config/test.setup.js \"tests/**/*.test.js\" --timeout 10000"
  }
}
```

Este script:

1. Configura `NODE_ENV=test`.
2. Ejecuta Mocha.
3. Carga `tests/config/test.setup.js`.
4. Busca los archivos terminados en `.test.js`.
5. Establece un timeout general de 10 segundos por test.

La inicialización de MongoDB en memoria dispone de un timeout específico de 120 segundos.

### Configuración de MongoDB para testing

Archivo:

```text
tests/config/test.setup.js
```

Utiliza los hooks globales de Mocha:

- `before`: inicia MongoDB en memoria y conecta Mongoose.
- `after`: desconecta Mongoose y detiene MongoDB.

### Organización de las pruebas

```text
tests/
├── config/
│   └── test.setup.js
├── users/
│   ├── users.test.js
│   └── documents.test.js
├── orders/
│   └── orders.test.js
├── deliveries/
│   ├── deliveries.test.js
│   └── proofs.test.js
├── mocks/
│   └── mocks.test.js
├── logger/
│   └── logger.test.js
└── swagger/
    └── swagger.test.js
```

### Tests de Users

Archivo:

```text
tests/users/users.test.js
```

Se implementaron **10 tests**.

Se verifica:

1. Obtener el listado de usuarios.
2. Devolver HTTP 404 para un usuario inexistente.
3. Registrar un usuario correctamente.
4. Rechazar emails duplicados.
5. Obtener un usuario existente por ID.
6. Actualizar un usuario.
7. Eliminar un usuario.
8. Impedir modificar el rol.
9. Rechazar contraseñas vacías.
10. Impedir registrar usuarios con rol administrador.

Las pruebas también verifican el almacenamiento seguro de contraseñas mediante bcrypt y la ausencia de contraseñas en las respuestas.

### Tests de Orders

Archivo:

```text
tests/orders/orders.test.js
```

Se implementaron **14 tests**.

Se verifica:

1. Obtener el listado de pedidos.
2. Devolver HTTP 404 para un pedido inexistente.
3. Crear un pedido correctamente.
4. Calcular los importes del pedido.
5. Asignar valores predeterminados.
6. Consultar un pedido existente por ID.
7. Actualizar el estado de un pedido.
8. Eliminar un pedido.
9. Rechazar pedidos sin ítems.
10. Rechazar clientes inexistentes.
11. Rechazar usuarios sin rol `customer`.
12. Impedir modificar campos protegidos.
13. Devolver HTTP 404 al actualizar un pedido inexistente.
14. Devolver HTTP 404 al eliminar un pedido inexistente.

### Tests de Deliveries

Archivo:

```text
tests/deliveries/deliveries.test.js
```

Se implementaron **16 tests funcionales**.

Se verifica:

1. Obtener el listado de entregas.
2. Crear una entrega sin repartidor.
3. Crear una entrega con repartidor.
4. Asignar prioridad `normal` por defecto.
5. Permitir prioridad `high`.
6. Relacionar correctamente la entrega con su pedido.
7. Obtener una entrega existente por ID.
8. Actualizar el estado de una entrega.
9. Asignar un repartidor a una entrega existente.
10. Eliminar una entrega y desvincularla del pedido.
11. Rechazar una entrega con ID de pedido inválido.
12. Rechazar una entrega con pedido inexistente.
13. Impedir crear dos entregas para el mismo pedido.
14. Rechazar un usuario que no tenga rol `driver`.
15. Impedir cambiar el pedido asociado a una entrega.
16. Devolver HTTP 404 para una entrega inexistente.

### Tests de Mocks

Archivo:

```text
tests/mocks/mocks.test.js
```

Se implementaron **13 tests**.

Se verifica:

1. Generar 10 usuarios por defecto.
2. Generar una cantidad personalizada de usuarios.
3. Generar repartidores correctamente.
4. Generar 10 repartidores por defecto.
5. Generar pedidos simulados.
6. Generar 10 pedidos por defecto.
7. Generar entregas simuladas.
8. Generar 10 entregas por defecto.
9. Rechazar cantidades iguales a cero.
10. Rechazar cantidades superiores a 100.
11. Rechazar cantidades decimales.
12. Rechazar cantidades no numéricas.
13. Impedir ejecutar el Seed en testing.

### Tests de Logger

Archivo:

```text
tests/logger/logger.test.js
```

Se implementaron **4 tests**.

Se verifica:

1. La respuesta exitosa del endpoint `/api/logger-test`.
2. La configuración de los seis niveles personalizados de Winston.
3. La utilización del nivel `debug` durante testing.
4. La existencia del transporte de consola.

### Tests de Swagger

Archivo:

```text
tests/swagger/swagger.test.js
```

Se implementaron **4 tests**.

Se verifica:

1. La disponibilidad de Swagger UI.
2. La carga de recursos estáticos de Swagger.
3. La existencia de información general de la API.
4. La documentación de las rutas de usuarios y pedidos.

### Resumen de pruebas

| Módulo | Tests |
|---|---:|
| Users | 10 |
| Orders | 14 |
| Deliveries | 16 |
| Mocks | 13 |
| Logger | 4 |
| Swagger | 4 |
| **Total Módulo 6** | **61** |

Los tests del Módulo 7 se detallan en la siguiente sección.

## Carga de archivos con Multer — Módulo 7

En el Módulo 7 se incorporó la funcionalidad de carga de archivos para usuarios y entregas mediante Multer.

Esta funcionalidad permite almacenar archivos localmente y registrar sus metadatos en MongoDB.

### Objetivos

- Permitir subir documentos asociados a usuarios.
- Permitir subir licencias de conducir.
- Permitir subir comprobantes asociados a entregas.
- Validar los formatos permitidos.
- Limitar el tamaño máximo de los archivos.
- Generar nombres únicos.
- Normalizar las extensiones de los archivos.
- Organizar los archivos por categorías.
- Crear automáticamente los directorios de almacenamiento.
- Persistir metadatos en MongoDB.
- Almacenar rutas relativas y portables.
- Proteger los arreglos de documentos y comprobantes frente a modificaciones directas mediante PUT.
- Limpiar archivos cuando falla una operación de carga.
- Centralizar el manejo de errores.
- Documentar los endpoints en Swagger.
- Incorporar tests automatizados.

### Dependencia principal

Se incorporó Multer:

```bash
npm install multer
```

Multer permite procesar solicitudes HTTP con contenido `multipart/form-data`.

La dependencia se encuentra declarada en `package.json`, por lo que no es necesario instalarla individualmente después de clonar el proyecto.

### Configuración centralizada

Archivo:

```text
src/middlewares/upload.middleware.js
```

El middleware centraliza la configuración de almacenamiento, validaciones y límites de tamaño.

Utiliza `multer.diskStorage()` para guardar los archivos en el sistema de archivos local.

### Carpetas de almacenamiento

```text
uploads/
├── temp/
├── user-documents/
├── driver-licenses/
└── delivery-proofs/
```

Cada carpeta cumple una función:

| Carpeta | Descripción |
|---|---|
| `temp/` | Almacenamiento temporal de documentos |
| `user-documents/` | Documentos generales de usuarios |
| `driver-licenses/` | Licencias de conducir |
| `delivery-proofs/` | Comprobantes de entregas |

Los archivos de usuarios se reciben inicialmente en `temp/` y posteriormente se trasladan a su carpeta definitiva según el tipo de documento.

### Creación automática de directorios

Los directorios de almacenamiento se crean automáticamente al inicializar el middleware.

Para ello se utiliza:

```javascript
fs.mkdirSync(directory, {
  recursive: true
});
```

La opción `recursive: true` permite crear los directorios necesarios aunque sus carpetas superiores todavía no existan.

Esto permite:

- Ejecutar el proyecto después de clonarlo sin crear carpetas manualmente.
- Evitar errores por directorios inexistentes.
- Facilitar la instalación en diferentes computadoras.
- Mantener los archivos generados fuera del repositorio.

La creación automática de directorios también forma parte de las verificaciones automatizadas del módulo.

### Formatos permitidos

Se aceptan los siguientes tipos:

| Formato | Extensiones | MIME |
|---|---|---|
| PDF | `.pdf` | `application/pdf` |
| JPG/JPEG | `.jpg`, `.jpeg` | `image/jpeg` |
| PNG | `.png` | `image/png` |
| WebP | `.webp` | `image/webp` |

El middleware valida la extensión y el tipo MIME declarado del archivo.

Los archivos con formatos no permitidos generan un error HTTP `400` con código `INVALID_FILE_TYPE`.

### Normalización de extensiones

El middleware acepta extensiones en mayúsculas, minúsculas o combinaciones de ambas.

Ejemplos válidos:

```text
documento.pdf
DOCUMENTO.PDF
imagen.PNG
licencia.JpG
comprobante.WEBP
```

La extensión se normaliza mediante:

```javascript
path.extname(file.originalname).toLowerCase();
```

Esta normalización se aplica durante la validación y durante la generación del nombre de almacenamiento.

El nombre original se conserva en el campo `originalName`.

El nombre generado para el almacenamiento utiliza la extensión en minúsculas.

Ejemplo:

```text
Nombre original: DOCUMENTO.PDF
Nombre almacenado: 390f9446-1a84-4294-b0cd-51120118d839.pdf
```

### Tamaño máximo

El tamaño máximo permitido es:

```text
5 MB por archivo
5.242.880 bytes
```

La configuración utiliza:

```javascript
5 * 1024 * 1024
```

Se permite un archivo por solicitud.

Los archivos que superan este límite generan:

```text
HTTP 413
FILE_TOO_LARGE
```

### Nombres únicos

Para evitar colisiones entre archivos, se utiliza `randomUUID()`.

Ejemplo:

```text
390f9446-1a84-4294-b0cd-51120118d839.png
```

Se conserva el tipo de extensión del archivo original, normalizado a minúsculas.

Esto permite almacenar archivos con nombres originales repetidos sin sobrescribir archivos existentes.

### Documentos de usuarios

Endpoint:

```http
POST /api/users/:id/documents
```

Tipo de contenido:

```text
multipart/form-data
```

Campos:

| Campo | Tipo | Descripción |
|---|---|---|
| `documentType` | Text | Tipo de documento |
| `document` | File | Archivo adjunto |

Valores admitidos para `documentType`:

```text
user_document
driver_license
```

Ejemplo de solicitud mediante cURL:

```bash
curl -X POST "http://localhost:8080/api/users/ID_DEL_USUARIO/documents" \
  -F "documentType=user_document" \
  -F "document=@documento.pdf"
```

Ejemplo de carga de una licencia:

```bash
curl -X POST "http://localhost:8080/api/users/ID_DEL_USUARIO/documents" \
  -F "documentType=driver_license" \
  -F "document=@licencia.pdf"
```

El servicio verifica la existencia del usuario y registra los metadatos del documento en el arreglo `documents`.

Los documentos generales se almacenan en:

```text
uploads/user-documents/
```

Las licencias se almacenan en:

```text
uploads/driver-licenses/
```

El proceso de carga:

1. Multer recibe el archivo.
2. Valida la extensión, el tipo MIME declarado y el tamaño.
3. Genera un nombre único.
4. Almacena temporalmente el archivo.
5. El servicio valida el tipo de documento.
6. Verifica el identificador y la existencia del usuario.
7. Traslada el archivo a su carpeta definitiva.
8. Genera la ruta relativa de almacenamiento.
9. Registra los metadatos en MongoDB.
10. Devuelve el usuario actualizado con HTTP `200`.

### Comprobantes de entregas

Endpoint:

```http
POST /api/deliveries/:id/proof
```

Tipo de contenido:

```text
multipart/form-data
```

Campo requerido:

| Campo | Tipo | Descripción |
|---|---|---|
| `proof` | File | Comprobante de entrega |

Ejemplo de solicitud mediante cURL:

```bash
curl -X POST "http://localhost:8080/api/deliveries/ID_DE_LA_ENTREGA/proof" \
  -F "proof=@comprobante.png"
```

Los archivos se almacenan en:

```text
uploads/delivery-proofs/
```

Los metadatos se incorporan al arreglo `proofs` de la entrega.

Una entrega puede almacenar varios comprobantes.

La carga de comprobantes no modifica automáticamente el estado de la entrega.

La operación exitosa devuelve HTTP `200` junto con la entrega actualizada.

### Persistencia de metadatos

Los archivos se almacenan físicamente en el servidor.

MongoDB conserva los metadatos asociados a cada archivo.

Los campos registrados incluyen:

| Campo | Descripción |
|---|---|
| `originalName` | Nombre original del archivo |
| `fileName` | Nombre único generado |
| `path` | Ruta relativa al directorio `uploads/` |
| `mimeType` | Tipo MIME |
| `size` | Tamaño en bytes |
| `documentType` | Categoría del documento |
| `uploadedAt` | Fecha de carga |

Estos metadatos se incorporan a los modelos:

```text
src/models/user.model.js
src/models/delivery.model.js
```

Los documentos de usuarios se almacenan en `documents`.

Los comprobantes de entregas se almacenan en `proofs`.

Ejemplo de metadatos de un documento:

```json
{
  "originalName": "documento.pdf",
  "fileName": "550e8400-e29b-41d4-a716-446655440000.pdf",
  "path": "user-documents/550e8400-e29b-41d4-a716-446655440000.pdf",
  "mimeType": "application/pdf",
  "size": 245760,
  "documentType": "user_document",
  "uploadedAt": "2026-11-24T13:00:00.000Z"
}
```

### Rutas relativas y portabilidad

Los metadatos de los nuevos archivos se almacenan utilizando rutas relativas al directorio principal `uploads/`.

Anteriormente, las rutas incluían la ubicación absoluta del archivo dentro del sistema operativo.

Ejemplo de una ruta absoluta:

```text
C:\Users\Usuario\Proyecto\uploads\user-documents\documento.pdf
```

Este formato depende de la ubicación física del proyecto y del sistema operativo utilizado.

El formato actual utiliza rutas relativas:

```text
user-documents/documento.pdf
driver-licenses/licencia.pdf
delivery-proofs/comprobante.png
```

Las rutas almacenadas no incluyen:

- La letra de la unidad de almacenamiento.
- El nombre del usuario del sistema operativo.
- La ubicación absoluta del proyecto.
- El prefijo `uploads/`.

Además, se utilizan separadores `/` independientemente del sistema operativo.

Esto permite:

- Mejorar la portabilidad entre Windows, Linux y macOS.
- Trasladar el proyecto a diferentes directorios.
- Evitar almacenar información innecesaria del entorno local.
- Mantener los metadatos independientes de la ubicación física del proyecto.

Para conservar el acceso a los archivos al trasladar el proyecto, también debe trasladarse el contenido correspondiente del directorio `uploads/`.

### Funciones auxiliares de almacenamiento

El middleware centraliza las operaciones relacionadas con las rutas mediante funciones auxiliares.

Archivo:

```text
src/middlewares/upload.middleware.js
```

#### getRelativeUploadPath

Convierte una ruta absoluta del sistema de archivos en una ruta relativa al directorio `uploads/`.

También normaliza los separadores para mantener un formato consistente entre sistemas operativos.

#### resolveUploadPath

Resuelve una ruta almacenada a su ubicación absoluta dentro del directorio `uploads/`.

Permite utilizar los metadatos persistidos para realizar operaciones sobre los archivos físicos.

Las funciones verifican que las rutas resueltas permanezcan, a nivel de ruta, dentro del directorio de almacenamiento.

Las rutas que intentan salir de dicho directorio son rechazadas mediante un error de validación.

### Compatibilidad con registros anteriores

La modificación del formato de almacenamiento se aplica a los nuevos archivos cargados.

Los documentos registrados antes de esta actualización pueden conservar rutas absolutas en MongoDB.

Estos registros no se modifican automáticamente.

En caso de trasladar datos existentes a otro entorno, puede ser necesario realizar una migración de sus metadatos y copiar los archivos físicos correspondientes.

### Protección de documentos y comprobantes

Los arreglos `documents` y `proofs` contienen metadatos generados durante el proceso de carga.

Para evitar modificaciones directas de estos campos, los servicios rechazan solicitudes PUT que intenten reemplazar dichos arreglos.

Ejemplo de solicitud no permitida:

```http
PUT /api/users/:id
```

```json
{
  "documents": []
}
```

Ejemplo de solicitud no permitida para entregas:

```http
PUT /api/deliveries/:id
```

```json
{
  "proofs": []
}
```

Estas operaciones generan:

```text
HTTP 400
VALIDATION_ERROR
```

Los endpoints específicos de carga son los mecanismos previstos para asociar nuevos archivos a usuarios y entregas.

Las pruebas automatizadas verifican que los metadatos existentes permanezcan intactos después de estas solicitudes rechazadas.

### Limpieza de archivos ante errores

Si una operación falla después de que Multer recibe el archivo, el servicio intenta eliminar el archivo físico generado.

Esto contempla situaciones como:

- Usuario inexistente.
- Entrega inexistente.
- Identificador inválido.
- Tipo de documento inválido.
- Error durante la persistencia de metadatos.

Para eliminar el archivo se utiliza su ruta física proporcionada por Multer.

Esta ruta es independiente de la ruta relativa persistida en MongoDB.

Si la eliminación falla, el error de limpieza se registra mediante Winston.

El objetivo es reducir la acumulación de archivos huérfanos y mantener la consistencia entre el almacenamiento local y MongoDB.

### Manejo de errores

El middleware global transforma los errores de carga en respuestas HTTP consistentes.

| Código | HTTP | Descripción |
|---|---|---|
| `FILE_REQUIRED` | 400 | No se adjuntó un archivo |
| `INVALID_FILE_TYPE` | 400 | Formato no permitido |
| `FILE_TOO_LARGE` | 413 | Archivo demasiado grande |
| `INVALID_FILE_FIELD` | 400 | Nombre del campo incorrecto |
| `INVALID_DOCUMENT_TYPE` | 400 | Tipo de documento inválido |
| `VALIDATION_ERROR` | 400 | Error de validación |
| `INVALID_ID` | 400 | Identificador de usuario inválido |
| `INVALID_DELIVERY_ID` | 400 | Identificador de entrega inválido |
| `USER_NOT_FOUND` | 404 | Usuario inexistente |
| `DELIVERY_NOT_FOUND` | 404 | Entrega inexistente |
| `FILE_UPLOAD_ERROR` | 500 | Error de carga |

Ejemplo:

```json
{
  "status": "error",
  "message": "Es obligatorio adjuntar un archivo",
  "code": "FILE_REQUIRED"
}
```

### Integración con Winston

Las cargas exitosas generan registros informativos.

Ejemplo:

```text
[info] Documento cargado correctamente
```

Los errores controlados se registran con nivel `warning`.

Los errores inesperados y los fallos durante la limpieza de archivos se registran con nivel `error`.

Esto permite mantener un registro de las operaciones realizadas.

### Documentación Swagger

Se actualizaron:

```text
src/docs/users.yaml
src/docs/deliveries.yaml
src/docs/schemas.yaml
```

Los endpoints utilizan el tipo de contenido:

```yaml
multipart/form-data
```

Los archivos se representan mediante:

```yaml
type: string
format: binary
```

Se incorporó el esquema reutilizable:

```text
UploadedDocument
```

La documentación incluye:

- Formatos de archivos permitidos.
- Tamaño máximo de 5 MB.
- Normalización de extensiones.
- Creación automática de directorios.
- Rutas relativas de almacenamiento.
- Respuestas HTTP exitosas.
- Respuestas de error.
- Metadatos asociados a los archivos.
- Limpieza de archivos ante errores.

La documentación permite probar la carga de archivos directamente desde Swagger UI.

### Pruebas manuales mediante Swagger

Para verificar manualmente la funcionalidad:

1. Ejecutar `npm run dev`.
2. Abrir `http://localhost:8080/api/docs`.
3. Obtener el ID de un usuario existente mediante `GET /api/users`.
4. Desplegar `POST /api/users/{id}/documents`.
5. Presionar `Try it out`.
6. Completar el identificador del usuario.
7. Seleccionar `user_document` como tipo de documento.
8. Adjuntar un archivo permitido.
9. Presionar `Execute`.
10. Verificar el código HTTP y los metadatos devueltos.

Para probar comprobantes de entregas se utiliza el endpoint:

```http
POST /api/deliveries/{id}/proof
```

### Casos de verificación manual

| Caso | HTTP esperado | Resultado esperado |
|---|---:|---|
| Archivo permitido de hasta 5 MB | 200 | Carga exitosa |
| Archivo con extensión no permitida | 400 | `INVALID_FILE_TYPE` |
| Solicitud sin archivo | 400 | `FILE_REQUIRED` |
| Tipo de documento inválido | 400 | `INVALID_DOCUMENT_TYPE` |
| Archivo superior a 5 MB | 413 | `FILE_TOO_LARGE` |
| Usuario inexistente | 404 | `USER_NOT_FOUND` |
| Entrega inexistente | 404 | `DELIVERY_NOT_FOUND` |

Durante la verificación manual posterior a las correcciones se comprobó:

- Carga exitosa de un archivo JPG mediante Swagger.
- Respuesta HTTP `200`.
- Persistencia de metadatos en el usuario.
- Utilización de rutas relativas en los nuevos archivos.
- Rechazo de un archivo TXT.
- Respuesta HTTP `400` con código `INVALID_FILE_TYPE`.

El caso de archivos superiores a 5 MB se encuentra contemplado en la suite automatizada.

### Tests automatizados de documentos

Archivo:

```text
tests/users/documents.test.js
```

Las pruebas verifican:

1. Subir un documento de usuario correctamente.
2. Subir una licencia de conducir correctamente.
3. Rechazar una carga sin archivo.
4. Rechazar un tipo de documento inválido.
5. Rechazar formatos no permitidos.
6. Rechazar archivos superiores a 5 MB.
7. Devolver HTTP 404 para usuarios inexistentes.
8. Rechazar nombres de campo incorrectos.
9. Rechazar identificadores inválidos.
10. Impedir modificar documentos mediante PUT.
11. Aceptar extensiones en mayúsculas y normalizar el nombre de almacenamiento.

Las pruebas de carga exitosa también verifican:

- La existencia física del archivo.
- La persistencia de sus metadatos.
- La carpeta de almacenamiento correspondiente.
- La utilización de rutas relativas.
- La resolución de las rutas almacenadas.

### Tests automatizados de comprobantes

Archivo:

```text
tests/deliveries/proofs.test.js
```

Se implementaron **10 tests**.

Se verifica:

1. Subir un comprobante correctamente.
2. Permitir varios comprobantes por entrega.
3. Conservar el estado de la entrega.
4. Rechazar cargas sin archivo.
5. Rechazar formatos no permitidos.
6. Rechazar archivos superiores a 5 MB.
7. Devolver HTTP 404 para entregas inexistentes.
8. Rechazar nombres de campo incorrectos.
9. Rechazar identificadores inválidos.
10. Impedir modificar comprobantes mediante PUT.

Las pruebas también verifican la existencia física de los archivos, sus metadatos y la utilización de rutas relativas.

### Test de creación automática de directorios

Se incorporó una prueba específica para comprobar que los directorios necesarios se crean automáticamente cuando todavía no existen.

La prueba permite verificar el funcionamiento de la inicialización del almacenamiento sin depender de la creación manual de carpetas.

Los directorios contemplados son:

```text
uploads/temp/
uploads/user-documents/
uploads/driver-licenses/
uploads/delivery-proofs/
```

### Resumen de tests del Módulo 7

| Componente | Tests |
|---|---:|
| Documentos de usuarios | 11 |
| Comprobantes de entregas | 10 |
| Creación automática de directorios | 1 |
| **Total Módulo 7** | **22** |

### Resultado general de testing

| Módulo | Tests |
|---|---:|
| Users | 10 |
| Orders | 14 |
| Deliveries | 16 |
| Mocks | 13 |
| Logger | 4 |
| Swagger | 4 |
| User Documents | 11 |
| Delivery Proofs | 10 |
| Creación automática de directorios | 1 |
| **Total** | **83** |

Para ejecutar todos los tests:

```bash
npm test
```

Resultado esperado:

```text
83 passing
```

Los mensajes `warning` que aparecen durante las pruebas pueden corresponder a errores provocados intencionalmente para verificar el comportamiento de la API.

El resultado final de Mocha permite determinar si todas las pruebas finalizaron correctamente.

### Limpieza de archivos durante testing

Los tests de carga crean archivos temporales para verificar su almacenamiento.

Mediante los hooks correspondientes se eliminan los archivos generados durante las pruebas.

Las rutas relativas almacenadas en los metadatos se resuelven a rutas físicas para verificar y eliminar los archivos.

También se eliminan los documentos temporales de MongoDB.

Esto permite ejecutar las pruebas repetidamente y reducir la acumulación de archivos de testing.

### Seguridad y consideraciones

- Los archivos tienen un tamaño máximo permitido.
- Se permite un archivo por solicitud.
- Se restringen las extensiones y tipos MIME declarados.
- Las extensiones se normalizan a minúsculas.
- Los nombres de almacenamiento se generan mediante UUID.
- Los documentos se organizan en carpetas específicas.
- Los directorios se crean automáticamente.
- Los archivos cargados no se incluyen en GitHub.
- Los errores se gestionan mediante el middleware global.
- Los metadatos se almacenan en MongoDB.
- Las nuevas rutas persistidas son relativas.
- Se valida que las rutas resueltas permanezcan dentro del directorio de almacenamiento.
- Se rechaza la modificación directa de los arreglos `documents` y `proofs` mediante PUT.
- Se intenta eliminar el archivo físico cuando falla una operación de carga.

Para un entorno de producción se recomienda incorporar:

- Validación del contenido real de los archivos.
- Análisis de archivos potencialmente maliciosos.
- Controles de autenticación y autorización.
- Políticas de acceso a los documentos.
- Protección adicional frente a manipulaciones de rutas y enlaces simbólicos.
- Políticas de eliminación y retención de archivos.
- Copias de seguridad de archivos y metadatos.
- Almacenamiento externo especializado cuando sea necesario.

## Ejecución reproducible desde cero

Para ejecutar las pruebas en una computadora nueva:

Clonar el repositorio:

```bash
git clone https://github.com/C-Lionel/Backend-III_ShipNow.git
```

Ingresar al proyecto:

```bash
cd Backend-III_ShipNow
```

Instalar todas las dependencias, incluyendo las de desarrollo:

```bash
npm ci --include=dev
```

Ejecutar la suite:

```bash
npm test
```

Resultado esperado:

```text
83 passing
```

No es necesario crear un archivo `.env.test` ni configurar una conexión externa de MongoDB para ejecutar estas pruebas.

Tampoco es necesario crear manualmente las carpetas de almacenamiento de archivos.

### Aislamiento y limpieza de datos

La suite utiliza dos mecanismos de aislamiento.

**1. Limpieza mediante hooks**

Los tests utilizan hooks como `before`, `beforeEach`, `afterEach` y `after` para preparar y eliminar los datos necesarios.

Las pruebas de carga también contemplan la limpieza de los archivos físicos generados.

**2. MongoDB temporal**

La instancia creada por `mongodb-memory-server` se inicia al comenzar la suite y se detiene al finalizar.

Los datos de esa instancia se descartan automáticamente.

De esta manera:

- No es necesario borrar colecciones manualmente.
- Las pruebas no necesitan utilizar MongoDB Atlas.
- Los tests pueden ejecutarse repetidamente.
- Cada ejecución comienza con una instancia temporal independiente.
- Los datos de desarrollo permanecen separados de los datos de testing.

### Pruebas de errores HTTP

La suite comprueba respuestas de error, incluyendo:

- `400` — Datos inválidos.
- `403` — Operaciones prohibidas.
- `404` — Recursos inexistentes.
- `409` — Conflictos.
- `413` — Archivos demasiado grandes.

### Mensajes de Winston durante los tests

Durante la ejecución pueden aparecer mensajes `warning` de Winston.

Estos mensajes pueden corresponder a errores provocados intencionalmente por los tests.

Por sí solos, no representan fallos de la suite.

### Beneficios del testing

- Detectar errores automáticamente.
- Verificar las reglas de negocio.
- Comprobar las respuestas HTTP.
- Validar la persistencia de datos.
- Comprobar restricciones de seguridad.
- Reducir pruebas manuales repetitivas.
- Facilitar futuras modificaciones.
- Detectar regresiones.
- Ejecutar pruebas sin credenciales externas.
- Mantener aislados los datos de desarrollo.
- Facilitar la reproducción de pruebas en otras computadoras.
- Verificar la portabilidad de las rutas de almacenamiento.
- Comprobar la creación automática de directorios.

## Exclusión de archivos mediante Git

El proyecto utiliza `.gitignore` para evitar incorporar archivos innecesarios o sensibles al repositorio.

Configuración:

```gitignore
node_modules
npm-debug.log*
.DS_Store
.env
.env.test
/logs/
/uploads/
```

Esto evita incluir:

- Dependencias instaladas.
- Variables de entorno.
- Registros de Winston.
- Documentos y comprobantes cargados.
- Archivos temporales del sistema.

La regla `/uploads/` excluye el directorio completo y todas sus subcarpetas:

```text
uploads/temp/
uploads/user-documents/
uploads/driver-licenses/
uploads/delivery-proofs/
```

No es necesario agregar una regla independiente para `uploads/temp/`, ya que se encuentra incluida dentro del directorio excluido.

### Verificación de archivos excluidos

Para comprobar que los archivos sensibles y generados no se encuentran registrados en el índice de Git:

```bash
git ls-files -- uploads temp logs .env .env.test node_modules
```

Si el comando no devuelve resultados, no existen archivos registrados en Git dentro de las rutas consultadas.

Para comprobar que los archivos temporales se encuentran correctamente excluidos:

```bash
git check-ignore -v uploads/temp/prueba.pdf
```

Resultado esperado:

```text
.gitignore:7:/uploads/ uploads/temp/prueba.pdf
```

Estas verificaciones fueron realizadas durante la revisión posterior a la Pre-entrega 7.

Los archivos generados durante la ejecución permanecen almacenados localmente y no forman parte del código fuente.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm install --include=dev` | Instalar dependencias incluyendo las de desarrollo |
| `npm ci --include=dev` | Realizar una instalación limpia y reproducible |
| `npm ls --depth=0` | Verificar las dependencias instaladas |
| `npm run dev` | Ejecutar en desarrollo |
| `npm start` | Ejecutar la aplicación |
| `npm test` | Ejecutar la suite de tests con MongoDB en memoria |

## Mejoras posteriores a la Pre-entrega 7

A partir de la revisión de la entrega se incorporaron mejoras orientadas a la portabilidad, la documentación y la reproducibilidad del proyecto.

### Portabilidad del almacenamiento

- Reemplazo de rutas absolutas por rutas relativas al directorio `uploads/` en los nuevos metadatos.
- Normalización de separadores de rutas.
- Centralización de funciones auxiliares para convertir y resolver rutas.
- Adaptación de las pruebas de almacenamiento y limpieza.

### Validación de archivos

- Verificación de extensiones en mayúsculas y minúsculas.
- Normalización de extensiones en los nombres generados.
- Incorporación de pruebas específicas para extensiones en mayúsculas.
- Verificación de la creación automática de directorios.

### Protección de metadatos

- Restricción de modificaciones directas del arreglo `documents` mediante PUT.
- Restricción de modificaciones directas del arreglo `proofs` mediante PUT.
- Pruebas automatizadas para verificar ambas restricciones.

### Documentación

- Actualización del esquema `UploadedDocument`.
- Actualización de los ejemplos de rutas relativas.
- Documentación de la creación automática de carpetas.
- Documentación de la normalización de extensiones.
- Documentación de respuestas HTTP y errores de carga.
- Actualización de las instrucciones de instalación y testing.

### Reproducibilidad

- Instalación explícita de dependencias de desarrollo mediante `--include=dev`.
- Verificación de las dependencias instaladas.
- Verificación de las reglas de `.gitignore`.
- Comprobación de la exclusión de archivos temporales.
- Verificación manual de cargas válidas e inválidas mediante Swagger UI.

Estas mejoras mantienen la arquitectura y las funcionalidades desarrolladas en los módulos anteriores.

## Información de la entrega

**Curso:** Backend III

**Proyecto:** ShipNow API

**Entrega:** Pre-entrega Módulo 7 — Carga de archivos con Multer, incluyendo mejoras posteriores a la revisión.

**Funcionalidades incorporadas:**

- Carga de documentos de usuarios.
- Carga de licencias de conducir.
- Carga de comprobantes de entregas.
- Validación de formatos y tamaños.
- Normalización de extensiones.
- Almacenamiento local organizado.
- Creación automática de directorios.
- Persistencia de metadatos en MongoDB.
- Almacenamiento de rutas relativas.
- Protección de metadatos frente a modificaciones directas mediante PUT.
- Limpieza de archivos ante errores.
- Manejo centralizado de errores.
- Integración con Winston.
- Documentación Swagger.
- Testing automatizado.

**Tests previstos en la suite actualizada:** 83

**Tests correspondientes a los módulos anteriores:** 61

**Tests correspondientes al Módulo 7:** 22

**Resultado esperado:** 83 passing

**Base de testing:** MongoDB temporal mediante `mongodb-memory-server`.

**Instalación:** Dependencias administradas mediante npm y `package-lock.json`.

**Documentación interactiva:** http://localhost:8080/api/docs

**Repositorio:** https://github.com/C-Lionel/Backend-III_ShipNow