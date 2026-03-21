-- 03_seed.sql
-- Carga automatica del seed.json en el primer arranque del contenedor.
-- El JSON usa nombres de negocio para las FK y el SQL resuelve los ids.

BEGIN;

SELECT set_config('app.seed_mode', 'on', true);

WITH data AS (
    SELECT pg_read_file('/docker-entrypoint-initdb.d/seed.json')::JSONB AS doc
)
INSERT INTO estados (
    id,
    nombre
)
SELECT
    (e ->> 'id')::SMALLINT AS id,
    e ->> 'nombre' AS nombre
FROM data,
LATERAL jsonb_array_elements(doc -> 'estados') AS e
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    updated_at = NOW();

SELECT setval(
    pg_get_serial_sequence('estados', 'id'),
    COALESCE((SELECT MAX(id) FROM estados), 1),
    true
);

WITH data AS (
    SELECT pg_read_file('/docker-entrypoint-initdb.d/seed.json')::JSONB AS doc
)
INSERT INTO categorias (
    id,
    nombre,
    entregas_minimas,
    calificacion_minima,
    comision_porcentaje
)
SELECT
    (c ->> 'id')::INTEGER AS id,
    c ->> 'nombre' AS nombre,
    (c ->> 'entregas_minimas')::INTEGER AS entregas_minimas,
    (c ->> 'calificacion_minima')::NUMERIC(3,2) AS calificacion_minima,
    (c ->> 'comision_porcentaje')::NUMERIC(5,2) AS comision_porcentaje
FROM data,
LATERAL jsonb_array_elements(doc -> 'categorias') AS c
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    entregas_minimas = EXCLUDED.entregas_minimas,
    calificacion_minima = EXCLUDED.calificacion_minima,
    comision_porcentaje = EXCLUDED.comision_porcentaje,
    updated_at = NOW();

SELECT setval(
    pg_get_serial_sequence('categorias', 'id'),
    COALESCE((SELECT MAX(id) FROM categorias), 1),
    true
);

WITH data AS (
    SELECT pg_read_file('/docker-entrypoint-initdb.d/seed.json')::JSONB AS doc
)
INSERT INTO riders (
    id,
    nombre,
    email,
    telefono,
    zona,
    categoria_id,
    fecha_ingreso
)
SELECT
    (r ->> 'id')::INTEGER AS id,
    r ->> 'nombre' AS nombre,
    r ->> 'email' AS email,
    r ->> 'telefono' AS telefono,
    r ->> 'zona' AS zona,
    c.id AS categoria_id,
    (r ->> 'fecha_ingreso')::DATE AS fecha_ingreso
FROM data,
LATERAL jsonb_array_elements(doc -> 'riders') AS r
JOIN categorias c
  ON c.nombre = r ->> 'categoria'
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    email = EXCLUDED.email,
    telefono = EXCLUDED.telefono,
    zona = EXCLUDED.zona,
    categoria_id = EXCLUDED.categoria_id,
    fecha_ingreso = EXCLUDED.fecha_ingreso,
    updated_at = NOW();

SELECT setval(
    pg_get_serial_sequence('riders', 'id'),
    COALESCE((SELECT MAX(id) FROM riders), 1),
    true
);

WITH data AS (
    SELECT pg_read_file('/docker-entrypoint-initdb.d/seed.json')::JSONB AS doc
)
INSERT INTO entregas (
    rider_id,
    descripcion,
    valor,
    estado_id,
    calificacion,
    fecha_creacion,
    fecha_actualizacion
)
SELECT
    r.id AS rider_id,
    e ->> 'descripcion' AS descripcion,
    (e ->> 'valor')::NUMERIC(10,2) AS valor,
    es.id AS estado_id,
    (e ->> 'calificacion')::NUMERIC(3,2) AS calificacion,
    (e ->> 'fecha_creacion')::TIMESTAMP AS fecha_creacion,
    COALESCE((e ->> 'fecha_actualizacion')::TIMESTAMP, (e ->> 'fecha_creacion')::TIMESTAMP) AS fecha_actualizacion
FROM data,
LATERAL jsonb_array_elements(doc -> 'entregas') AS e
JOIN riders r
  ON r.email = e ->> 'rider_email'
JOIN estados es
  ON es.nombre = e ->> 'estado';

COMMIT;
