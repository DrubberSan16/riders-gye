-- 02_business_logic.sql
-- Triggers, funciones, procedimientos y vistas para las reglas del negocio.

BEGIN;

CREATE OR REPLACE FUNCTION fn_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_touch_fecha_actualizacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_estado_id(p_nombre VARCHAR)
RETURNS SMALLINT
LANGUAGE sql
STABLE
AS $$
    SELECT e.id
    FROM estados e
    WHERE e.nombre = p_nombre
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION fn_estado_nombre(p_estado_id SMALLINT)
RETURNS VARCHAR
LANGUAGE sql
STABLE
AS $$
    SELECT e.nombre
    FROM estados e
    WHERE e.id = p_estado_id
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION fn_categoria_id(p_nombre VARCHAR)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT c.id
    FROM categorias c
    WHERE c.nombre = p_nombre
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION fn_categoria_nombre(p_categoria_id INTEGER)
RETURNS VARCHAR
LANGUAGE sql
STABLE
AS $$
    SELECT c.nombre
    FROM categorias c
    WHERE c.id = p_categoria_id
    LIMIT 1;
$$;

DROP TRIGGER IF EXISTS trg_estados_touch_updated_at ON estados;
CREATE TRIGGER trg_estados_touch_updated_at
BEFORE UPDATE ON estados
FOR EACH ROW
EXECUTE FUNCTION fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_categorias_touch_updated_at ON categorias;
CREATE TRIGGER trg_categorias_touch_updated_at
BEFORE UPDATE ON categorias
FOR EACH ROW
EXECUTE FUNCTION fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_riders_touch_updated_at ON riders;
CREATE TRIGGER trg_riders_touch_updated_at
BEFORE UPDATE ON riders
FOR EACH ROW
EXECUTE FUNCTION fn_touch_updated_at();

CREATE OR REPLACE FUNCTION fn_validar_transicion_entrega()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_seed_mode  TEXT;
    v_old_estado VARCHAR(20);
    v_new_estado VARCHAR(20);
BEGIN
    v_seed_mode := current_setting('app.seed_mode', true);
    v_new_estado := fn_estado_nombre(NEW.estado_id);

    IF v_new_estado IS NULL THEN
        RAISE EXCEPTION 'El estado_id % no existe en la tabla estados', NEW.estado_id;
    END IF;

    IF TG_OP = 'INSERT' THEN
        /*
           En operacion normal una entrega nueva debe iniciar en pendiente.
           Durante la carga inicial se permite insertar historicos mediante
           la variable de sesion app.seed_mode = 'on'.
        */
        IF COALESCE(v_seed_mode, 'off') <> 'on' AND v_new_estado <> 'pendiente' THEN
            RAISE EXCEPTION 'Una entrega nueva debe iniciar en estado pendiente';
        END IF;

        IF v_new_estado = 'completada' AND NEW.calificacion IS NULL THEN
            RAISE EXCEPTION 'La calificacion es obligatoria para una entrega completada';
        END IF;

        IF v_new_estado <> 'completada' AND NEW.calificacion IS NOT NULL THEN
            RAISE EXCEPTION 'La calificacion solo se registra cuando la entrega esta completada';
        END IF;

        NEW.fecha_actualizacion := COALESCE(NEW.fecha_actualizacion, NEW.fecha_creacion, CURRENT_TIMESTAMP);
        RETURN NEW;
    END IF;

    v_old_estado := fn_estado_nombre(OLD.estado_id);

    IF v_old_estado IS NULL THEN
        RAISE EXCEPTION 'El estado_id anterior % no existe en la tabla estados', OLD.estado_id;
    END IF;

    IF v_old_estado IN ('completada', 'cancelada') THEN
        RAISE EXCEPTION 'No se puede modificar una entrega que ya esta %', v_old_estado;
    END IF;

    IF v_old_estado = 'pendiente' AND v_new_estado NOT IN ('pendiente', 'en_curso', 'cancelada') THEN
        RAISE EXCEPTION 'Transicion invalida: de pendiente solo se puede pasar a en_curso o cancelada';
    END IF;

    IF v_old_estado = 'en_curso' AND v_new_estado NOT IN ('en_curso', 'completada', 'cancelada') THEN
        RAISE EXCEPTION 'Transicion invalida: de en_curso solo se puede pasar a completada o cancelada';
    END IF;

    IF v_new_estado = 'completada' AND NEW.calificacion IS NULL THEN
        RAISE EXCEPTION 'La calificacion es obligatoria cuando una entrega pasa a completada';
    END IF;

    IF v_new_estado <> 'completada' AND NEW.calificacion IS NOT NULL THEN
        RAISE EXCEPTION 'La calificacion solo se registra cuando la entrega pasa a completada';
    END IF;

    NEW.fecha_actualizacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_entregas_validar_transicion ON entregas;
CREATE TRIGGER trg_entregas_validar_transicion
BEFORE INSERT OR UPDATE ON entregas
FOR EACH ROW
EXECUTE FUNCTION fn_validar_transicion_entrega();

DROP TRIGGER IF EXISTS trg_entregas_touch_fecha_actualizacion ON entregas;
CREATE TRIGGER trg_entregas_touch_fecha_actualizacion
BEFORE UPDATE ON entregas
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

CREATE OR REPLACE FUNCTION fn_categoria_correspondiente_id(
    p_entregas_completadas INTEGER,
    p_calificacion_promedio NUMERIC
)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT c.id
    FROM categorias c
    WHERE COALESCE(p_entregas_completadas, 0) >= c.entregas_minimas
      AND COALESCE(p_calificacion_promedio, 0) >= c.calificacion_minima
    ORDER BY c.entregas_minimas DESC, c.calificacion_minima DESC, c.id DESC
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION fn_evaluacion_rider(
    p_rider_id INTEGER,
    p_fecha_referencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
RETURNS TABLE (
    rider_id INTEGER,
    nombre VARCHAR,
    zona VARCHAR,
    categoria_actual_id INTEGER,
    categoria_actual VARCHAR,
    entregas_completadas_30_dias INTEGER,
    calificacion_promedio_30_dias NUMERIC,
    categoria_correspondiente_id INTEGER,
    categoria_correspondiente VARCHAR,
    comisiones_generadas_30_dias NUMERIC,
    fecha_referencia TIMESTAMP
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH estado_completada AS (
        SELECT fn_estado_id('completada') AS id
    ),
    entregas_periodo AS (
        SELECT e.*
        FROM entregas e
        CROSS JOIN estado_completada ec
        WHERE e.rider_id = p_rider_id
          AND e.estado_id = ec.id
          AND e.fecha_creacion >= (p_fecha_referencia - INTERVAL '30 days')
          AND e.fecha_creacion <= p_fecha_referencia
    ),
    metricas AS (
        SELECT
            COUNT(*)::INTEGER AS entregas_completadas,
            ROUND(COALESCE(AVG(calificacion), 0), 2)::NUMERIC(10,2) AS calificacion_promedio,
            ROUND(COALESCE(SUM(valor), 0), 2)::NUMERIC(12,2) AS total_valores
        FROM entregas_periodo
    ),
    categoria_objetivo AS (
        SELECT COALESCE(
            fn_categoria_correspondiente_id(m.entregas_completadas, m.calificacion_promedio),
            fn_categoria_id('Rookie')
        ) AS categoria_id
        FROM metricas m
    )
    SELECT
        r.id,
        r.nombre,
        r.zona,
        c_actual.id,
        c_actual.nombre,
        m.entregas_completadas,
        m.calificacion_promedio,
        c_obj.id,
        c_obj.nombre,
        ROUND((m.total_valores * c_actual.comision_porcentaje / 100.0), 2)::NUMERIC(12,2),
        p_fecha_referencia
    FROM riders r
    JOIN categorias c_actual
      ON c_actual.id = r.categoria_id
    CROSS JOIN metricas m
    JOIN categoria_objetivo co
      ON TRUE
    JOIN categorias c_obj
      ON c_obj.id = co.categoria_id
    WHERE r.id = p_rider_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_resumen_zona(
    p_fecha_referencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
RETURNS TABLE (
    zona VARCHAR,
    entregas_completadas_30_dias INTEGER,
    comisiones_totales_30_dias NUMERIC,
    calificacion_promedio_30_dias NUMERIC,
    riders_rookie INTEGER,
    riders_semi_pro INTEGER,
    riders_pro INTEGER,
    riders_elite INTEGER,
    fecha_referencia TIMESTAMP
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH estado_completada AS (
        SELECT fn_estado_id('completada') AS id
    ),
    zonas AS (
        SELECT DISTINCT r.zona
        FROM riders r
    ),
    entregas_periodo AS (
        SELECT
            r.zona,
            c.nombre AS categoria_nombre,
            c.comision_porcentaje,
            e.valor,
            e.calificacion
        FROM entregas e
        JOIN riders r
          ON r.id = e.rider_id
        JOIN categorias c
          ON c.id = r.categoria_id
        CROSS JOIN estado_completada ec
        WHERE e.estado_id = ec.id
          AND e.fecha_creacion >= (p_fecha_referencia - INTERVAL '30 days')
          AND e.fecha_creacion <= p_fecha_referencia
    ),
    categorias_riders AS (
        SELECT
            r.zona,
            COUNT(*) FILTER (WHERE c.nombre = 'Rookie')::INTEGER AS riders_rookie,
            COUNT(*) FILTER (WHERE c.nombre = 'Semi-Pro')::INTEGER AS riders_semi_pro,
            COUNT(*) FILTER (WHERE c.nombre = 'Pro')::INTEGER AS riders_pro,
            COUNT(*) FILTER (WHERE c.nombre = 'Elite')::INTEGER AS riders_elite
        FROM riders r
        JOIN categorias c
          ON c.id = r.categoria_id
        GROUP BY r.zona
    ),
    metricas_zona AS (
        SELECT
            ep.zona,
            COUNT(*)::INTEGER AS entregas_completadas,
            ROUND(COALESCE(AVG(ep.calificacion), 0), 2)::NUMERIC(10,2) AS calificacion_promedio,
            ROUND(COALESCE(SUM(ep.valor * ep.comision_porcentaje / 100.0), 0), 2)::NUMERIC(12,2) AS comisiones_totales
        FROM entregas_periodo ep
        GROUP BY ep.zona
    )
    SELECT
        z.zona,
        COALESCE(mz.entregas_completadas, 0)::INTEGER,
        COALESCE(mz.comisiones_totales, 0)::NUMERIC(12,2),
        COALESCE(mz.calificacion_promedio, 0)::NUMERIC(10,2),
        COALESCE(cr.riders_rookie, 0)::INTEGER,
        COALESCE(cr.riders_semi_pro, 0)::INTEGER,
        COALESCE(cr.riders_pro, 0)::INTEGER,
        COALESCE(cr.riders_elite, 0)::INTEGER,
        p_fecha_referencia
    FROM zonas z
    LEFT JOIN metricas_zona mz
      ON mz.zona = z.zona
    LEFT JOIN categorias_riders cr
      ON cr.zona = z.zona
    ORDER BY z.zona;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_sincronizar_categoria_rider(
    p_rider_id INTEGER,
    p_fecha_referencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_categoria_correspondiente_id INTEGER;
BEGIN
    SELECT er.categoria_correspondiente_id
      INTO v_categoria_correspondiente_id
    FROM fn_evaluacion_rider(p_rider_id, p_fecha_referencia) er;

    UPDATE riders
       SET categoria_id = v_categoria_correspondiente_id,
           updated_at = NOW()
     WHERE id = p_rider_id
       AND categoria_id IS DISTINCT FROM v_categoria_correspondiente_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_sincronizar_todas_categorias(
    p_fecha_referencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rider RECORD;
BEGIN
    FOR v_rider IN SELECT id FROM riders LOOP
        CALL sp_sincronizar_categoria_rider(v_rider.id, p_fecha_referencia);
    END LOOP;
END;
$$;

CREATE OR REPLACE VIEW vw_riders_dashboard AS
SELECT
    r.id,
    r.nombre,
    r.email,
    r.telefono,
    r.zona,
    c.id AS categoria_actual_id,
    c.nombre AS categoria_actual,
    ev.entregas_completadas_30_dias,
    ev.calificacion_promedio_30_dias,
    ev.categoria_correspondiente_id,
    ev.categoria_correspondiente,
    ev.comisiones_generadas_30_dias,
    ev.fecha_referencia
FROM riders r
JOIN categorias c
  ON c.id = r.categoria_id
CROSS JOIN LATERAL fn_evaluacion_rider(r.id) ev;

CREATE OR REPLACE VIEW vw_entregas_detalle AS
SELECT
    e.id,
    e.rider_id,
    r.nombre AS rider_nombre,
    r.email AS rider_email,
    e.descripcion,
    e.valor,
    e.estado_id,
    es.nombre AS estado,
    e.calificacion,
    e.fecha_creacion,
    e.fecha_actualizacion
FROM entregas e
JOIN riders r
  ON r.id = e.rider_id
JOIN estados es
  ON es.id = e.estado_id;

CREATE OR REPLACE VIEW vw_resumen_zona AS
SELECT *
FROM fn_resumen_zona();

COMMIT;
