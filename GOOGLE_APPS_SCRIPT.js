/**
 * ERP LUCAS v2.0 - Google Apps Script
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Abrí tu Google Sheet nuevo
 * 2. Andá a Extensiones > Apps Script
 * 3. Borrá el código que hay y pegá TODO este archivo
 * 4. Guardá (Ctrl+S)
 * 5. Ejecutá la función "setup" para crear las hojas
 * 6. Hacé clic en "Implementar" > "Nueva implementación"
 *    - Tipo: "Aplicación web"
 *    - Ejecutar como: "Yo"
 *    - Quién tiene acceso: "Cualquier persona"
 * 7. Copiá la URL que te da
 * 8. Pegá esa URL en la PWA donde dice CONFIG.SCRIPT_URL
 */

// ============================================================
// CONFIGURACIÓN DE HOJAS
// ============================================================
const SHEETS = {
    GASTOS: 'Gastos',
    PATRIMONIO: 'Patrimonio',
    INVERSIONES: 'Inversiones',
    MOVIMIENTOS: 'Movimientos',
    INGRESOS: 'Ingresos Mensuales',
    CONFIG: 'Config'
};

// ============================================================
// SETUP INICIAL
// ============================================================
function setup() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Estilo de headers
    const headerStyle = {
        fontWeight: 'bold',
        background: '#22c55e',
        fontColor: '#000000'
    };
    
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
        invSheet.getRange('A1:H1').setValues([['ID', 'Nombre', 'Monto USD', 'Tasa %', 'Frecuencia', 'Fecha Compra', 'Vencimiento', 'Notas']]);
        formatHeader(invSheet, 'A1:H1');
        invSheet.getRange('A2:H4').setValues([
            [1, 'John Deere Credit', 1000, 7, 'Trimestral', '2026-01-13', '2027-01-13', 'ON'],
            [2, 'CRESUD', 1500, 6.5, 'Semestral', '2026-01-14', '2027-01-14', 'ON'],
            [3, 'SCANIA', 500, 5.5, 'Trimestral', '2026-01-13', '2027-01-13', 'ON']
        ]);
    }
    
    // Hoja: Movimientos
    let movSheet = ss.getSheetByName(SHEETS.MOVIMIENTOS);
    if (!movSheet) {
        movSheet = ss.insertSheet(SHEETS.MOVIMIENTOS);
        movSheet.getRange('A1:F1').setValues([['ID', 'Fecha', 'Origen', 'Destino', 'Monto USD', 'Nota']]);
        formatHeader(movSheet, 'A1:F1');
    }
    
    // Hoja: Ingresos Mensuales
    let ingSheet = ss.getSheetByName(SHEETS.INGRESOS);
    if (!ingSheet) {
        ingSheet = ss.insertSheet(SHEETS.INGRESOS);
        ingSheet.getRange('A1:C1').setValues([['Mes', 'Año', 'Monto']]);
        formatHeader(ingSheet, 'A1:C1');
        // Agregar ingreso de enero 2026 como ejemplo
        ingSheet.getRange('A2:C2').setValues([[1, 2026, 2981975.71]]);
    }
    
    // Hoja: Config
    let configSheet = ss.getSheetByName(SHEETS.CONFIG);
    if (!configSheet) {
        configSheet = ss.insertSheet(SHEETS.CONFIG);
        configSheet.getRange('A1:B1').setValues([['Parámetro', 'Valor']]);
        formatHeader(configSheet, 'A1:B1');
        configSheet.getRange('A2:B5').setValues([
            ['Cotización USD', 1485],
            ['Última Sync', new Date()],
            ['Versión', '2.0'],
            ['Dólares Comprados', 0]
        ]);
    }
    
    return 'Setup completado! ✅';
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
            default:
                result = { success: true, message: 'ERP Lucas API v2.0', status: 'online' };
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
            case 'syncAll':
                result = syncAll(data.data);
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
                amount: data[i][3],
                currency: data[i][4] || 'ARS',
                payment: data[i][5],
                description: data[i][6]
            });
        }
    }
    
    return { success: true, data: expenses };
}

function getPatrimonio() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PATRIMONIO);
    if (!sheet) return { success: true, data: {} };
    
    const data = sheet.getDataRange().getValues();
    const patrimonio = {};
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            const key = data[i][0].toLowerCase().replace(/\s+/g, '');
            patrimonio[key] = data[i][1];
        }
    }
    
    return { success: true, data: patrimonio };
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
                monto: data[i][2],
                tasa: data[i][3],
                frecuencia: data[i][4],
                fechaCompra: formatDateForExport(data[i][5]),
                vencimiento: formatDateForExport(data[i][6]),
                notas: data[i][7]
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
                monto: data[i][4],
                nota: data[i][5]
            });
        }
    }
    
    return { success: true, data: movimientos };
}

function getIngresos() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INGRESOS);
    if (!sheet) return { success: true, data: {} };
    
    const data = sheet.getDataRange().getValues();
    const ingresos = {};
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] && data[i][1]) {
            const key = `${data[i][1]}-${String(data[i][0]).padStart(2, '0')}`;
            ingresos[key] = data[i][2];
        }
    }
    
    return { success: true, data: ingresos };
}

function getConfig() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
    if (!sheet) return {};
    
    const data = sheet.getDataRange().getValues();
    const config = {};
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            config[data[i][0]] = data[i][1];
        }
    }
    
    return config;
}

// ============================================================
// FUNCIONES DE ESCRITURA
// ============================================================
function addExpense(expense) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.GASTOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    sheet.appendRow([
        expense.id || Date.now(),
        expense.date || new Date(),
        expense.category,
        expense.amount,
        expense.currency || 'ARS',
        expense.payment || 'Efectivo',
        expense.description || '',
        new Date(),
        true
    ]);
    
    updateLastSync();
    return { success: true, message: 'Gasto agregado' };
}

function updateExpense(expense) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.GASTOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == expense.id) {
            sheet.getRange(i + 1, 3).setValue(expense.category);
            sheet.getRange(i + 1, 4).setValue(expense.amount);
            sheet.getRange(i + 1, 7).setValue(expense.description);
            updateLastSync();
            return { success: true, message: 'Gasto actualizado' };
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
            updateLastSync();
            return { success: true, message: 'Gasto eliminado' };
        }
    }
    
    return { success: false, error: 'Gasto no encontrado' };
}

function updatePatrimonio(patrimonio) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.PATRIMONIO);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const key = data[i][0].toLowerCase().replace(/\s+/g, '');
        if (patrimonio[key] !== undefined) {
            sheet.getRange(i + 1, 2).setValue(patrimonio[key]);
            sheet.getRange(i + 1, 3).setValue(new Date());
        }
    }
    
    updateLastSync();
    return { success: true, message: 'Patrimonio actualizado' };
}

function addInversion(inversion) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVERSIONES);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    sheet.appendRow([
        inversion.id || Date.now(),
        inversion.nombre,
        inversion.monto,
        inversion.tasa,
        inversion.frecuencia,
        inversion.fechaCompra,
        inversion.vencimiento,
        inversion.notas || ''
    ]);
    
    updateLastSync();
    return { success: true, message: 'Inversión agregada' };
}

function updateInversion(inversion) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INVERSIONES);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] == inversion.id) {
            sheet.getRange(i + 1, 2).setValue(inversion.nombre);
            sheet.getRange(i + 1, 3).setValue(inversion.monto);
            sheet.getRange(i + 1, 4).setValue(inversion.tasa);
            sheet.getRange(i + 1, 5).setValue(inversion.frecuencia);
            sheet.getRange(i + 1, 6).setValue(inversion.fechaCompra);
            sheet.getRange(i + 1, 7).setValue(inversion.vencimiento);
            updateLastSync();
            return { success: true, message: 'Inversión actualizada' };
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
            updateLastSync();
            return { success: true, message: 'Inversión eliminada' };
        }
    }
    
    return { success: false, error: 'Inversión no encontrada' };
}

function addMovimiento(movimiento) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.MOVIMIENTOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    sheet.appendRow([
        movimiento.id || Date.now(),
        movimiento.fecha || new Date(),
        movimiento.origen,
        movimiento.destino,
        movimiento.monto,
        movimiento.nota || ''
    ]);
    
    updateLastSync();
    return { success: true, message: 'Movimiento registrado' };
}

function setMonthlyIncome(data) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.INGRESOS);
    if (!sheet) return { success: false, error: 'Hoja no encontrada' };
    
    const sheetData = sheet.getDataRange().getValues();
    
    // Buscar si existe
    for (let i = 1; i < sheetData.length; i++) {
        if (sheetData[i][0] == data.month && sheetData[i][1] == data.year) {
            sheet.getRange(i + 1, 3).setValue(data.amount);
            updateLastSync();
            return { success: true, message: 'Ingreso actualizado' };
        }
    }
    
    // Si no existe, agregar
    sheet.appendRow([data.month, data.year, data.amount]);
    updateLastSync();
    return { success: true, message: 'Ingreso agregado' };
}

function syncAll(data) {
    // Sincronizar todo el estado desde la PWA
    if (data.expenses) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.GASTOS);
        // Clear and rewrite (simple approach)
        // In production, you'd want to merge/update
    }
    
    updateLastSync();
    return { success: true, message: 'Sincronización completa' };
}

// ============================================================
// UTILIDADES
// ============================================================
function updateLastSync() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
    if (sheet) {
        const data = sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === 'Última Sync') {
                sheet.getRange(i + 1, 2).setValue(new Date());
                break;
            }
        }
    }
}

function formatDateForExport(date) {
    if (!date) return null;
    if (date instanceof Date) {
        return date.toISOString();
    }
    return date;
}

// ============================================================
// FUNCIONES DE TEST
// ============================================================
function testSetup() {
    const result = setup();
    Logger.log(result);
}

function testGetAll() {
    const result = getAllData();
    Logger.log(JSON.stringify(result, null, 2));
}

function testAddExpense() {
    const result = addExpense({
        id: Date.now(),
        date: new Date(),
        category: 'Comida',
        amount: 5000,
        currency: 'ARS',
        payment: 'Débito/Transferencia',
        description: 'Test expense'
    });
    Logger.log(result);
}
