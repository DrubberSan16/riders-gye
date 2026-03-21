# RidersApp PostgreSQL

Paquete completo para inicializar la base de datos desde cero en PostgreSQL usando Docker.
La carga del `seed.json` ocurre automaticamente solo en la primera inicializacion del volumen.

## Contenido

- `Dockerfile`: construye una imagen basada en PostgreSQL 16.
- `docker-compose.yml`: levanta la BD con persistencia y healthcheck.
- `init/01_schema.sql`: crea tablas, constraints e indices.
- `init/02_business_logic.sql`: crea triggers, funciones, procedimientos y vistas.
- `init/03_seed.sql`: lee `seed.json` y carga los registros.
- `init/seed.json`: dataset estructurado por tabla.
- `database.sql`: script consolidado para ejecucion manual.
- `queries_demo.sql`: consultas de apoyo para la sustentacion.

## Modelo de datos final

### 1) `estados`
Catalogo de estados de entrega.

Registros cargados:
- `1 -> pendiente`
- `2 -> en_curso`
- `3 -> completada`
- `4 -> cancelada`

Campos:
- `id`
- `nombre`
- `created_at`
- `updated_at`

### 2) `categorias`
Catalogo de niveles del rider.

Campos:
- `id`
- `nombre`
- `entregas_minimas`
- `calificacion_minima`
- `comision_porcentaje`
- `created_at`
- `updated_at`

### 3) `riders`
Repartidores de la plataforma.

Campos:
- `id`
- `nombre`
- `email`
- `telefono`
- `zona`
- `categoria_id`
- `fecha_ingreso`
- `created_at`
- `updated_at`

FK:
- `categoria_id -> categorias.id`

### 4) `entregas`
Pedidos asignados a cada rider.

Campos:
- `id`
- `rider_id`
- `descripcion`
- `valor`
- `estado_id`
- `calificacion`
- `fecha_creacion`
- `fecha_actualizacion`

FK:
- `rider_id -> riders.id`
- `estado_id -> estados.id`

## Cambio principal solicitado

Ahora todas las tablas guardan sus relaciones por `id`, pero el `seed.json` usa valores legibles de negocio para resolver las FK:

- en `riders`, la categoria sigue llegando por nombre:
  - `"categoria": "Elite"`
- en `entregas`, el estado llega por nombre:
  - `"estado": "completada"`
- en `entregas`, el rider se busca por email:
  - `"rider_email": "carlos.mendez@mail.com"`

Durante la carga:
- `03_seed.sql` lee el JSON,
- busca el `id` correspondiente en la tabla catalogo,
- y guarda ese `id` en la tabla relacional.

## Flujo de inicializacion

1. Docker construye la imagen con PostgreSQL.
2. PostgreSQL detecta que el volumen esta vacio.
3. Ejecuta automaticamente:
   - `01_schema.sql`
   - `02_business_logic.sql`
   - `03_seed.sql`
4. `03_seed.sql` inserta:
   - estados
   - categorias
   - riders
   - entregas
5. PostgreSQL deja la base lista para ser consumida desde NestJS o cualquier cliente SQL.

## Regla de primera inicializacion

Los scripts dentro de `/docker-entrypoint-initdb.d` se ejecutan **solo cuando la base se crea por primera vez**.

Por eso, para reinicializar desde cero debes eliminar el volumen:

```bash
docker compose down -v
docker compose up --build
```

## Explicacion de cada archivo

### `01_schema.sql`
Crea la estructura fisica:
- tablas
- PK
- FK
- restricciones
- indices

### `02_business_logic.sql`
Implementa la logica:
- triggers para `updated_at`
- trigger de transicion de estados
- funciones para buscar ids y nombres
- funciones para evaluar riders
- procedimientos para sincronizar categorias
- vistas para dashboard y detalle

### `03_seed.sql`
Carga el JSON y resuelve las FK por nombre:
- estado por `estados.nombre`
- categoria por `categorias.nombre`
- rider por `riders.email`

Tambien activa temporalmente `app.seed_mode = 'on'` para permitir insertar entregas historicas con estados ya avanzados.

## Reglas de negocio implementadas

### Transiciones de estado
- una entrega nueva inicia en `pendiente` en operacion normal
- durante el seed se permiten historicos
- no se puede modificar una entrega ya `completada` o `cancelada`
- de `pendiente` solo puede pasar a `en_curso` o `cancelada`
- de `en_curso` solo puede pasar a `completada` o `cancelada`
- la `calificacion` solo existe si la entrega esta `completada`

### Evaluacion del rider
Se calcula sobre los ultimos 30 dias:
- entregas completadas
- promedio de calificacion
- comisiones generadas
- categoria actual
- categoria que le corresponde

### Resumen por zona
Se devuelve:
- cantidad de entregas completadas
- calificacion promedio
- comisiones totales
- cantidad de riders por categoria

## Consultas sugeridas

```sql
SELECT * FROM vw_riders_dashboard ORDER BY id;
```

```sql
SELECT * FROM vw_entregas_detalle ORDER BY id;
```

```sql
SELECT * FROM fn_resumen_zona('2026-03-17 23:59:59');
```

```sql
CALL sp_sincronizar_todas_categorias('2026-03-17 23:59:59');
```

## Sustentacion sugerida

Puedes explicarlo asi:

1. **Normalizacion**
   - separaste catalogos (`estados`, `categorias`) de entidades transaccionales (`riders`, `entregas`)
   - guardaste las relaciones por `id`

2. **Legibilidad del seed**
   - el JSON mantiene nombres de negocio
   - eso evita hardcodear ids manualmente en cada registro

3. **Integridad**
   - las FK viven en la BD
   - el SQL resuelve los ids antes de insertar
   - se controlan las transiciones con triggers

4. **Automatizacion**
   - Docker levanta la BD
   - PostgreSQL ejecuta schema + logica + seed solo la primera vez

5. **Escalabilidad**
   - los catalogos permiten agregar mas estados o categorias sin cambiar la estructura relacional
   - las vistas y funciones facilitan el consumo desde el backend
