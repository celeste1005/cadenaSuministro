# Arquitectura Técnica de SCILIP

SCILIP está desarrollado bajo una arquitectura moderna de **Monorepo** gestionado por **Turborepo** y **pnpm**.

## 1. Patrones del Backend (NestJS + Prisma)
- **Capa de Controladores / tRPC**: Se utiliza para exponer la data hacia el cliente Web. Además, los endpoints REST están documentados automáticamente mediante **Swagger**.
- **Servicios Fachada**: `KpiService` actúa como orquestador central de las lógicas.
- **Calculadores**: Las fórmulas matemáticas de los 28 indicadores están aisladas en clases dentro de cada módulo (ej. `InventoryAccuracyCalculator`). Estos calculadores se comunican exclusivamente con la base de datos a través de inyección de `PrismaService`.
- **Trabajos Programados (Cron)**: Administrado por `KpiCronService`, recorre periódicamente a todas las compañías activas del sistema para guardar 'snapshots' (fotografías) de su desempeño mensual, computando la varianza respecto al mes pasado.
- **Gestión de Errores**: Todo error arrojado por Prisma (violación de constraints, llaves no encontradas) es capturado e higienizado por el `PrismaExceptionFilter` que los transforma en status code limpios (404, 400, 409).

## 2. Base de Datos
- **PostgreSQL 15** orquestado mediante Prisma ORM. 
- Contiene más de 30 modelos que abarcan la estructura central corporativa y los submódulos logísticos.

## 3. Despliegue y Docker
Existen dos enfoques de despliegue diseñados para el proyecto:
1. **Desarrollo (Hot-Reloading)**: Un `docker-compose.yml` levanta los servicios (`db`, `api`, `web`) pero monta el código local mediante volúmenes. Esto permite programar sin instalar dependencias y viendo reflejados los cambios de inmediato.
2. **Producción (Turbo Prune)**: Los `Dockerfile.*` están configurados de forma multi-etapa. Extraen estáticamente solo lo que una aplicación particular necesita de todo el monorepo y generan imágenes Alpine muy ligeras, ideales para integraciones CI/CD de AWS, Vercel o Google Cloud.

## 4. Pruebas y Aseguramiento de Calidad
- Las pruebas unitarias se ejecutan mediante **Jest**.
- Debido a que Prisma se comunica con base de datos real, se emplea la librería `jest-mock-extended` para falsear el modelo de datos (Deep Mocks) durante los Unit Tests, permitiendo comprobar la lógica matemática de forma aislada e instantánea.
