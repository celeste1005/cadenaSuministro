# Historial de Cambios (Changelog)

Este documento registra los cambios significativos, mejoras de arquitectura y nuevas funcionalidades implementadas en SCILIP.

## [1.0.0] - Fase de Estabilización Backend y Arquitectura
### Añadido
- **Motor de Cálculos KPI**: Implementación de clases modulares tipo Calculators (`CapacityUtilizationCalculator`, etc.) usando Prisma.
- **Cron Jobs Dinámicos**: Creación de `KpiCronService` con `@nestjs/schedule` para procesar indicadores recurrentes al final del mes basados en variables de entorno.
- **Cálculo de Varianza**: El método `saveKpiValue` ahora consulta el historial del periodo anterior de manera automática para calcular y persistir el porcentaje de varianza (`variancePercentage`).
- **Filtro Global de Excepciones**: Implementación de `PrismaExceptionFilter` para capturar errores de base de datos (e.g., P2002, P2025) y devolver respuestas HTTP estandarizadas en lugar de quebrar el servidor.
- **Swagger UI**: Exposición de la documentación de la API REST en `http://localhost:4000/api/docs` mediante `@nestjs/swagger`.
- **Ecosistema Docker**:
  - `docker-compose.yml` local para orquestar la Base de datos, API y Web con persistencia y hot-reload.
  - `Dockerfile.api` y `Dockerfile.web` en modo *multi-stage* utilizando `turbo prune` para construir imágenes aisladas y optimizadas de producción.
- **Entorno de Pruebas (Testing)**:
  - Instalación de dependencias base `@nestjs/testing` y `jest-mock-extended`.
  - Configuración del entorno de Jest (`jest.config.js`).
  - Creación de Mocks de Prisma Service en test unitarios.

### Eliminado
- Archivo base de entorno obsoleto `env.example` en favor de un archivo `.env.example` centralizado.
- Tests antiguos del *scaffolding* fuertemente acoplados a TypeORM.

### Corregido
- Problemas de compilación de Babel y TypeScript en la suite de pruebas (Jest).
- Rutas erróneas y tipados genéricos `unknown` provenientes de agregaciones de Prisma en la lectura de base de datos.
