# Tarea 06 — validación

## Objetivo

Verificar que la solución funciona con datos reales y se visualiza correctamente en el entorno de Fabric.

## Entregables

- Build exitoso
- Tests relevantes ejecutados
- Validación final del flujo embed
- Validación manual de interacción y limpieza de filtros en Overview
- Validación manual del panel lateral de slicers dinámicos
- Validación de búsqueda de opciones, rangos y limpieza de filtros manuales

## Criterio de terminado

- La app funciona de forma estable y el diseño se mantiene consistente en la validación final.
- El cross-filter de Overview actualiza KPIs, gráficos y tabla sin errores y permite restaurar el estado completo.
- Los slicers dinámicos descubiertos desde `INFO.VIEW.COLUMNS()` se renderizan con el control adecuado según tipo de dato y afectan al resto de visuales de Overview.

## Nota de estado

- En la implementación actual, la carga del `iframe` embebido en Fabric y del frame `localhost` se ha verificado correctamente.
- La validación funcional completa puede quedar bloqueada si el flujo de autenticación embebida no completa la sesión y la app muestra el estado `Can't open this app outside Fabric`.
