
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import AppError from "../utils/errors.js";
import { ErrorDictionary } from "../utils/errorDictionary.js";
import { DOCUMENT_TYPES } from "../constants/index.js";

// Carpeta principal
const UPLOADS_DIR = path.resolve("uploads");

// Carpetas de almacenamiento
const UPLOAD_FOLDERS = Object.freeze({
  TEMP: "temp",
  USER_DOCUMENTS: "user-documents",
  DRIVER_LICENSES: "driver-licenses",
  DELIVERY_PROOFS: "delivery-proofs"
});

// Tipos de archivo permitidos
const ALLOWED_FILE_TYPES = Object.freeze({
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"]
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Crear carpetas automáticamente
for (const folder of Object.values(UPLOAD_FOLDERS)) {
  fs.mkdirSync(path.join(UPLOADS_DIR, folder), {
    recursive: true
  });
}

// Convertir una ruta absoluta en una ruta relativa a uploads
export const getRelativeUploadPath = (absolutePath) => {
  const relativePath = path.relative(
    UPLOADS_DIR,
    absolutePath
  );

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new AppError(ErrorDictionary.VALIDATION_ERROR);
  }

  return relativePath.split(path.sep).join("/");
};

// Resolver una ruta de almacenamiento a su ubicación absoluta
export const resolveUploadPath = (storedPath) => {
  const absolutePath = path.resolve(
    UPLOADS_DIR,
    storedPath
  );

  // Verificar que la ruta permanezca dentro de uploads
  getRelativeUploadPath(absolutePath);

  return absolutePath;
};

// Configuración centralizada del almacenamiento
const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOADS_DIR, folder));
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  }
});

// Validar MIME y extensión
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ALLOWED_FILE_TYPES[file.mimetype];

  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    return cb(new AppError(ErrorDictionary.INVALID_FILE_TYPE));
  }

  cb(null, true);
};

// Crear instancia de Multer
const createUpload = (folder) => multer({
  storage: createStorage(folder),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

// Documentos de usuarios: primero van a temp
export const uploadUserDocument = createUpload(
  UPLOAD_FOLDERS.TEMP
);

// Comprobantes de entrega
export const uploadDeliveryProof = createUpload(
  UPLOAD_FOLDERS.DELIVERY_PROOFS
);

// Mover un documento a su carpeta definitiva
export const moveUserDocument = (file, documentType) => {
  const folder =
    documentType === DOCUMENT_TYPES.DRIVER_LICENSE
      ? UPLOAD_FOLDERS.DRIVER_LICENSES
      : UPLOAD_FOLDERS.USER_DOCUMENTS;

  const destination = path.join(
    UPLOADS_DIR,
    folder,
    file.filename
  );

  fs.renameSync(file.path, destination);

  file.path = destination;
  file.destination = path.dirname(destination);

  return file;
};
