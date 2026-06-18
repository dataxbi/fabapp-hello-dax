# Tarea 02 — consultas DAX

## Objetivo

Definir las consultas DAX por página y por visual, reutilizando las medidas del modelo y añadiendo comparativas temporales en la capa de query.

## Entregables

- Carpeta `src/queries/` organizada por dominio
- Archivos `.dax` validados
- Metadatos de columnas y especificaciones Vega-Lite
- Factories de query preparadas para aceptar filtros dinámicos desde interacción en Overview
- Queries de metadatos para descubrir dimensiones elegibles con `INFO.VIEW.COLUMNS()`
- Queries auxiliares para cargar valores de slicers bajo demanda y calcular rangos para fecha/numérico

## Criterio de terminado

- Todas las visualizaciones y tablas consumen datos reales del modelo sin datos mock.
- Las queries de Overview admiten parámetros de filtro para periodo, región, canal o categoría cuando proceda.
- Las queries de Overview admiten además filtros dinámicos inyectados desde metadatos del modelo.
- La carga de listas de valores no se hace de forma global al entrar en la página; cada slicer resuelve sus opciones cuando el usuario interactúa con él.
