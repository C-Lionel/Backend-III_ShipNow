
import { expect } from "chai";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

describe("Upload Middleware - Directory Creation", function () {
  it("debería crear automáticamente las carpetas de almacenamiento", async function () {
    // Crear un directorio temporal aislado.
    const temporaryDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "shipnow-uploads-")
    );

    try {
      const uploadsDirectory = path.join(
        temporaryDirectory,
        "uploads"
      );

      // Verificar que uploads no exista inicialmente.
      const initialStats = await fs.stat(uploadsDirectory)
        .catch((error) => {
          if (error.code === "ENOENT") {
            return null;
          }

          throw error;
        });

      expect(initialStats).to.equal(null);

      // Obtener la ubicación del middleware.
      const middlewareUrl = new URL(
        "../../src/middlewares/upload.middleware.js",
        import.meta.url
      ).href;

      // Importar el middleware en un proceso independiente.
      await execFileAsync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `await import(${JSON.stringify(middlewareUrl)});`
        ],
        {
          cwd: temporaryDirectory
        }
      );

      // Carpetas que deben crearse automáticamente.
      const expectedFolders = [
        "temp",
        "user-documents",
        "driver-licenses",
        "delivery-proofs"
      ];

      for (const folder of expectedFolders) {
        const folderPath = path.join(
          uploadsDirectory,
          folder
        );

        const stats = await fs.stat(folderPath);

        expect(stats.isDirectory()).to.equal(true);
      }

    } finally {
      // Eliminar únicamente el directorio temporal de prueba.
      await fs.rm(temporaryDirectory, {
        recursive: true,
        force: true
      });
    }
  });
});
