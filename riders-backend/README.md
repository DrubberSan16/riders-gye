# Riders Backend - NestJS

Backend REST construido con NestJS, TypeORM y PostgreSQL, alineado con la base que ya definiste para `estados`, `categorias`, `riders`, `entregas` y las funciones SQL:

- `fn_evaluacion_rider`
- `fn_resumen_zona`
- `sp_sincronizar_categoria_rider`
- `sp_sincronizar_todas_categorias`

## 1. Instalacion

```bash
cp .env.example .env
npm install
npm run start:dev
```

## 2. Swagger

Cuando el backend levante, la documentacion queda en:

```text
http://localhost:3000/docs
```

## 3. Variables de entorno

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=riders_db
DB_SSL=false
APP_SYNC_CATEGORIES_CRON=0 10 1 * * *
```

## 4. Estructura

```text
src/
  main.ts
  app.module.ts
  common/
  modules/
    health/
    estados/
    categorias/
    riders/
    entregas/
    evaluaciones/
    reportes/
    tareas/
```

## 5. Endpoints principales

- `GET /api/v1/health`
- `GET /api/v1/health/db`
- `GET /api/v1/estados`
- `GET /api/v1/categorias`
- `GET /api/v1/riders`
- `GET /api/v1/riders/:id`
- `POST /api/v1/riders`
- `PATCH /api/v1/riders/:id`
- `PATCH /api/v1/riders/:id/categoria`
- `GET /api/v1/entregas`
- `GET /api/v1/entregas/:id`
- `POST /api/v1/entregas`
- `PATCH /api/v1/entregas/:id`
- `PATCH /api/v1/entregas/:id/estado`
- `GET /api/v1/evaluaciones/riders`
- `GET /api/v1/evaluaciones/riders/:riderId`
- `GET /api/v1/reportes/zonas`
- `GET /api/v1/reportes/dashboard`
- `POST /api/v1/tareas/sincronizacion-categorias/ejecutar`
- `POST /api/v1/tareas/sincronizacion-categorias/riders/:riderId/ejecutar`
- `GET /api/v1/tareas/jobs/:jobId`

## 6. Notas de integracion

1. `POST /entregas` siempre crea en `pendiente`.
2. `PATCH /entregas/:id/estado` delega las reglas finales al trigger de PostgreSQL.
3. `GET /evaluaciones/riders/:riderId` ejecuta directamente `fn_evaluacion_rider`.
4. `GET /reportes/zonas` ejecuta `fn_resumen_zona`.
5. Las tareas asincronas llaman procedimientos almacenados y dejan trazabilidad basica en memoria.
