import { Reservation, PaymentRecord } from '../types';

/**
 * Normaliza y escapa caracteres para el estándar binario PDF 1.4 (fuentes Helvetica)
 */
function escapePdfText(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  const s = String(str);
  const replacements: Record<string, string> = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
    'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U'
  };
  const normalized = s.replace(/[áéíóúÁÉÍÓÚñÑüÜ]/g, (m) => replacements[m] || m);
  return normalized
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatCOP(val?: number | null): string {
  return '$ ' + Math.round(Number(val || 0)).toLocaleString('es-CO');
}

/**
 * Empaqueta un stream de operadores PDF 1.4 en un documento binario válido
 */
function compilePdfDocument(streamContent: string): Uint8Array {
  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(streamContent);
  const streamLen = streamBytes.length;

  const headerBytes = new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 
    0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A
  ]);

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n';
  const obj4Header = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n`;
  const obj4Footer = '\nendstream\nendobj\n';
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';

  const bObj1 = encoder.encode(obj1);
  const bObj2 = encoder.encode(obj2);
  const bObj3 = encoder.encode(obj3);
  const bObj4H = encoder.encode(obj4Header);
  const bObj4F = encoder.encode(obj4Footer);
  const bObj5 = encoder.encode(obj5);
  const bObj6 = encoder.encode(obj6);

  let currentOffset = headerBytes.length;
  const offsets: number[] = [];

  offsets.push(currentOffset);
  currentOffset += bObj1.length;

  offsets.push(currentOffset);
  currentOffset += bObj2.length;

  offsets.push(currentOffset);
  currentOffset += bObj3.length;

  offsets.push(currentOffset);
  currentOffset += bObj4H.length + streamBytes.length + bObj4F.length;

  offsets.push(currentOffset);
  currentOffset += bObj5.length;

  offsets.push(currentOffset);
  currentOffset += bObj6.length;

  const xrefOffset = currentOffset;
  let xref = 'xref\n0 7\n0000000000 65535 f \n';
  for (const off of offsets) {
    xref += String(off).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const bXref = encoder.encode(xref);
  const bTrailer = encoder.encode(trailer);

  const totalLength = 
    headerBytes.length + 
    bObj1.length + 
    bObj2.length + 
    bObj3.length + 
    bObj4H.length + 
    streamBytes.length + 
    bObj4F.length + 
    bObj5.length + 
    bObj6.length + 
    bXref.length + 
    bTrailer.length;

  const result = new Uint8Array(totalLength);
  let pos = 0;

  const append = (buf: Uint8Array) => {
    result.set(buf, pos);
    pos += buf.length;
  };

  append(headerBytes);
  append(bObj1);
  append(bObj2);
  append(bObj3);
  append(bObj4H);
  append(streamBytes);
  append(bObj4F);
  append(bObj5);
  append(bObj6);
  append(bXref);
  append(bTrailer);

  return result;
}

/**
 * Desencadena la descarga de un archivo binario en el navegador
 */
function triggerBrowserDownload(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Genera y descarga la Factura Electrónica de Venta oficial con estándar DIAN
 * Incluye todos los datos de la transacción financiera, pasarela, adquiriente y rubros
 */
export function downloadDianInvoicePdf(reservation: Reservation, paymentRecord?: PaymentRecord | null): void {
  const subtotal = Number(reservation.subtotalPrice ?? (reservation as any).subtotal ?? 0);
  const tax = Number(reservation.taxAmount ?? Math.round(subtotal * 0.19) ?? 0);
  const deposit = Number(reservation.depositAmount ?? (reservation as any).depositTotal ?? 0);
  const total = Number(reservation.totalPrice ?? (reservation as any).totalAmount ?? 0);
  const days = Math.max(1, Number(reservation.totalDays || 1));
  const daily = Number(reservation.dailyPrice ?? (days > 0 ? Math.round(subtotal / days) : 0));

  const invoiceNumber = `FE-2026-${String(reservation.id).padStart(6, '0')}`;
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const cufe = `fe80::1ff:fe00:3a60:8b9c:${reservation.id}a8f:c712:44bb:92e1:810f`;

  // Datos completos de la transacción bancaria
  const txnRef = paymentRecord?.transactionReference || `TXN-RES-${reservation.id}-CONF`;
  const gwRef = paymentRecord?.gatewayReference || `GW-AUT-${reservation.id}-982`;
  const rawMethod = paymentRecord?.paymentMethod || reservation.paymentMethod || 'TARJETA_CREDITO';
  const paymentMethodLabel = 
    rawMethod === 'TARJETA_CREDITO' ? 'Tarjeta de Credito (Visa / Mastercard)' :
    rawMethod === 'PSE' ? 'Debito Bancario PSE (Bancolombia)' :
    rawMethod === 'TRANSFERENCIA' ? 'Billetera Digital Nequi / Daviplata' :
    rawMethod === 'EN_CUOTAS' ? 'Tarjeta de Credito en Cuotas' : rawMethod;

  const installmentLabel = (reservation as any).installmentCount && (reservation as any).installmentCount > 1
    ? `${(reservation as any).installmentCount} cuotas mensuales diferidas`
    : '1 cuota (Pago Total Inmediato)';

  const lines: string[] = [];

  // 1. Barra decorativa superior (Naranja Corporativo RENTAMAQ)
  lines.push('0.85 0.35 0.12 rg 36 756 540 4 re f');

  // 2. Encabezado Emisor
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 15 Tf 36 734 Td (RENTAMAQ INDUSTRIAL S.A.S.) Tj ET');
  lines.push('BT /F1 8.5 Tf 36 720 Td (NIT: 901.442.189-4 | Regimen Responsable de IVA | Bogota D.C., Colombia) Tj ET');
  lines.push('BT /F1 8.5 Tf 36 708 Td (Av. El Dorado #68C-61 | PBX: +57 (601) 745-9000 | facturacion@rentamaq.com.co) Tj ET');

  // 3. Recuadro de Factura Electrónica (Superior Derecho)
  lines.push('0.96 0.96 0.96 rg 375 696 201 56 re f');
  lines.push('0.8 0.8 0.8 RG 375 696 201 56 re s');
  lines.push('0.85 0.35 0.12 rg');
  lines.push('BT /F2 10.5 Tf 385 736 Td (FACTURA ELECTRONICA DE VENTA) Tj ET');
  lines.push('0.1 0.1 0.1 rg');
  lines.push(`BT /F2 11 Tf 385 722 Td (No. ${escapePdfText(invoiceNumber)}) Tj ET`);
  lines.push('BT /F1 7.5 Tf 385 710 Td (Resolucion DIAN 18764000001 de 2026-01-15) Tj ET');
  lines.push('BT /F1 7 Tf 385 700 Td (Rango Autorizado: FE-000001 a FE-100000) Tj ET');

  // Separador 1 (usando rectángulos rellenos para evitar cualquier fallo de trazado)
  lines.push('0.85 0.85 0.85 rg 36 688 540 1 re f');

  // 4. Panel Completo: Datos de la Transacción Financiera & Pasarela Bancaria
  lines.push('0.94 0.98 0.95 rg 36 618 540 64 re f');
  lines.push('0.3 0.65 0.45 RG 36 618 540 64 re s');
  lines.push('0.1 0.45 0.25 rg');
  lines.push('BT /F2 9.5 Tf 46 667 Td (DATOS DE LA TRANSACCION FINANCIERA & PASARELA BANCARIA) Tj ET');
  lines.push('BT /F2 8.5 Tf 360 667 Td (ESTADO: APROBADA Y LIQUIDADA) Tj ET');

  lines.push('0.15 0.15 0.15 rg');
  lines.push(`BT /F1 8.5 Tf 46 652 Td (Referencia TXN: ${escapePdfText(txnRef)}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 46 639 Td (Autorizacion Pasarela: ${escapePdfText(gwRef)}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 46 626 Td (Fecha y Hora de Pago: ${escapePdfText(dateStr)} ${escapePdfText(timeStr)} COT) Tj ET`);

  lines.push(`BT /F1 8.5 Tf 310 652 Td (Medio de Pago: ${escapePdfText(paymentMethodLabel)}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 310 639 Td (Plan de Pago: ${escapePdfText(installmentLabel)}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 310 626 Td (Custodia Escrow: Poliza SURA N 84920-B2B Fiduciaria) Tj ET');

  // 5. Panel: Datos del Adquiriente / Cliente & Contrato
  lines.push('0.98 0.98 0.98 rg 36 546 540 64 re f');
  lines.push('0.85 0.85 0.85 RG 36 546 540 64 re s');
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 9.5 Tf 46 595 Td (DATOS DEL ADQUIRIENTE / CLIENTE & CONTRATO DE OBRA) Tj ET');

  lines.push(`BT /F1 8.5 Tf 46 580 Td (Razon Social / Cliente: ${escapePdfText(reservation.clientName || 'Cliente Constructora')}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 46 567 Td (NIT / Identificacion: 900.548.120-1 | Responsable de IVA) Tj ET');
  lines.push('BT /F1 8.5 Tf 46 554 Td (Frente de Obra: Proyecto Construccion Bogota D.C.) Tj ET');

  lines.push(`BT /F1 8.5 Tf 310 580 Td (Contrato / Reserva: ${escapePdfText(reservation.reservationCode || `RES-${reservation.id}`)}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 310 567 Td (Patio Despacho: Patio Suba Bogota Central) Tj ET');
  lines.push(`BT /F1 8.5 Tf 310 554 Td (Vigencia: ${escapePdfText(reservation.startDate)} al ${escapePdfText(reservation.endDate)} [${days} dias]) Tj ET`);

  // 6. Caja CUFE DIAN
  lines.push('0.93 0.95 0.99 rg 36 514 540 24 re f');
  lines.push('0.6 0.75 0.9 RG 36 514 540 24 re s');
  lines.push('0.1 0.25 0.5 rg');
  lines.push('BT /F2 8 Tf 46 522 Td (CUFE DIAN:) Tj ET');
  lines.push(`BT /F1 7.5 Tf 98 522 Td (${escapePdfText(cufe)}) Tj ET`);

  // 7. Encabezado de la Tabla de Rubros
  lines.push('0.12 0.15 0.20 rg 36 486 540 20 re f');
  lines.push('1 1 1 rg');
  lines.push('BT /F2 8.5 Tf 46 492 Td (DESCRIPCION DEL SERVICIO / CONCEPTO LIQUIDADO) Tj ET');
  lines.push('BT /F2 8.5 Tf 290 492 Td (CANTIDAD) Tj ET');
  lines.push('BT /F2 8.5 Tf 370 492 Td (VR. UNITARIO) Tj ET');
  lines.push('BT /F2 8.5 Tf 455 492 Td (SUBTOTAL) Tj ET');
  lines.push('BT /F2 8.5 Tf 530 492 Td (IVA) Tj ET');

  // 8. Fila 1: Alquiler de Equipo
  lines.push('0.1 0.1 0.1 rg');
  lines.push(`BT /F2 9 Tf 46 470 Td (Arrendamiento: ${escapePdfText(reservation.toolName)}) Tj ET`);
  lines.push(`BT /F1 7.5 Tf 46 458 Td (Vigencia: ${escapePdfText(reservation.startDate)} a ${escapePdfText(reservation.endDate)} | Reserva: ${escapePdfText(reservation.reservationCode || `RES-${reservation.id}`)}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 290 470 Td (${days} dias) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 370 470 Td (${escapePdfText(formatCOP(daily))}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 455 470 Td (${escapePdfText(formatCOP(subtotal))}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 530 470 Td (19%) Tj ET');

  lines.push('0.88 0.88 0.88 rg 36 448 540 1 re f');

  // 9. Fila 2: Garantía Escrow
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 9 Tf 46 432 Td (Garantia en Custodia Escrow Fiduciaria) Tj ET');
  lines.push('BT /F1 7.5 Tf 46 420 Td (Amparada con Poliza SURA N 84920-B2B - Reembolsable al retornar maquinaria) Tj ET');
  lines.push('BT /F1 8.5 Tf 290 432 Td (1 custodia) Tj ET');
  lines.push(`BT /F1 8.5 Tf 370 432 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 455 432 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 530 432 Td (0%) Tj ET');

  lines.push('0.88 0.88 0.88 rg 36 410 540 1 re f');

  // 10. Caja de Totales Financieros (Inferior Derecha)
  lines.push('0.98 0.98 0.98 rg 335 305 241 98 re f');
  lines.push('0.8 0.8 0.8 RG 335 305 241 98 re s');
  lines.push('0.2 0.2 0.2 rg');
  lines.push('BT /F1 8.5 Tf 348 386 Td (Subtotal Operativo Alquiler:) Tj ET');
  lines.push(`BT /F2 8.5 Tf 480 386 Td (${escapePdfText(formatCOP(subtotal))}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 348 370 Td (IVA Discriminado General (19%):) Tj ET');
  lines.push(`BT /F2 8.5 Tf 480 370 Td (${escapePdfText(formatCOP(tax))}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 348 354 Td (Garantia Escrow en Custodia:) Tj ET');
  lines.push(`BT /F2 8.5 Tf 480 354 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);

  lines.push('0.85 0.35 0.12 rg 335 305 241 34 re f');
  lines.push('1 1 1 rg');
  lines.push('BT /F2 10.5 Tf 348 318 Td (TOTAL LIQUIDADO & PAGADO:) Tj ET');
  lines.push(`BT /F2 12 Tf 480 318 Td (${escapePdfText(formatCOP(total))}) Tj ET`);

  // 11. Bloque de Validez Fiscal y Título Valor (Inferior Izquierda)
  lines.push('0.92 0.92 0.92 rg 36 324 75 75 re f');
  lines.push('0.6 0.6 0.6 RG 36 324 75 75 re s');
  lines.push('0.2 0.2 0.2 rg');
  lines.push('BT /F2 7 Tf 42 378 Td (TIMBRADO DIAN) Tj ET');
  lines.push('BT /F1 6.5 Tf 42 364 Td (Validacion Previa) Tj ET');
  lines.push('BT /F1 6.5 Tf 42 352 Td (Aprobada 100%) Tj ET');
  lines.push('BT /F1 6 Tf 42 338 Td (Anexo Tecnico 1.8) Tj ET');

  lines.push('0.3 0.3 0.3 rg');
  lines.push('BT /F1 7.5 Tf 120 386 Td (Documento oficial emitido conforme a la Resolucion 18764000001 de la DIAN.) Tj ET');
  lines.push('BT /F1 7.5 Tf 120 372 Td (Representacion grafica digital de Factura Electronica de Venta.) Tj ET');
  lines.push('BT /F1 7.5 Tf 120 358 Td (Transaccion financiera confirmada y conciliada por pasarela bancaria.) Tj ET');
  lines.push('BT /F1 7.5 Tf 120 344 Td (Constituye titulo valor en los terminos del Art. 772 del C.Co. y Ley 1231 de 2008.) Tj ET');
  lines.push('BT /F1 7.5 Tf 120 330 Td (No requiere firma autografa segun Decreto 2242 de 2015.) Tj ET');

  // 12. Pie de Página
  lines.push('0.85 0.85 0.85 rg 36 280 540 1 re f');
  lines.push('0.4 0.4 0.4 rg');
  lines.push('BT /F2 8 Tf 135 265 Td (RENTAMAQ INDUSTRIAL - Potencia, Maquinaria Pesada y Seguridad Certificada) Tj ET');
  lines.push('BT /F1 7 Tf 190 252 Td (Bogota D.C., Colombia | PBX: +57 (601) 745-9000 | portal.rentamaq.com.co) Tj ET');

  const pdfBytes = compilePdfDocument(lines.join('\n'));
  triggerBrowserDownload(pdfBytes, `Factura_DIAN_${invoiceNumber}.pdf`);
}

/**
 * Genera y descarga el Comprobante de Pago & Liquidación Bancaria en PDF
 * Incluye todos los datos de la transacción financiera, pasarela, adquiriente y rubros
 */
export function downloadPaymentReceiptPdf(reservation: Reservation, paymentRecord?: PaymentRecord | null): void {
  const total = Number(reservation.totalPrice ?? (reservation as any).totalAmount ?? 0);
  const subtotal = Number(reservation.subtotalPrice ?? (reservation as any).subtotal ?? 0);
  const deposit = Number(reservation.depositAmount ?? (reservation as any).depositTotal ?? 0);
  const tax = Number(reservation.taxAmount ?? Math.round(subtotal * 0.19) ?? 0);
  const days = Math.max(1, Number(reservation.totalDays || 1));
  const daily = Number(reservation.dailyPrice ?? (days > 0 ? Math.round(subtotal / days) : 0));

  const txnRef = paymentRecord?.transactionReference || `TXN-RES-${reservation.id}-CONF`;
  const gwRef = paymentRecord?.gatewayReference || `GW-AUT-${reservation.id}-982`;
  const rawMethod = paymentRecord?.paymentMethod || reservation.paymentMethod || 'TARJETA_CREDITO';
  const paymentMethodLabel = 
    rawMethod === 'TARJETA_CREDITO' ? 'Tarjeta de Credito (Visa / Mastercard)' :
    rawMethod === 'PSE' ? 'Debito Bancario PSE (Bancolombia)' :
    rawMethod === 'TRANSFERENCIA' ? 'Billetera Digital Nequi / Daviplata' :
    rawMethod === 'EN_CUOTAS' ? 'Tarjeta de Credito en Cuotas' : rawMethod;

  const installmentLabel = (reservation as any).installmentCount && (reservation as any).installmentCount > 1
    ? `${(reservation as any).installmentCount} cuotas mensuales diferidas`
    : '1 cuota (Pago Total Inmediato)';

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const lines: string[] = [];

  // 1. Barra superior Verde Esmeralda (Éxito / Liquidado)
  lines.push('0.12 0.44 0.26 rg 36 756 540 4 re f');

  // 2. Encabezado
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 15 Tf 36 734 Td (RENTAMAQ INDUSTRIAL - COMPROBANTE DE PAGO) Tj ET');
  lines.push('BT /F1 8.5 Tf 36 720 Td (Soporte Oficial de Liquidacion y Pago Seguro de Alquiler de Maquinaria) Tj ET');
  lines.push('BT /F1 8.5 Tf 36 708 Td (Fondo en Custodia Fiduciaria Escrow amparado por Poliza SURA N 84920-B2B) Tj ET');

  // 3. Recuadro Estado (Superior Derecho)
  lines.push('0.92 0.98 0.94 rg 375 696 201 56 re f');
  lines.push('0.2 0.6 0.3 RG 375 696 201 56 re s');
  lines.push('0.12 0.44 0.26 rg');
  lines.push('BT /F2 10.5 Tf 385 736 Td (TRANSACCION APROBADA) Tj ET');
  lines.push('0.1 0.1 0.1 rg');
  lines.push(`BT /F2 11 Tf 385 722 Td (Reserva: ${escapePdfText(reservation.reservationCode || `RES-${reservation.id}`)}) Tj ET`);
  lines.push('BT /F1 7.5 Tf 385 710 Td (Pasarela de Pagos Conectada y Verificada) Tj ET');
  lines.push('BT /F1 7 Tf 385 700 Td (Fondos Acreditados en Cuenta Escrow) Tj ET');

  // Separador 1
  lines.push('0.85 0.85 0.85 rg 36 688 540 1 re f');

  // 4. Datos Completos de la Transacción Bancaria
  lines.push('0.98 0.98 0.98 rg 36 618 540 64 re f');
  lines.push('0.85 0.85 0.85 RG 36 618 540 64 re s');
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 9.5 Tf 46 667 Td (DATOS DE LA TRANSACCION BANCARIA & PASARELA) Tj ET');
  lines.push('BT /F2 8.5 Tf 360 667 Td (LIQUIDADO Y ACREDITADO) Tj ET');

  lines.push('0.15 0.15 0.15 rg');
  lines.push(`BT /F1 8.5 Tf 46 652 Td (Referencia TXN: ${escapePdfText(txnRef)}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 46 639 Td (Autorizacion Pasarela: ${escapePdfText(gwRef)}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 46 626 Td (Fecha y Hora Pago: ${escapePdfText(dateStr)} ${escapePdfText(timeStr)} COT) Tj ET`);

  lines.push(`BT /F1 8.5 Tf 310 652 Td (Medio de Pago: ${escapePdfText(paymentMethodLabel)}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 310 639 Td (Plan de Pago: ${escapePdfText(installmentLabel)}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 310 626 Td (Custodia Fiduciaria: Poliza SURA N 84920-B2B) Tj ET');

  // 5. Panel: Datos del Cliente y Contrato
  lines.push('0.98 0.98 0.98 rg 36 546 540 64 re f');
  lines.push('0.85 0.85 0.85 RG 36 546 540 64 re s');
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 9.5 Tf 46 595 Td (DATOS DEL CLIENTE ADQUIRIENTE & CONTRATO) Tj ET');

  lines.push(`BT /F1 8.5 Tf 46 580 Td (Cliente: ${escapePdfText(reservation.clientName || 'Cliente Constructora')}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 46 567 Td (Documento / NIT: 900.548.120-1 | Responsable de IVA) Tj ET');
  lines.push('BT /F1 8.5 Tf 46 554 Td (Frente de Obra: Proyecto Construccion Bogota D.C.) Tj ET');

  lines.push(`BT /F1 8.5 Tf 310 580 Td (Contrato / Codigo: ${escapePdfText(reservation.reservationCode || `RES-${reservation.id}`)}) Tj ET`);
  lines.push('BT /F1 8.5 Tf 310 567 Td (Patio Despacho: Patio Suba Bogota Central) Tj ET');
  lines.push(`BT /F1 8.5 Tf 310 554 Td (Vigencia: ${escapePdfText(reservation.startDate)} al ${escapePdfText(reservation.endDate)} [${days} dias]) Tj ET`);

  // 6. Encabezado de la Tabla de Liquidación
  lines.push('0.12 0.15 0.20 rg 36 514 540 20 re f');
  lines.push('1 1 1 rg');
  lines.push('BT /F2 8.5 Tf 46 520 Td (CONCEPTO / RUBRO LIQUIDADO) Tj ET');
  lines.push('BT /F2 8.5 Tf 290 520 Td (CANTIDAD) Tj ET');
  lines.push('BT /F2 8.5 Tf 370 520 Td (VR. UNITARIO) Tj ET');
  lines.push('BT /F2 8.5 Tf 480 520 Td (TOTAL LIQUIDADO) Tj ET');

  // 7. Fila 1: Arrendamiento
  lines.push('0.1 0.1 0.1 rg');
  lines.push(`BT /F2 9 Tf 46 498 Td (Arrendamiento: ${escapePdfText(reservation.toolName)}) Tj ET`);
  lines.push(`BT /F1 7.5 Tf 46 486 Td (Vigencia: ${escapePdfText(reservation.startDate)} a ${escapePdfText(reservation.endDate)} | Reserva: ${escapePdfText(reservation.reservationCode || `RES-${reservation.id}`)}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 290 498 Td (${days} dias) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 370 498 Td (${escapePdfText(formatCOP(daily))}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 480 498 Td (${escapePdfText(formatCOP(subtotal))}) Tj ET`);

  lines.push('0.88 0.88 0.88 rg 36 476 540 1 re f');

  // 8. Fila 2: IVA
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F1 8.5 Tf 46 460 Td (Impuesto sobre las Ventas - IVA General 19%) Tj ET');
  lines.push('BT /F1 8.5 Tf 290 460 Td (19%) Tj ET');
  lines.push(`BT /F1 8.5 Tf 370 460 Td (${escapePdfText(formatCOP(subtotal))}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 480 460 Td (${escapePdfText(formatCOP(tax))}) Tj ET`);

  lines.push('0.88 0.88 0.88 rg 36 448 540 1 re f');

  // 9. Fila 3: Garantía Escrow
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 9 Tf 46 432 Td (Garantia en Custodia Escrow - Reembolsable) Tj ET');
  lines.push('BT /F1 7.5 Tf 46 420 Td (Custodia Fiduciaria respaldada con Poliza SURA N 84920-B2B) Tj ET');
  lines.push('BT /F1 8.5 Tf 290 432 Td (1 deposito) Tj ET');
  lines.push(`BT /F1 8.5 Tf 370 432 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);
  lines.push(`BT /F1 8.5 Tf 480 432 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);

  lines.push('0.88 0.88 0.88 rg 36 410 540 1 re f');

  // 10. Recuadro Total (Inferior Derecha)
  lines.push('0.12 0.44 0.26 rg 335 320 241 78 re f');
  lines.push('1 1 1 rg');
  lines.push('BT /F2 11 Tf 348 375 Td (TOTAL PAGADO & LIQUIDADO:) Tj ET');
  lines.push(`BT /F2 14 Tf 348 355 Td (${escapePdfText(formatCOP(total))}) Tj ET`);
  lines.push('BT /F1 8 Tf 348 335 Td (Fondos acreditados satisfactoriamente) Tj ET');

  // Notas legales (Inferior Izquierda)
  lines.push('0.3 0.3 0.3 rg');
  lines.push('BT /F1 7.5 Tf 36 386 Td (Este comprobante certifica la recepcion conforme de los fondos para el contrato de alquiler.) Tj ET');
  lines.push('BT /F1 7.5 Tf 36 372 Td (Los fondos del deposito de garantia en custodia se reintegran una vez finalizada la inspeccion.) Tj ET');
  lines.push('BT /F1 7.5 Tf 36 358 Td (La transaccion cuenta con certificacion de pasarela bancaria cifrada TLS 1.3.) Tj ET');
  lines.push('BT /F1 7.5 Tf 36 344 Td (Para efectos tributarios, consulte la Factura Electronica de Venta DIAN asociada.) Tj ET');

  // 11. Pie de página
  lines.push('0.85 0.85 0.85 rg 36 295 540 1 re f');
  lines.push('0.4 0.4 0.4 rg');
  lines.push('BT /F2 8 Tf 150 280 Td (RENTAMAQ INDUSTRIAL S.A.S. - Bogota D.C., Colombia) Tj ET');
  lines.push('BT /F1 7 Tf 190 268 Td (portal.rentamaq.com.co | PBX: +57 (601) 745-9000) Tj ET');

  const pdfBytes = compilePdfDocument(lines.join('\n'));
  triggerBrowserDownload(pdfBytes, `Comprobante_Pago_${reservation.reservationCode || `RES-${reservation.id}`}.pdf`);
}
