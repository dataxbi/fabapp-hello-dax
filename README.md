
# Fabric Apps - Hello DAX

Una aplicación de Fabric creada con la plantilla Data App de Rayfin y que se conecta a un modelo semántico de ventas.

![Pantallazo de la portada del cuadro de mando de ventas](/dataXbi-fabric-apps-hello-dax.png)

## Estado actual

La aplicación incluye actualmente:

- Shell multipágina para `Overview`, `Regiones`, `Portfolio` y `Clientes`
- Visuales `VegaVisual` y tablas `DataGrid` alimentados con DAX en tiempo real
- Cross-filter manual en `Overview` entre KPIs, gráficos y tabla
- Capa base de componentes UI inspirada en `shadcn/ui` bajo `src/components/ui/`
- Panel dinámico de filtros en `Overview` que descubre dimensiones del modelo con `INFO.VIEW.COLUMNS()`

## Filtros dinámicos del modelo

En la portada `Overview` se ha añadido un sistema de slicers dinámicos con estas reglas:

- La definición de filtros se descubre en runtime usando metadatos DAX del modelo semántico.
- Solo se exponen dimensiones visibles y útiles; no se muestran columnas técnicas evidentes.
- Los valores de filtros de texto se cargan bajo demanda al abrir cada selector.
- Los filtros de fecha y numéricos calculan su rango disponible con queries DAX específicas.
- Los filtros activos se traducen a DAX y se aplican a las queries ya existentes mediante `CALCULATETABLE`, `TREATAS` y `FILTER(ALL(...))`.

## UI y componentes

La UI se ha estandarizado de forma incremental con primitives abiertas basadas en `shadcn/ui`:

- `Card` para panels
- `Button`, `Badge` e `Input`
- `Popover` + `Command` para comboboxes de búsqueda
- `Sheet` para el panel lateral de filtros

La lógica de negocio de filtros sigue separada de la UI; los componentes de `src/components/ui/` son reutilizables y la composición específica de negocio vive en `src/components/pages/`.

## Validación

Verificado localmente:

- `npm run test`
- `npm run build`
- `npm run lint` con warnings existentes de fast-refresh, sin errores

La carga del `iframe` embebido en Fabric se verificó correctamente, pero la validación funcional completa de la portada puede quedar bloqueada si el flujo embebido de autenticación no completa la sesión y la app muestra el mensaje `Can't open this app outside Fabric`.

