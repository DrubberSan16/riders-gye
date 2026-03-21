# Analisis de modulos y APIs

## HealthModule
Sirve para health checks operativos.
- `GET /api/v1/health`
- `GET /api/v1/health/db`

## EstadosModule
Administra el catalogo de estados de entrega.
- `GET /api/v1/estados`
- `GET /api/v1/estados/:id`
- `POST /api/v1/estados`
- `PATCH /api/v1/estados/:id`

## CategoriasModule
Administra las categorias y sus reglas de negocio.
- `GET /api/v1/categorias`
- `GET /api/v1/categorias/:id`
- `POST /api/v1/categorias`
- `PATCH /api/v1/categorias/:id`

## RidersModule
Administra riders y la tabla principal del frontend.
- `GET /api/v1/riders`
- `GET /api/v1/riders/:id`
- `POST /api/v1/riders`
- `PATCH /api/v1/riders/:id`
- `PATCH /api/v1/riders/:id/categoria`

## EntregasModule
Administra altas, consulta y cambio de estado de entregas.
- `GET /api/v1/entregas`
- `GET /api/v1/entregas/:id`
- `POST /api/v1/entregas`
- `PATCH /api/v1/entregas/:id`
- `PATCH /api/v1/entregas/:id/estado`

## EvaluacionesModule
Ejecuta `fn_evaluacion_rider` para uno o varios riders.
- `GET /api/v1/evaluaciones/riders`
- `GET /api/v1/evaluaciones/riders/:riderId`

## ReportesModule
Ejecuta `fn_resumen_zona` y arma el dashboard general.
- `GET /api/v1/reportes/zonas`
- `GET /api/v1/reportes/dashboard`

## TareasModule
Lanza sincronizaciones asincronas y cron nocturno.
- `POST /api/v1/tareas/sincronizacion-categorias/ejecutar`
- `POST /api/v1/tareas/sincronizacion-categorias/riders/:riderId/ejecutar`
- `GET /api/v1/tareas/jobs/:jobId`

## Estructura tecnica
Cada modulo contiene:
- `module`: registro de dependencias
- `controller`: capa HTTP + Swagger
- `service`: reglas de negocio
- `repository`: acceso a BD y consultas SQL
- `dto`: validacion y documentacion de requests
- `entity`: mapeo TypeORM hacia PostgreSQL

## Integracion con funciones SQL
- `fn_evaluacion_rider`: usada por EvaluacionesModule
- `fn_resumen_zona`: usada por ReportesModule
- `sp_sincronizar_categoria_rider`: usada por TareasModule
- `sp_sincronizar_todas_categorias`: usada por TareasModule
