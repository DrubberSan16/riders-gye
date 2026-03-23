# Riders GYE

Proyecto fullstack para gestión de **riders**, **entregas**, **categorías**, **estados**, evaluación de desempeño y visualización ejecutiva.

La solución está organizada en tres capas:

- **database**: PostgreSQL + scripts de inicialización + seed JSON
- **riders-backend**: API REST en NestJS + Swagger
- **riders-frontend**: Dashboard en Vue

---

## 1. Estructura del proyecto

```text
/riders-gye
  /database
    Dockerfile
    docker-compose.yml
    /init
      01_schema.sql
      02_business_logic.sql
      03_seed.sql
      seed.json

  /riders-backend
    Dockerfile
    docker-compose.yml
    .dockerignore
    package.json
    src/
    tsconfig.json
    nest-cli.json

  /riders-frontend
    Dockerfile
    docker-compose.yml
    nginx.conf
    .dockerignore
    package.json
    src/

  docker-compose.yml
```

---

## 2. Qué hace cada carpeta

### `database`
Contiene la base de datos PostgreSQL y los scripts que se ejecutan **solo en la primera inicialización** del contenedor:

- `01_schema.sql`: crea tablas, relaciones, índices y catálogos
- `02_business_logic.sql`: crea funciones, vistas, triggers y procedimientos
- `03_seed.sql`: inserta los registros desde `seed.json`
- `seed.json`: datos iniciales estructurados por tabla

### `riders-backend`
Expone la API REST en NestJS para:

- listar riders
- crear y editar riders
- crear y actualizar entregas
- consultar catálogos
- obtener evaluación de riders
- obtener resumen por zona
- documentar todo con Swagger

### `riders-frontend`
Dashboard operativo y ejecutivo en Vue, conectado al backend para:

- visualizar riders
- filtrar por zona, categoría y fecha
- ver evaluación
- crear riders
- crear entregas
- cambiar estados
- ver indicadores y resumen por zona

---

## 3. Requisitos

Instala lo siguiente:

- **Docker Desktop** o Docker Engine + Compose
- Git
- Navegador web

Para ejecución local sin Docker también necesitarías:

- Node.js 20+
- npm
- PostgreSQL 16+

---

## 4. Puertos usados

- **PostgreSQL** escucha en `5432`
- El backend debe conectarse a:
  - `DB_HOST=postgres`
  - `DB_PORT=5432`

> **Entre contenedores se usa `5432`**.

---

## 5. Levantar todo el proyecto

Desde la raíz del repositorio:

```bash
docker compose up -d --build
```

Eso levanta:

1. PostgreSQL
2. Backend NestJS
3. Frontend Vue

---

## 6. Primera carga de la base de datos

En el **primer arranque**, PostgreSQL ejecuta automáticamente los scripts ubicados en:

```text
/database/init
```

Flujo de inicialización:

1. crea la base
2. crea tablas y relaciones
3. crea funciones, triggers y procedimientos
4. inserta catálogos
5. carga riders y entregas desde `seed.json`

### Si necesitas reinicializar desde cero

```bash
docker compose down -v
docker compose up -d --build
```

Esto elimina los volúmenes y obliga a que PostgreSQL vuelva a ejecutar la inicialización completa.

---

## 7. URLs del sistema

### Frontend
```text
http://localhost:8080
```

### Backend
```text
http://localhost:3000
```

### Swagger
```text
http://localhost:3000/docs
```

### Health check
```text
http://localhost:3000/api/v1/health
```

---

## 8. Servicios disponibles

## 8.1 Base de datos
La base contiene, entre otras, estas tablas principales:

- `estados`
- `categorias`
- `riders`
- `entregas`

Además incluye funciones y lógica como:

- evaluación de rider por últimos 30 días
- resumen por zona
- sincronización de categorías
- validación de transición de estados

---

## 8.2 Backend
Principales módulos:

- `HealthModule`
- `EstadosModule`
- `CategoriasModule`
- `RidersModule`
- `EntregasModule`
- `EvaluacionesModule`
- `ReportesModule`
- `TareasModule`

### APIs principales

#### Health
- `GET /api/v1/health`
- `GET /api/v1/health/db`

#### Estados
- `GET /api/v1/estados`
- `GET /api/v1/estados/:id`
- `POST /api/v1/estados`
- `PATCH /api/v1/estados/:id`

#### Categorías
- `GET /api/v1/categorias`
- `GET /api/v1/categorias/:id`
- `POST /api/v1/categorias`
- `PATCH /api/v1/categorias/:id`

#### Riders
- `GET /api/v1/riders`
- `GET /api/v1/riders/:id`
- `POST /api/v1/riders`
- `PATCH /api/v1/riders/:id`
- `PATCH /api/v1/riders/:id/categoria`

#### Entregas
- `GET /api/v1/entregas`
- `GET /api/v1/entregas/:id`
- `POST /api/v1/entregas`
- `PATCH /api/v1/entregas/:id`
- `PATCH /api/v1/entregas/:id/estado`

#### Evaluaciones
- `GET /api/v1/evaluaciones/riders`
- `GET /api/v1/evaluaciones/riders/:riderId`

#### Reportes
- `GET /api/v1/reportes/zonas`
- `GET /api/v1/reportes/dashboard`

---

## 8.3 Frontend
Pantallas y componentes principales:

- Dashboard ejecutivo
- KPIs operativos
- Filtros por zona, categoría, búsqueda y fecha
- Tabla de riders
- Modal de creación y edición de rider
- Modal de evaluación de rider
- Resumen por zona
- Operación rápida de entregas
- Entregas recientes

---

## 9. Comandos útiles

### Levantar todos los servicios
```bash
docker compose up -d --build
```

### Ver logs de todos los servicios
```bash
docker compose logs -f
```

### Ver logs solo del backend
```bash
docker compose logs -f backend
```

### Ver logs solo de la base
```bash
docker compose logs -f postgres
```

### Ver logs solo del frontend
```bash
docker compose logs -f frontend
```

### Detener servicios
```bash
docker compose down
```

### Detener y borrar volúmenes
```bash
docker compose down -v
```

### Reconstruir todo
```bash
docker compose up -d --build
```

---

## 10. Ejecución local por separado

## 10.1 Solo base de datos
Desde `/database`:

```bash
docker compose up -d --build
```

## 10.2 Solo backend
Desde `/riders-backend`:

```bash
docker compose up -d --build
```

## 10.3 Solo frontend
Desde `/riders-frontend`:

```bash
docker compose up -d --build
```

> Recomendado: usar siempre el `docker-compose.yml` de la raíz para que todos los servicios compartan la misma red y orden de arranque.

---

## 11. Variables de entorno relevantes

## Backend
Se inyectan desde Docker Compose:

```env
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=ridersapp
```

## Base de datos
```env
POSTGRES_DB=ridersapp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
TZ=America/Guayaquil
```

---

## 12. Flujo técnico general

### Base de datos
- Docker construye una imagen basada en PostgreSQL
- copia los scripts de inicialización
- ejecuta la estructura y el seed en el primer arranque

### Backend
- Docker construye la app NestJS
- instala dependencias
- compila a `dist`
- levanta la API en el puerto `3000`

### Frontend
- Docker construye la app Vue
- compila para producción
- sirve los archivos estáticos con Nginx
- reenvía las llamadas API al backend

---

## 13. Consideraciones importantes

### No crear `.git` dentro de subcarpetas
Las carpetas:

- `database`
- `riders-backend`
- `riders-frontend`

deben pertenecer al repositorio principal `riders-gye`.

---

## 14. Orden recomendado de trabajo

1. levantar toda la solución con Docker
2. verificar `health`
3. revisar Swagger
4. abrir frontend
5. validar riders cargados
6. probar filtros
7. crear rider
8. crear entrega
9. cambiar estado
10. abrir evaluación del rider

---

## 15. Validación rápida del sistema

Cuando todo está correcto, deberías poder comprobar:

### Base de datos
- el contenedor `postgres` está `healthy`

### Backend
- `GET /api/v1/health` responde correctamente
- Swagger carga en `/docs`

### Frontend
- el dashboard carga
- hay riders visibles
- los selects cargan información
- la evaluación abre correctamente
- el resumen por zona muestra información

---

## 16. Comandos de mantenimiento

### Eliminar imágenes y contenedores detenidos
```bash
docker system prune
```

### Eliminar también volúmenes no usados
```bash
docker system prune -a --volumes
```

> Usa estos comandos con cuidado.

---

## 17. Sugerencia de despliegue futuro

Para producción, conviene agregar:

- variables `.env` separadas
- reverse proxy
- HTTPS
- pipeline CI/CD
- almacenamiento persistente controlado
- cola real para tareas asíncronas
- manejo de logs centralizado
