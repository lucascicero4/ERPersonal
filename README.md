# 💰 ERP Lucas v2.0

Sistema completo de gestión de finanzas personales con PWA + Google Sheets.

---

## ✨ Novedades v2.0

### Dashboard
- ✅ **Barra de cotizaciones** en tiempo real (BTC, S&P500, Dólar BNA, Oro)
- ✅ **Ingresos editables** por mes
- ✅ **Click en KPIs** para ver detalle
- ✅ **Resumen por medio de pago** (VISA, MASTER, Débito, Efectivo)

### Patrimonio
- ✅ **Click para expandir** cada cuenta y ver opciones
- ✅ **Mover fondos** entre cuentas con historial
- ✅ **Inversiones detalladas**: monto, tasa, frecuencia de pago, vencimiento
- ✅ **CRUD completo** de inversiones (agregar, editar, eliminar)
- ✅ **Historial de movimientos** entre cuentas

### Historial de Gastos
- ✅ **Solapas ARS / USD** para filtrar por moneda
- ✅ **Editar gastos** con click
- ✅ **Eliminar deslizando** a la derecha (swipe)
- ✅ **Filtros por categoría**

### Resumen Anual
- ✅ **Total ingresos/gastos** del año
- ✅ **Dólares netos** (comprados - gastados)
- ✅ **Gráfico comparativo** ingresos vs gastos mensual
- ✅ **Gastos por categoría** anual

### Técnico
- ✅ **Logo correcto** en PWA (verde con $)
- ✅ **Sincronización** con Google Sheets
- ✅ **Funciona offline**
- ✅ **Vista PC optimizada**

---

## 📁 Archivos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | PWA principal |
| `manifest.json` | Config de PWA |
| `sw.js` | Service Worker |
| `icon-*.png` | Iconos de la app |
| `GOOGLE_APPS_SCRIPT.js` | Código para Google Sheets |
| `HISTORIAL_GASTOS.csv` | 524 registros históricos |

---

## 🚀 SETUP

### Paso 1: Google Sheet

1. Creá un Sheet nuevo en [sheets.google.com](https://sheets.google.com)
2. Andá a **Extensiones → Apps Script**
3. Borrá el código y pegá el contenido de `GOOGLE_APPS_SCRIPT.js`
4. Guardá con **Ctrl+S**
5. Ejecutá la función `setup` (crea las hojas automáticamente)
6. **Implementar → Nueva implementación**
   - Tipo: Aplicación web
   - Ejecutar como: Yo
   - Acceso: Cualquier persona
7. Copiá la URL

### Paso 2: Importar Historial

1. En el Sheet, andá a la hoja "Gastos"
2. **Archivo → Importar** → subí `HISTORIAL_GASTOS.csv`
3. Elegí "Agregar al archivo actual"

### Paso 3: Configurar PWA

1. Abrí `index.html` con un editor
2. Buscá `SCRIPT_URL: ''` (línea ~1050)
3. Pegá tu URL:
```javascript
const CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/TU-ID-ACA/exec',
    VERSION: '2.0'
};
```
4. Guardá

### Paso 4: Subir a Internet

**GitHub Pages (gratis)**
1. Subí los archivos a un repo
2. Settings → Pages → Source: main
3. URL: `https://usuario.github.io/repo`

**Netlify/Vercel (gratis)**
1. Arrastrá la carpeta al dashboard
2. Deploy automático

### Paso 5: Instalar en Celular

1. Abrí la URL en el navegador
2. **Android**: Menú → "Agregar a inicio"
3. **iOS**: Compartir → "Agregar a inicio"

---

## 📱 Uso

### Dashboard
- **Flechas ‹ ›**: Cambiar mes
- **Click en KPI**: Ver detalle
- **Botón "✏️ Ingreso"**: Editar ingreso del mes

### Nuevo Gasto
- Ingresá monto, categoría, moneda, medio de pago
- Se sincroniza automáticamente

### Historial
- **Tabs ARS/USD**: Filtrar por moneda
- **Chips de categoría**: Filtrar por categoría
- **Click en gasto**: Editar
- **Deslizar derecha**: Eliminar

### Patrimonio
- **Click en cuenta**: Expandir opciones
- **"↔️ Mover fondos"**: Transferir entre cuentas
- **Click en inversión**: Ver/editar detalle
- **"+ Agregar inversión"**: Nueva inversión

### Resumen Anual
- **Flechas ‹ ›**: Cambiar año
- Ve totales, dólares netos, evolución mensual

---

## 🔗 APIs de Cotizaciones

La app usa APIs gratuitas:
- **Dólar**: [dolarapi.com](https://dolarapi.com)
- **Bitcoin**: [CoinGecko](https://coingecko.com)
- **S&P500 / Oro**: Valores de referencia (actualizar manualmente o integrar API)

---

## 🎨 Estructura del Sheet

| Hoja | Contenido |
|------|-----------|
| **Gastos** | ID, Fecha, Categoría, Monto, Moneda, Medio, Descripción |
| **Patrimonio** | Cuenta, Saldo USD, Última Actualización |
| **Inversiones** | Nombre, Monto, Tasa, Frecuencia, Fechas |
| **Movimientos** | Fecha, Origen, Destino, Monto, Nota |
| **Ingresos Mensuales** | Mes, Año, Monto |
| **Config** | Parámetros generales |

---

## 💡 Tips

1. **Registrá al momento**: No esperes a fin de día
2. **Usá swipe para eliminar**: Es más rápido
3. **Revisá el resumen anual**: Te da perspectiva
4. **Actualizá el patrimonio mensualmente**: Para ver evolución

---

## ❓ Troubleshooting

**No sincroniza**
- Verificá la URL del Apps Script
- Revisá que tenga acceso "Cualquier persona"

**Logo incorrecto en iOS**
- Borrá la app del inicio
- Limpiá caché de Safari
- Agregá de nuevo

**Gráficos no cargan**
- Necesitás conexión la primera vez

---

**Desarrollado con 💚 para Lucas**
