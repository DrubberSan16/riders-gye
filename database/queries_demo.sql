-- 1) Ver todos los riders con sus metricas actuales
SELECT *
FROM vw_riders_dashboard
ORDER BY id;

-- 2) Evaluar un rider con fecha fija
SELECT *
FROM fn_evaluacion_rider(1, '2026-03-17 23:59:59');

-- 3) Resumen por zona con fecha fija
SELECT *
FROM fn_resumen_zona('2026-03-17 23:59:59');

-- 4) Ver entregas con nombres de estado y rider
SELECT *
FROM vw_entregas_detalle
ORDER BY id;

-- 5) Sincronizar categorias persistidas segun la evaluacion
CALL sp_sincronizar_todas_categorias('2026-03-17 23:59:59');

-- 6) Ver riders luego de sincronizar
SELECT
    r.id,
    r.nombre,
    r.zona,
    c.id AS categoria_id,
    c.nombre AS categoria
FROM riders r
JOIN categorias c
  ON c.id = r.categoria_id
ORDER BY r.id;
