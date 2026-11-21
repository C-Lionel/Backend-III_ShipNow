
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

### Repository

Encapsula las operaciones de acceso a MongoDB mediante Mongoose.

Permite consultar, crear, actualizar y eliminar documentos, manteniendo separada la lógica de persistencia.

### Middleware de errores

Centraliza el tratamiento de errores y devuelve respuestas HTTP uniformes.

También registra los errores mediante Winston.

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

tests/
├── config/
│   └── test.setup.js
├── users/
│   └── users.test.js
├── orders/
│   └── orders.test.js
├── deliveries/
│   └── deliveries.test.js
├── mocks/
│   └── mocks.test.js
├── logger/
│   └── logger.test.js
└── swagger/
    └── swagger.test.js
```

Los archivos de logging se generan en la carpeta `logs/`.

## Requisitos

- Node.js 18 o superior.
- npm.
- MongoDB local o MongoDB Atlas.

Para ejecutar el Seed con transacciones, MongoDB debe admitir transacciones, por ejemplo mediante un replica set o un clúster compatible de MongoDB Atlas.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/C-Lionel/Backend-III_ShipNow.git
```

Ingresar al proyecto:

```bash
cd Backend-III_ShipNow
```

Instalar las dependencias:

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

Cada entrega está asociada a un pedido y puede tener un repartidor asignado.

Los repartidores son usuarios con rol `driver`.

No se permite crear más de una entrega para el mismo pedido.

### Mocks

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mocks/users?qty=5` | Generar usuarios simulados |
| GET | `/api/mocks/drivers?qty=5` | Generar repartidores simulados |
| GET | `/api/mocks/orders?qty=5` | Generar pedidos simulados |
| GET | `/api/mocks/deliveries?qty=5` | Generar entregas simuladas |
| POST | `/api/mocks/seed` | Insertar datos simulados en MongoDB |

Los endpoints GET generan datos en memoria y no realizan inserciones en MongoDB.

El parámetro `qty` permite indicar una cantidad entre 1 y 100.

Si no se proporciona, se utiliza 10.

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

También contempla errores de Express y Mongoose.

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

La carpeta `logs/` debe estar excluida mediante `.gitignore`.

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

### Endpoints documentados

| Categoría | Cantidad |
|---|---:|
| Users | 5 |
| Orders | 5 |
| Deliveries | 5 |
| Mocks | 5 |
| Logger | 1 |
| **Total** | **21** |

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
| 500 | Error interno |

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

Se utilizaron las siguientes herramientas:

- **Mocha:** organiza y ejecuta los tests.
- **Chai:** permite realizar aserciones sobre los resultados.
- **Supertest:** ejecuta solicitudes HTTP contra la aplicación Express.
- **cross-env:** configura el entorno de testing de forma compatible con diferentes sistemas operativos.
- **mongodb-memory-server:** inicia una instancia temporal de MongoDB para ejecutar las pruebas sin depender de una base de datos externa.

El objetivo es comprobar que los endpoints devuelvan las respuestas esperadas, que las reglas de negocio funcionen correctamente y que las operaciones de persistencia se ejecuten de manera segura y reproducible.

### Dependencias de testing

Las herramientas de testing están declaradas como dependencias de desarrollo en `package.json`.

Entre ellas se encuentran:

- `mocha`
- `chai`
- `supertest`
- `cross-env`
- `mongodb-memory-server`

Para instalar todas las dependencias del proyecto:

```bash
npm install
```

Para realizar una instalación limpia y reproducible utilizando las versiones registradas en `package-lock.json`:

```bash
npm ci
```

Este último comando instala las dependencias desde cero y permite verificar que el proyecto pueda ejecutarse en otra computadora sin depender de una instalación previa.

Es importante instalar también las dependencias de desarrollo, ya que Mocha, Chai, Supertest y cross-env son necesarias para ejecutar la suite.

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

Esta base se encuentra completamente separada de la base de desarrollo `shipnow`, utilizada por la aplicación mediante MongoDB Atlas.

De esta manera, los tests no modifican los datos reales del entorno de desarrollo.

### MongoDB en memoria

Para mejorar la reproducibilidad de las pruebas se incorporó la librería `mongodb-memory-server`.

Esta herramienta permite iniciar una instancia temporal de MongoDB directamente desde el entorno de testing.

Su funcionamiento es el siguiente:

1. Se ejecuta `npm test`.
2. Mocha carga la configuración de testing.
3. `mongodb-memory-server` inicia una instancia local de MongoDB.
4. Mongoose establece una conexión con esa instancia.
5. Se ejecutan los tests automatizados.
6. Los tests crean y consultan documentos temporales.
7. Al finalizar, Mongoose cierra la conexión.
8. La instancia temporal de MongoDB se detiene y sus datos se descartan.

Este mecanismo evita depender de:

- Credenciales de MongoDB Atlas.
- Una base de datos externa permanentemente disponible.
- Una conexión a internet durante la ejecución de las pruebas, una vez descargado el ejecutable de MongoDB.
- Datos cargados manualmente antes de ejecutar los tests.
- Limpieza manual de colecciones entre ejecuciones.

**Nota:** durante la primera ejecución, `mongodb-memory-server` puede necesitar descargar el ejecutable de MongoDB. Las ejecuciones posteriores pueden reutilizar el ejecutable descargado.

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

La inicialización de MongoDB en memoria dispone de un timeout específico de 120 segundos para contemplar el tiempo necesario durante el primer inicio.

### Configuración de MongoDB para testing

El archivo responsable de preparar el entorno es:

```text
tests/config/test.setup.js
```

Este archivo utiliza los hooks globales de Mocha:

- `before`: inicia MongoDB en memoria y conecta Mongoose.
- `after`: desconecta Mongoose y detiene MongoDB.

La conexión se establece utilizando la URI temporal generada por `MongoMemoryServer`.

Por lo tanto, los tests no necesitan utilizar la variable `MONGODB_URI` de MongoDB Atlas.

### Configuración de la aplicación

El archivo:

```text
src/config/config.js
```

Distingue entre el entorno de testing y los demás entornos.

En desarrollo, la aplicación continúa utilizando las variables definidas en `.env` para conectarse a MongoDB Atlas.

En testing, no se exige una URI externa de MongoDB, ya que la conexión es administrada por `tests/config/test.setup.js`.

Esta separación permite mantener el funcionamiento habitual de ShipNow sin afectar la ejecución de los tests.

### Organización de las pruebas

```text
tests/
├── config/
│   └── test.setup.js
├── users/
│   └── users.test.js
├── orders/
│   └── orders.test.js
├── deliveries/
│   └── deliveries.test.js
├── mocks/
│   └── mocks.test.js
├── logger/
│   └── logger.test.js
└── swagger/
    └── swagger.test.js
```

Cada archivo agrupa las pruebas relacionadas con un recurso o componente de la aplicación.

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

Se comprueba la persistencia de los pedidos en MongoDB y la aplicación de las reglas de negocio.

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

Los tests crean usuarios, pedidos y entregas temporales para comprobar las relaciones entre los documentos y las reglas de negocio.

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

También se verifica que las respuestas no expongan contraseñas.

Los endpoints GET generan datos en memoria sin insertarlos en MongoDB.

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

Se comprueba tanto la integración HTTP como aspectos de la configuración de Winston.

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

| Módulo | Tests | Resultado |
|---|---:|---|
| Users | 10 | Correcto |
| Orders | 14 | Correcto |
| Deliveries | 16 | Correcto |
| Mocks | 13 | Correcto |
| Logger | 4 | Correcto |
| Swagger | 4 | Correcto |
| **Total** | **61** | **61 passing** |

### Ejecución reproducible desde cero

Para ejecutar las pruebas en una computadora nueva, primero se debe clonar el repositorio:

```bash
git clone https://github.com/C-Lionel/Backend-III_ShipNow.git
```

Ingresar a la carpeta del proyecto:

```bash
cd Backend-III_ShipNow
```

Instalar las dependencias utilizando el archivo `package-lock.json`:

```bash
npm ci
```

Ejecutar la suite:

```bash
npm test
```

Resultado esperado:

```text
MongoDB en memoria iniciado para testing

61 passing

MongoDB en memoria detenido
```

No es necesario crear un archivo `.env.test` ni configurar una conexión externa de MongoDB para ejecutar estas pruebas.

### Verificación de ejecuciones consecutivas

Para comprobar que las pruebas son reproducibles, se ejecutó la suite varias veces consecutivas.

También se realizó una instalación limpia de dependencias mediante:

```bash
npm ci
```

Posteriormente se ejecutó:

```bash
npm test
```

Resultado obtenido:

```text
61 passing (2s)
```

Los 61 tests finalizaron correctamente después de reinstalar las dependencias.

Esto permitió comprobar que las herramientas de testing, incluido `cross-env`, se encuentran correctamente declaradas e instaladas.

### Aislamiento y limpieza de datos

La suite utiliza dos mecanismos de aislamiento.

**1. Limpieza mediante hooks**

Los tests que crean documentos utilizan hooks como `beforeEach` y `afterEach` para preparar y eliminar los datos necesarios.

Esto permite que cada prueba trabaje con registros controlados.

**2. MongoDB temporal**

La instancia creada por `mongodb-memory-server` se inicia al comenzar la suite y se detiene al finalizar.

Los datos de esa instancia se descartan automáticamente.

Por lo tanto:

- No es necesario borrar colecciones manualmente.
- No quedan registros persistentes en MongoDB Atlas.
- Los tests pueden ejecutarse repetidamente.
- Cada ejecución comienza con una instancia temporal independiente.
- Los datos de desarrollo permanecen intactos.

Este mecanismo permite mantener las pruebas aisladas y reproducibles.

### Pruebas de errores HTTP

La suite comprueba respuestas de error, incluyendo:

- `400` — Datos inválidos.
- `403` — Operaciones prohibidas.
- `404` — Recursos inexistentes.
- `409` — Conflictos.

También se verifica el formato estandarizado de errores de la API:

```json
{
  "status": "error",
  "message": "Usuario no encontrado",
  "code": "USER_NOT_FOUND"
}
```

Este formato es coherente con el middleware global de errores y la documentación Swagger.

### Verificación explícita de errores 404

Se implementaron pruebas específicas para comprobar que la API devuelve HTTP 404 cuando se solicita un recurso inexistente.

Entre los casos cubiertos se encuentran:

- Obtener un usuario inexistente.
- Obtener un pedido inexistente.
- Actualizar un pedido inexistente.
- Eliminar un pedido inexistente.
- Obtener una entrega inexistente.

Estas pruebas utilizan identificadores válidos de MongoDB que no corresponden a documentos existentes.

De esta manera, se comprueba que la aplicación distingue correctamente entre un identificador inválido y un recurso que no existe.

### Mensajes de Winston durante los tests

Durante la ejecución pueden aparecer mensajes `warning` de Winston.

Estos mensajes corresponden a errores provocados intencionalmente por los tests.

Por ejemplo:

```text
[warning] GET /api/users/... - USER_NOT_FOUND: Usuario no encontrado
```

Estos registros no representan fallos de la suite.

Se utilizan para comprobar que la API responde correctamente ante situaciones de error.

### Beneficios del testing

- Detectar errores automáticamente.
- Verificar las reglas de negocio.
- Comprobar las respuestas HTTP.
- Validar la persistencia de datos.
- Comprobar las restricciones de seguridad.
- Reducir las pruebas manuales repetitivas.
- Facilitar futuras modificaciones del proyecto.
- Detectar regresiones.
- Ejecutar pruebas sin credenciales externas.
- Garantizar el aislamiento de los datos de desarrollo.
- Facilitar la reproducción de los tests en otras computadoras.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm install` | Instalar dependencias |
| `npm ci` | Realizar una instalación limpia y reproducible |
| `npm run dev` | Ejecutar en desarrollo |
| `npm start` | Ejecutar la aplicación |
| `npm test` | Ejecutar los 61 tests con MongoDB en memoria |

## Información de la entrega

**Curso:** Backend III

**Proyecto:** ShipNow API

**Entrega:** Pre-entrega Módulo 6 — Testing automatizado

**Tests implementados:** 61

**Resultado:** 61 passing

**Base de testing:** MongoDB temporal mediante `mongodb-memory-server`

**Instalación verificada:** `npm ci`

**Reproducibilidad:** suite ejecutada correctamente en múltiples ocasiones, sin limpieza manual ni credenciales de MongoDB Atlas.

**Documentación interactiva:** http://localhost:8080/api/docs

**Repositorio:** https://github.com/C-Lionel/Backend-III_ShipNow