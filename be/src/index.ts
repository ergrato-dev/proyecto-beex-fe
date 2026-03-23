/**
 * Archivo: index.ts
 * Descripción: Punto de entrada del backend — arranca el servidor Express.
 * ¿Para qué? Separar el bootstrap del servidor de la configuración de la app (app.ts),
 *   lo que facilita los tests de integración (que importan app.ts sin levantar el servidor).
 * ¿Impacto? Es el primer archivo que ejecuta Node.js. Si falla aquí, nada funciona.
 */

import app from './app.js';
import { config } from './config.js';

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
});
