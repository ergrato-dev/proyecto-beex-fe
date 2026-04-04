---
description: "Audita la seguridad de un paquete npm antes de instalarlo — verifica CVEs, versión segura y genera el comando pnpm add con versión exacta"
name: "Auditar paquete npm"
argument-hint: "Nombre del paquete a auditar (ej: axios, lodash, express)"
agent: "agent"
tools: ["fetch"]
---

Audita el paquete `$arg` antes de instalarlo, siguiendo la **Regla 0** del proyecto.

## Pasos de auditoría

1. **Consultar Snyk** — cargar `https://security.snyk.io/package/npm/$arg`
   - Identificar la última versión sin CVEs (`Latest non-vulnerable version`)
   - Listar las versiones afectadas y la severidad de cada CVE

2. **Verificar la versión latest** — cargar `https://registry.npmjs.org/$arg/latest`
   - Confirmar que la versión `latest` coincide con la versión segura de Snyk

3. **Emitir veredicto** con el siguiente formato:

```
## Auditoría de seguridad — $arg

| Campo                  | Valor               |
|------------------------|---------------------|
| Versión latest         | x.y.z               |
| Última versión sin CVE | x.y.z               |
| CVEs en latest         | ✅ Ninguno / ⚠️ N encontrados |
| Fuente                 | security.snyk.io    |

### Versiones con CVEs conocidos
| Versión | Severidad | Descripción breve |
|---------|-----------|-------------------|
| ...     | High      | ...               |

### Comando de instalación verificado
\`\`\`bash
# ✅ Versión exacta auditada — sin CVEs confirmado en security.snyk.io
pnpm add $arg@X.Y.Z
\`\`\`

### Para agregar como devDependency
\`\`\`bash
pnpm add -D $arg@X.Y.Z
\`\`\`
```

4. **Si hay CVEs en la versión latest**: advertir explícitamente y recomendar la última versión segura disponible. No generar el comando de instalación con la versión afectada.

5. **Historial para `copilot-instructions.md`**: si se detectan CVEs, sugerir la fila a agregar en la tabla de la sección 4.0 del archivo `copilot-instructions.md`.

Paquete a auditar: `$arg`
