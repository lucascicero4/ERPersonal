/**
 * ERP LUCAS v5.0 - Google Apps Script
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Abrí tu Google Sheet
 * 2. Andá a Extensiones > Apps Script
 * 3. Borrá el código y pegá TODO este archivo
 * 4. Guardá (Ctrl+S)
 * 5. Ejecutá la función "setup" para crear/actualizar las hojas
 * 6. "Implementar" > "Nueva implementación" (o actualizar existente)
 *    - Tipo: "Aplicación web"
 *    - Ejecutar como: "Yo"
 *    - Quién tiene acceso: "Cualquier persona"
 * 7. Copiá la URL y pegala en la PWA
 */

const SHEETS = {
    GASTOS: 'Gastos',
    PATRIMONIO: 'Patrimonio',
    INVERSIONES: 'Inversiones',
    MOVIMIENTOS: 'Movimientos',
    INGRESOS: 'Ingresos Mensuales',
    SUSCRIPCIONES: 'Suscripciones',
    CONFIG: 'Config'
};

// ============================================================
// SETUP INICIAL
// ============================================================
function setup() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Hoja: Gastos
    let gastosSheet = ss.getSheetByName(SHEETS.GASTOS);
    if (!gastosSheet) {
        gastosSheet = ss.insertSheet(SHEETS.GASTOS);
        gastosSheet.getRange('A1:I1').setValues([['ID', 'Fecha', 'Categoría', 'Monto', 'Moneda', 'Medio Pago', 'Descripción', 'Timestamp', 'Sincronizado']]);
        formatHeader(gastosSheet, 'A1:I1');
    }
    
    // Hoja: Patrimonio
    let patSheet = ss.getSheetByName(SHEETS.PATRIMONIO);
    if (!patSheet) {
        patSheet = ss.insertSheet(SHEETS.PATRIMONIO);
        patSheet.getRange('A1:D1').setValues([['Cuenta', 'Saldo USD', 'Última Actualización', 'Notas']]);
        formatHeader(patSheet, 'A1:D1');
        patSheet.getRange('A2:D4').setValues([
            ['BBVA', 4605.65, new Date(), 'Cuenta principal'],
            ['Caja Seguridad', 11050, new Date(), 'Efectivo guardado'],
            ['Efectivo', 1125, new Date(), 'Efectivo en mano']
        ]);
    }
    
    // Hoja: Inversiones
    let invSheet = ss.getSheetByName(SHEETS.INVERSIONES);
    if (!invSheet) {
        invSheet = ss.insertSheet(SHEETS.INVERSIONES);
        invSheet.getRange('A1:I1').setValues([['ID', 'Nombre', 'Monto USD', 'Tasa %', 'Frecuencia', 'Fecha Compra', 'Vencimiento', 'Origen', 'Notas']]);
        formatHeader(invSheet, 'A1:I1');
        invSheet.getRange('A2:I4').setValues([
            [1, 'John Deere Credit', 1000, 7, 'Trimestral', '2026-01-13', '2027-01-13', 'BBVA', 'ON'],
            [2, 'CRESUD', 1500, 6.5, 'Semestral', '2026-01-14', '2027-01-14', 'BBVA', 'ON'],
            [3, 'SCANIA', 500, 5.5, 'Trimestral', '2026-01-13', '2027-01-13', 'BBVA', 'ON']
        ]);
    }
    
    // Hoja: Movimientos
    let movSheet = ss.getSheetByName(SHEETS.MOVIMIENTOS);
    if (!movSheet) {
        movSheet = ss.insertSheet(SHEETS.MOVIMIENTOS);
        movSheet.getRange('A1:G1').setValues([['ID', 'Fecha', 'Origen', 'Destino', 'Monto USD', 'Nota', 'Es Ahorro']]);
        formatHeader(movSheet, 'A1:G1');
    }
    
    // Hoja: Ingresos Mensuales
    let ingSheet = ss.getSheetByName(SHEETS.INGRESOS);
    if (!ingSheet) {
        ingSheet = ss.insertSheet(SHEETS.INGRESOS);
        ingSheet.getRange('A1:C1').setValues([['Mes', 'Año', 'Monto']]);
        formatHeader(ingSheet, 'A1:C1');
    }
    
    // Hoja: Suscripciones (NUEVA)
    let subSheet = ss.getSheetByName(SHEETS.SUSCRIPCIONES);
    if (!subSheet) {
        subSheet = ss.insertSheet(SHEETS.SUSCRIPCIONES);
        subSheet.getRange('A1:G1').setValues([['ID', 'Nombre', 'Monto', 'Moneda', 'Medio Pago', 'Categoría', 'Activa']]);
        formatHeader(subSheet, 'A1:G1');
        // Agregar las suscripciones iniciales
        subSheet.getRange('A2:G4').setValues([
            [1, 'Netflix', 22648.81, 'ARS', 'VISA (8043)', 'Servicios', true],
            [2, 'iCloud+', 10, 'USD', 'MASTER (9714)', 'Servicios', true],
            [3, 'Microsoft', 10.53, 'USD', 'VISA (8043)', 'Servicios', true]
        ]);
    }
    
    // Hoja: Config
    let configSheet = ss.getSheetByName(SHEETS.CONFIG);
    if (!configSheet) {
        configSheet = ss.insertSheet(SHEETS.CONFIG);
        configSheet.getRange('A1:B1').setValues([['Parámetro', 'Valor']]);
        formatHeader(configSheet, 'A1:B1');
        configSheet.getRange('A2:B6').setValues([
            ['Cotización USD', 1485],
            ['Última Sync', new Date()],
            ['Versión', '5.0'],
            ['Dólares Ahorro', 0],
            ['Último ID Gasto', 2000]
        ]);
    } else {
        // Actualizar versión si ya existe
        const data = configSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === 'Versión') {
                configSheet.getRange(i + 1, 2).setValue('5.0');
            }
        }
        // Agregar Dólares Ahorro si no existe
        let hasDolaresAhorro = false;
        let hasUltimoId = false;
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === 'Dólares Ahorro') hasDolaresAhorro = true;
            if (data[i][0] === 'Último ID Gasto') hasUltimoId = true;
        }
        if (!hasDolaresAhorro) {
            configSheet.appendRow(['Dólares Ahorro', 0]);
        }
        if (!hasUltimoId) {
            configSheet.appendRow(['Último ID Gasto', 2000]);
        }
    }
    
    return 'Setup v5.0 completado! ✅';
}

function formatHeader(sheet, range) {
    sheet.getRange(range)
        .setFontWeight('bold')
        .setBackground('#22c55e')
        .setFontColor('#000000');
    sheet.setFrozenRows(1);
}

// ============================================================
// API ENDPOINTS
// ============================================================
function doGet(e) {
    try {
        const action = e.parameter.action || 'status';
        let result;
        
        switch(action) {
            case 'getAll':
                result = getAllData();
                break;
            case 'getExpenses':
                result = getExpenses();
                break;
            case 'getPatrimonio':
                result = getPatrimonio();
                break;
            case 'getInversiones':
                result = getInversiones();
                break;
            case 'getMovimientos':
                result = getMovimientos();
                break;
            case 'getIngresos':
                result = getIngresos();
                break;
            case 'getSuscripciones':
                result = getSuscripciones();
                break;
            default:
                result = { success: true, message: 'ERP Lucas API v5.0', status: 'online' };
        }
        
        return jsonResponse(result);
    } catch(error) {
        return jsonResponse({ success: false, error: error.toString() });
    }
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        let result;
        
        switch(data.action) {
            case 'addExpense':
                result = addExpense(data.data);
                break;
            case 'updateExpense':
                result = updateExpense(data.data);
                break;
            case 'deleteExpense':
                result = deleteExpense(data.data.id);
                break;
            case 'updatePatrimonio':
                result = updatePatrimonio(data.data);
                break;
            case 'addInversion':
                result = addInversion(data.data);
                break;
            case 'updateInversion':
                result = updateInversion(data.data);
                break;
            case 'deleteInversion':
                result = deleteInversion(data.data.id);
                break;
            case 'addMovimiento':
                result = addMovimiento(data.data);
                break;
            case 'setMonthlyIncome':
                result = setMonthlyIncome(data.data);
                break;
            case 'setDolaresAhorro':
                result = setDolaresAhorro(data.data.amount);
                break;
            case 'addSuscripcion':
                result = addSuscripcion(data.data);
                break;
            case 'updateSuscripcion':
                result = updateSuscripcion(data.data);
                break;
            case 'deleteSuscripcion':
                result = deleteSuscripcion(data.data.id);
                break;
            case 'aplicarSuscripciones':
                result = aplicarSuscripciones(data.data);
                break;
            default:
                result = { success: false, error: 'Acción no reconocida' };
        }
        
        return jsonResponse(result);
    } catch(error) {
        return jsonResponse({ success: false, error: error.toString() });
    }
}

function jsonResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// FUNCIONES DE LECTURA
// ============================================================
function getAllData() {
    return {
        success: true,
        expenses: getExpenses().data || [],
        patrimonio: getPatrimonio().data || {},
        inversiones: getInversiones().data || [],
        movimientos: getMovimientos().data || [],
        monthlyIncome: getIngresos().data || {},
        suscripciones: getSuscripciones().data || [],
        config: getConfig()
    };
}

function getExpenses() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.GASTOS);
    if (!sheet) return { success: true, data: [] };
    
    const data = sheet.getDataRange().getValues();
    const expenses = [];
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            expenses.push({
                id: data[i][0],
                date: formatDateForExport(data[i][1]),
                category: data[i][2],
                amount: parseFloat(data[i][3]) || 0,
                currency: data[i][4] || 'ARS',
                payment: data[i][5] || '',
                description: data[i][6] || ''
            });
        }
    }
    
    return { success: true, data: expenses };
}

function getPatrimonio() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PATRIMONIO);
    if (!sheet) return { success: true, data: { bbva: 0, caja: 0, efectivo: 0 } };
    
    const data = sheet.getDataRange().getValues();
    const result = { bbva: 0, caja: 0, efectivo: 0 };
    
    for (let i = 1; i < data.length; i++) {
        const cuenta = String(data[i][0]).toLowerCase();
        if (cuenta.includes('bbva')) result.bbva = parseFloat(data[i][1]) || 0;
        else if (cuenta.includes('caja')) result.caja = parseFloat(data[i][1]) || 0;
        else if (cuenta.includes('efectivo')) result.efectivo = parseFloat(data[i][1]) || 0;
    }
    
    return { success: true, data: result };
}

function getInversiones() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVERSIONES);
    if (!sheet) return { success: true, data: [] };
    
    const data = sheet.getDataRange().getValues();
    const inversiones = [];
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            inversiones.push({
                id: data[i][0],
                nombre: data[i][1],
                monto: parseFloat(data[i][2]) || 0,
                tasa: parseFloat(data[i][3]) || 0,
                frecuencia: data[i][4],
                fechaCompra: formatDateForExport(data[i][5]),
                vencimiento: formatDateForExport(data[i][6]),
                origen: data[i][7] || ''
            });
        }
    }
    
    return { success: true, data: inversiones };
}

function getMovimientos() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MOVIMIENTOS);
    if (!sheet) return { success: true, data: [] };
    
    const data = sheet.getDataRange().getValues();
    const movimientos = [];
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            movimientos.push({
                id: data[i][0],
                fecha: formatDateForExport(data[i][1]),
                origen: data[i][2],
                destino: data[i][3],
                monto: parseFloat(data[i][4]) || 0,
                nota: data[i][5] || '',
                esAhorro: data[i][6] === true || data[i][6] === 'TRUE' || data[i][6] === 'true'
            });
        }
    }
    
    return { success: true, data: movimientos };
}

function getIngresos() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INGRESOS);
    if (!sheet) return { success: true, data: {} };
    
    const data = sheet.getDataRange().getValues();
    const result = {};
    
    for (let i = 1; i < data.length; i++) {
        const mes = data[i][0];
        const año = data[i][1];
        const monto = parseFloat(data[i][2]) || 0;
        if (mes && año) {
            const key = `${año}-${String(mes).padStart(2, '0')}`;
            result[key] = monto;
        }
    }
    
    return { success: true, data: result };
}

function getSuscripciones() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SUSCRIPCIONES);
    if (!sheet) return { success: true, data: [] };
    
    const data = sheet.getDataRange().getValues();
    const suscripciones = [];
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            suscripciones.push({
                id: data[i][0],
                nombre: data[i][1],
                monto: parseFloat(data[i][2]) || 0,
                currency: data[i][3] || 'ARS',
                payment: data[i][4] || '',
                category: data[i][5] || 'Servicios',
                activa: data[i][6] === true || data[i][6] === 'TRUE' || data[i][6] === 'true'
            });
        }
    }
    
    return { success: true, data: suscripciones };
}

function getConfig() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
    if (!sheet) return { dolaresAhorro: 0, ultimoIdGasto: 2000 };
    
    const data = sheet.getDataRange().getValues();
    const config = { dolaresAhorro: 0, ultimoIdGasto: 2000 };
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === 'Dólares Ahorro') config.dolaresAhorro = parseFloat(data[i][1]) || 0;
        if (data[i][0] === 'Último ID Gasto') config.ultimoIdGasto = parseInt(data[i][1]) || 2000;
    }
    
    return config;
}

function formatDateForExport(value) {
    if (!value) return '';
    if (value instanceof Date) {
        return Utilities.formatDate(value, 'America/Argentina/Buenos_Aires', 'yyyy-MM-dd');
    }
    return String(value).split('T')[0];
}

// ============================================================
// FUNCIONES DE ESCRITURA - GASTOS
// ============================================================
function addExpense(expense) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.GASTOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    // Obtener nuevo ID
    const config = getConfig();
    const newId = config.ultimoIdGasto + 1;
    updateConfigValue('Último ID Gasto', newId);
    
    sheet.appendRow([
        newId,
        expense.date,
        expense.category,
        expense.amount,
        expense.currency || 'ARS',
        expense.payment || '',
        expense.description || '',
        new Date(),
        'TRUE'
    ]);
    
    return { success: true, id: newId };
}

function updateExpense(expense) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.GASTOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == expense.id) {
            sheet.getRange(i + 1, 2).setValue(expense.date);
            sheet.getRange(i + 1, 3).setValue(expense.category);
            sheet.getRange(i + 1, 4).setValue(expense.amount);
            sheet.getRange(i + 1, 5).setValue(expense.currency);
            sheet.getRange(i + 1, 6).setValue(expense.payment);
            sheet.getRange(i + 1, 7).setValue(expense.description);
            sheet.getRange(i + 1, 8).setValue(new Date());
            return { success: true };
        }
    }
    
    return { success: false, error: 'Gasto no encontrado' };
}

function deleteExpense(id) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.GASTOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
            sheet.deleteRow(i + 1);
            return { success: true };
        }
    }
    
    return { success: false, error: 'Gasto no encontrado' };
}

// ============================================================
// FUNCIONES DE ESCRITURA - PATRIMONIO
// ============================================================
function updatePatrimonio(patrimonio) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PATRIMONIO);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const cuenta = String(data[i][0]).toLowerCase();
        if (cuenta.includes('bbva') && patrimonio.bbva !== undefined) {
            sheet.getRange(i + 1, 2).setValue(patrimonio.bbva);
            sheet.getRange(i + 1, 3).setValue(new Date());
        } else if (cuenta.includes('caja') && patrimonio.caja !== undefined) {
            sheet.getRange(i + 1, 2).setValue(patrimonio.caja);
            sheet.getRange(i + 1, 3).setValue(new Date());
        } else if (cuenta.includes('efectivo') && patrimonio.efectivo !== undefined) {
            sheet.getRange(i + 1, 2).setValue(patrimonio.efectivo);
            sheet.getRange(i + 1, 3).setValue(new Date());
        }
    }
    
    return { success: true };
}

// ============================================================
// FUNCIONES DE ESCRITURA - INVERSIONES
// ============================================================
function addInversion(inv) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVERSIONES);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const id = Date.now();
    sheet.appendRow([
        id,
        inv.nombre,
        inv.monto,
        inv.tasa,
        inv.frecuencia,
        inv.fechaCompra,
        inv.vencimiento,
        inv.origen || '',
        ''
    ]);
    
    return { success: true, id: id };
}

function updateInversion(inv) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVERSIONES);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == inv.id) {
            sheet.getRange(i + 1, 2).setValue(inv.nombre);
            sheet.getRange(i + 1, 3).setValue(inv.monto);
            sheet.getRange(i + 1, 4).setValue(inv.tasa);
            sheet.getRange(i + 1, 5).setValue(inv.frecuencia);
            sheet.getRange(i + 1, 6).setValue(inv.fechaCompra);
            sheet.getRange(i + 1, 7).setValue(inv.vencimiento);
            sheet.getRange(i + 1, 8).setValue(inv.origen || '');
            return { success: true };
        }
    }
    
    return { success: false, error: 'Inversión no encontrada' };
}

function deleteInversion(id) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVERSIONES);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
            sheet.deleteRow(i + 1);
            return { success: true };
        }
    }
    
    return { success: false, error: 'Inversión no encontrada' };
}

// ============================================================
// FUNCIONES DE ESCRITURA - MOVIMIENTOS
// ============================================================
function addMovimiento(mov) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MOVIMIENTOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const id = Date.now();
    sheet.appendRow([
        id,
        mov.fecha,
        mov.origen,
        mov.destino,
        mov.monto,
        mov.nota || '',
        mov.esAhorro ? 'TRUE' : 'FALSE'
    ]);
    
    // Si es ahorro, actualizar el total
    if (mov.esAhorro && mov.destino !== 'GASTO') {
        const config = getConfig();
        updateConfigValue('Dólares Ahorro', config.dolaresAhorro + mov.monto);
    }
    
    return { success: true, id: id };
}

// ============================================================
// FUNCIONES DE ESCRITURA - INGRESOS
// ============================================================
function setMonthlyIncome(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INGRESOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const rows = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.month && rows[i][1] == data.year) {
            sheet.getRange(i + 1, 3).setValue(data.amount);
            found = true;
            break;
        }
    }
    
    if (!found) {
        sheet.appendRow([data.month, data.year, data.amount]);
    }
    
    return { success: true };
}

// ============================================================
// FUNCIONES DE ESCRITURA - CONFIG
// ============================================================
function setDolaresAhorro(amount) {
    return updateConfigValue('Dólares Ahorro', amount);
}

function updateConfigValue(param, value) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
    if (!sheet) return { success: false };
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === param) {
            sheet.getRange(i + 1, 2).setValue(value);
            return { success: true };
        }
    }
    
    // Si no existe, agregar
    sheet.appendRow([param, value]);
    return { success: true };
}

// ============================================================
// FUNCIONES DE SUSCRIPCIONES
// ============================================================
function addSuscripcion(sub) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SUSCRIPCIONES);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const id = Date.now();
    sheet.appendRow([
        id,
        sub.nombre,
        sub.monto,
        sub.currency || 'ARS',
        sub.payment || '',
        sub.category || 'Servicios',
        true
    ]);
    
    return { success: true, id: id };
}

function updateSuscripcion(sub) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SUSCRIPCIONES);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == sub.id) {
            sheet.getRange(i + 1, 2).setValue(sub.nombre);
            sheet.getRange(i + 1, 3).setValue(sub.monto);
            sheet.getRange(i + 1, 4).setValue(sub.currency);
            sheet.getRange(i + 1, 5).setValue(sub.payment);
            sheet.getRange(i + 1, 6).setValue(sub.category);
            sheet.getRange(i + 1, 7).setValue(sub.activa);
            return { success: true };
        }
    }
    
    return { success: false, error: 'Suscripción no encontrada' };
}

function deleteSuscripcion(id) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SUSCRIPCIONES);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == id) {
            sheet.deleteRow(i + 1);
            return { success: true };
        }
    }
    
    return { success: false, error: 'Suscripción no encontrada' };
}

function aplicarSuscripciones(data) {
    // data = { month: 1, year: 2026, date: '2026-01-15' }
    const suscripciones = getSuscripciones().data || [];
    const activas = suscripciones.filter(s => s.activa);
    
    if (activas.length === 0) {
        return { success: false, error: 'No hay suscripciones activas' };
    }
    
    const gastosSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.GASTOS);
    const config = getConfig();
    let currentId = config.ultimoIdGasto;
    
    const results = [];
    
    for (const sub of activas) {
        currentId++;
        gastosSheet.appendRow([
            currentId,
            data.date,
            sub.category,
            sub.monto,
            sub.currency,
            sub.payment,
            sub.nombre + ' (Suscripción)',
            new Date(),
            'TRUE'
        ]);
        results.push({ id: currentId, nombre: sub.nombre });
    }
    
    updateConfigValue('Último ID Gasto', currentId);
    
    return { success: true, applied: results };
}
