# GitHub Copilot instructions

La implementación de esta app debe seguir como referencia principal:

- `docs/especificacion-cuadro-mando-ventas.md`
- `docs/tareas/01-modelo-y-conexion.md`
- `docs/tareas/02-consultas-dax.md`
- `docs/tareas/03-branding-y-diseno.md`
- `docs/tareas/04-overview-ejecutiva.md`
- `docs/tareas/05-paginas-de-detalle.md`
- `docs/tareas/06-validacion.md`

Reglas operativas clave:

1. Sustituir el template inicial por una app multipágina sobre el modelo semántico `Ventas`.
2. Usar únicamente datos reales del modelo publicado en Fabric; no introducir datos mock.
3. Organizar las consultas DAX en `src/queries/` por dominio, con archivos `.dax`, metadatos de columnas y especificaciones Vega-Lite.
4. Aplicar identidad visual Dataxbi usando los recursos de `resources/` y formato `es-ES`.
5. Validar el resultado con build, tests relevantes y flujo embed de Fabric.
6. Respetar la política de commits definida en `docs/especificacion-cuadro-mando-ventas.md`: documentación con Nelson López como autor y Copilot como coautor; código con Copilot como autor sin coautor.
