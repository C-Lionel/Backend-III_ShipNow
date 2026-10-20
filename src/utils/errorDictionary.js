export const ErrorDictionary = {
  USER_NOT_FOUND: {
    statusCode: 404,
    message: "Usuario no encontrado",
    code: "USER_NOT_FOUND"
  },

  USER_ROLE_FORBIDDEN: {
    statusCode: 403,
    message: "Solo se permite registrar usuarios con rol customer",
    code: "USER_ROLE_FORBIDDEN"
  },

  EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    message: "Este email ya se encuentra registrado",
    code: "EMAIL_ALREADY_EXISTS"
  },

  USER_ROLE_UPDATE_FORBIDDEN: {
    statusCode: 403,
    message: "No está permitido modificar el rol de un usuario",
    code: "USER_ROLE_UPDATE_FORBIDDEN"
  },

  INVALID_PASSWORD: {
    statusCode: 400,
    message: "La contraseña no puede estar vacía",
    code: "INVALID_PASSWORD"
  },

  ORDER_NOT_FOUND: {
    statusCode: 404,
    message: "Pedido no encontrado",
    code: "ORDER_NOT_FOUND"
  },

  DELIVERY_NOT_FOUND: {
    statusCode: 404,
    message: "Entrega no encontrada",
    code: "DELIVERY_NOT_FOUND"
  },

  INVALID_MOCK_QUANTITY: {
    statusCode: 400,
    message: "La cantidad debe ser un número entero entre 1 y 100",
    code: "INVALID_MOCK_QUANTITY"
  },

  ROUTE_NOT_FOUND: {
    statusCode: 404,
    message: "Ruta no encontrada",
    code: "ROUTE_NOT_FOUND"
  },

  INVALID_ID: {
    statusCode: 400,
    message: "El ID proporcionado no es válido",
    code: "INVALID_ID"
  },

  INVALID_JSON: {
    statusCode: 400,
    message: "JSON no válido",
    code: "INVALID_JSON"
  },

  VALIDATION_ERROR: {
    statusCode: 400,
    message: "Los datos proporcionados no son válidos",
    code: "VALIDATION_ERROR"
  },

  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR"
  },

  ORDER_CUSTOMER_NOT_FOUND: {
    statusCode: 400,
    message: "El cliente especificado no existe",
    code: "ORDER_CUSTOMER_NOT_FOUND"
  },

  INVALID_CUSTOMER_ROLE: {
    statusCode: 400,
    message: "El usuario no tiene rol de customer",
    code: "INVALID_CUSTOMER_ROLE"
  },

  ORDER_ITEMS_REQUIRED: {
    statusCode: 400,
    message: "El pedido debe tener al menos un item",
    code: "ORDER_ITEMS_REQUIRED"
  },

  ORDER_PROTECTED_FIELDS: {
    statusCode: 403,
    message: "No está permitido modificar campos protegidos del pedido",
    code: "ORDER_PROTECTED_FIELDS"
  },

  ORDER_HAS_DELIVERY: {
    statusCode: 409,
    message: "No se puede eliminar un pedido que tiene una entrega asociada",
    code: "ORDER_HAS_DELIVERY"
  },
  INVALID_DELIVERY_ID: {
    statusCode: 400,
    message: "ID de entrega inválido",
    code: "INVALID_DELIVERY_ID"
  },

  INVALID_ORDER_ID: {
    statusCode: 400,
    message: "ID de pedido inválido",
    code: "INVALID_ORDER_ID"
  },

  DELIVERY_ALREADY_EXISTS: {
    statusCode: 409,
    message: "Este pedido ya tiene una entrega",
    code: "DELIVERY_ALREADY_EXISTS"
  },

  INVALID_DRIVER_ID: {
    statusCode: 400,
    message: "ID de repartidor inválido",
    code: "INVALID_DRIVER_ID"
  },

  INVALID_DRIVER: {
    statusCode: 400,
    message: "El repartidor no existe o no tiene rol driver",
    code: "INVALID_DRIVER"
  },

  DELIVERY_ORDER_CHANGE_FORBIDDEN: {
    statusCode: 400,
    message: "No es posible cambiar el pedido de una entrega",
    code: "DELIVERY_ORDER_CHANGE_FORBIDDEN"
  },
  SEED_FORBIDDEN: {
    statusCode: 403,
    message: "El seed solo está permitido en desarrollo",
    code: "SEED_FORBIDDEN"
  },
};