# Notificación anual de higiene de manos

Formulario basado en `Notif_anual_Higie_Manos_2025.xls`. Registra infraestructura y capacitación mediante GitHub Pages, Power Automate y Excel Online.

## Preparar el archivo para Power Automate

El archivo original está en formato `.xls` y contiene formularios con celdas combinadas. El conector de Excel Online necesita un archivo `.xlsx` y una tabla.

1. Abra `Notif_anual_Higie_Manos_2025.xls` desde Excel.
2. Use **Archivo > Guardar como** y guárdelo en OneDrive como `Notif_anual_Higie_Manos_2025.xlsx`.
3. Cree una hoja nueva llamada `Registros`.
4. Pegue en la fila 1 estos encabezados (separados aquí por `|`):

```text
ID | Cod_prestador | Institucion | Fecha_Diligenciamiento | Responsable_Diligenciamiento | Correo | PuntosAtencion | PuntosConElementos | IndicadorInfraestructura | Cat1Periodo | Cat1Total | Cat1Capacitados | Cat1Indicador | Cat2Periodo | Cat2Total | Cat2Capacitados | Cat2Indicador | Cat3Periodo | Cat3Total | Cat3Capacitados | Cat3Indicador | Cat4Periodo | Cat4Total | Cat4Capacitados | Cat4Indicador | TotalTrabajadores | TotalCapacitados | IndicadorCapacitacion
```

5. Seleccione la fila de encabezados y una fila vacía debajo; elija **Insertar > Tabla** y marque **La tabla tiene encabezados**.
6. En **Diseño de tabla**, cambie el nombre a `Registros`.
7. Guarde y cierre el archivo.

## Crear el flujo

1. En Power Automate cree un **flujo de nube automatizado**.
2. Use el disparador **Cuando se recibe una solicitud HTTP**.
3. En **Esquema JSON del cuerpo de la solicitud**, pegue el contenido del archivo `power-automate-schema.json` de este proyecto.
4. Agregue **Excel Online (Business) > Agregar una fila a una tabla**.
5. Seleccione OneDrive, `Notif_anual_Higie_Manos_2025.xlsx` y la tabla `Registros`.
6. Relacione cada columna de Excel con el contenido dinámico equivalente del disparador.
7. Agregue la acción **Respuesta** con estado `200`, cuerpo `{"ok":true}` y encabezado `Access-Control-Allow-Origin` con valor `*`.
8. Guarde el flujo, copie la URL HTTP POST del disparador y péguela en `config.js`.

## Publicar

Publique estos archivos en GitHub Pages. La URL de Power Automate se lee desde `config.js`.
