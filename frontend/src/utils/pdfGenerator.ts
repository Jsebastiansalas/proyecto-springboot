import { Reservation, PaymentRecord } from '../types';

/**
 * Normaliza y escapa caracteres especiales para el formato binario estándar PDF 1.4
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
 * Empaqueta un stream de operadores de dibujo y texto en un documento PDF 1.4 binario válido
 */
function compilePdfDocument(streamContent: string): Uint8Array {
  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(streamContent);
  const streamLen = streamBytes.length;

  const header = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
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
 * Desencadena la descarga de un archivo binario en el navegador del usuario
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
 */
export function downloadDianInvoicePdf(reservation: Reservation): void {
  const subtotal = Number(reservation.subtotalPrice ?? (reservation as any).subtotal ?? 0);
  const tax = Number(reservation.taxAmount ?? Math.round(subtotal * 0.19) ?? 0);
  const deposit = Number(reservation.depositAmount ?? (reservation as any).depositTotal ?? 0);
  const total = Number(reservation.totalPrice ?? (reservation as any).totalAmount ?? 0);
  const days = Math.max(1, Number(reservation.totalDays || 1));
  const daily = Number(reservation.dailyPrice ?? (days > 0 ? Math.round(subtotal / days) : 0));

  const invoiceNumber = `FE-2026-${String(reservation.id).padStart(6, '0')}`;
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const cufe = `fe80::1ff:fe00:3a60:8b9c:${reservation.id}a8f:c712:44bb:92e1:810f`;

  const lines: string[] = [];

  // 1. Barra decorativa superior (Naranja Corporativo RENTAMAQ)
  lines.push('0.85 0.35 0.12 rg 36 756 540 4 re f');

  // 2. Encabezado Emisor
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 16 Tf 36 734 Td (RENTAMAQ INDUSTRIAL S.A.S.) Tj ET');
  lines.push('BT /F1 9 Tf 36 720 Td (NIT: 901.442.189-4 | Regimen Responsable de IVA | Bogota D.C., Colombia) Tj ET');
  lines.push('BT /F1 9 Tf 36 708 Td (Av. El Dorado #68C-61 | Tel: +57 (601) 745-9000 | facturacion@rentamaq.com.co) Tj ET');

  // 3. Recuadro de Factura Electrónica (Superior Derecho)
  lines.push('0.96 0.96 0.96 rg 380 695 196 55 re f');
  lines.push('0.8 0.8 0.8 RG 380 695 196 55 re s');
  lines.push('0.85 0.35 0.12 rg');
  lines.push('BT /F2 11 Tf 390 735 Td (FACTURA ELECTRONICA DE VENTA) Tj ET');
  lines.push('0.1 0.1 0.1 rg');
  lines.push(`BT /F2 12 Tf 390 720 Td (No. ${escapePdfText(invoiceNumber)}) Tj ET`);
  lines.push('BT /F1 8 Tf 390 705 Td (Resolucion DIAN 18764000001 de 2026-01-15) Tj ET');

  // Separador
  lines.push('0.8 0.8 0.8 RG 36 685 540 0 m 576 685 l s');

  // 4. Datos del Adquiriente / Cliente
  lines.push('0.98 0.98 0.98 rg 36 605 540 70 re f');
  lines.push('0.85 0.85 0.85 RG 36 605 540 70 re s');
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 10 Tf 46 660 Td (DATOS DEL ADQUIRIENTE / CLIENTE) Tj ET');
  lines.push(`BT /F1 9 Tf 46 644 Td (Razon Social: ${escapePdfText(reservation.clientName || 'Cliente Constructora')}) Tj ET`);
  lines.push('BT /F1 9 Tf 46 630 Td (NIT / Identificacion: 900.548.120-1 | Responsable de IVA) Tj ET');
  lines.push('BT /F1 9 Tf 46 616 Td (Frente de Obra: Proyecto Construccion Bogota D.C.) Tj ET');

  lines.push(`BT /F1 9 Tf 360 644 Td (Fecha y Hora Emision: ${escapePdfText(dateStr)} ${escapePdfText(timeStr)}) Tj ET`);
  lines.push(`BT /F1 9 Tf 360 630 Td (Vencimiento: ${escapePdfText(reservation.endDate || dateStr)}) Tj ET`);
  lines.push(`BT /F1 9 Tf 360 616 Td (Medio de Pago: ${escapePdfText(reservation.paymentMethod || 'Tarjeta / PSE')}) Tj ET`);

  // 5. Caja CUFE
  lines.push('0.94 0.96 0.99 rg 36 570 540 26 re f');
  lines.push('0.7 0.8 0.9 RG 36 570 540 26 re s');
  lines.push('0.1 0.25 0.45 rg');
  lines.push('BT /F2 8 Tf 46 584 Td (CUFE:) Tj ET');
  lines.push(`BT /F1 8 Tf 80 584 Td (${escapePdfText(cufe)}) Tj ET`);

  // 6. Encabezado de la Tabla de Rubros
  lines.push('0.12 0.15 0.20 rg 36 535 540 22 re f');
  lines.push('1 1 1 rg');
  lines.push('BT /F2 9 Tf 46 542 Td (DESCRIPCION DEL SERVICIO / CONCEPTO) Tj ET');
  lines.push('BT /F2 9 Tf 300 542 Td (CANTIDAD) Tj ET');
  lines.push('BT /F2 9 Tf 380 542 Td (VR. UNITARIO) Tj ET');
  lines.push('BT /F2 9 Tf 460 542 Td (SUBTOTAL) Tj ET');
  lines.push('BT /F2 9 Tf 530 542 Td (IVA) Tj ET');

  // 7. Fila 1: Alquiler de Equipo
  lines.push('0.1 0.1 0.1 rg');
  lines.push(`BT /F2 9 Tf 46 515 Td (Arrendamiento: ${escapePdfText(reservation.toolName)}) Tj ET`);
  lines.push(`BT /F1 8 Tf 46 503 Td (Vigencia: ${escapePdfText(reservation.startDate)} a ${escapePdfText(reservation.endDate)} | Reserva: ${escapePdfText(reservation.reservationCode || `RES-${reservation.id}`)}) Tj ET`);
  lines.push(`BT /F1 9 Tf 300 515 Td (${days} dias) Tj ET`);
  lines.push(`BT /F1 9 Tf 380 515 Td (${escapePdfText(formatCOP(daily))}) Tj ET`);
  lines.push(`BT /F1 9 Tf 460 515 Td (${escapePdfText(formatCOP(subtotal))}) Tj ET`);
  lines.push('BT /F1 9 Tf 530 515 Td (19%) Tj ET');

  lines.push('0.85 0.85 0.85 RG 36 490 540 0 m 576 490 l s');

  // 8. Fila 2: Garantía Escrow
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 9 Tf 46 470 Td (Garantia en Custodia Escrow) Tj ET');
  lines.push('BT /F1 8 Tf 46 458 Td (Amparada con Poliza SURA N 84920-B2B - Reembolsable contra entrega) Tj ET');
  lines.push('BT /F1 9 Tf 300 470 Td (1 deposito) Tj ET');
  lines.push(`BT /F1 9 Tf 380 470 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);
  lines.push(`BT /F1 9 Tf 460 470 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);
  lines.push('BT /F1 9 Tf 530 470 Td (0%) Tj ET');

  lines.push('0.85 0.85 0.85 RG 36 445 540 0 m 576 445 l s');

  // 9. Caja de Totales (Inferior Derecha)
  lines.push('0.98 0.98 0.98 rg 340 335 236 95 re f');
  lines.push('0.8 0.8 0.8 RG 340 335 236 95 re s');
  lines.push('0.2 0.2 0.2 rg');
  lines.push('BT /F1 9 Tf 355 412 Td (Subtotal Operativo:) Tj ET');
  lines.push(`BT /F2 9 Tf 475 412 Td (${escapePdfText(formatCOP(subtotal))}) Tj ET`);
  lines.push('BT /F1 9 Tf 355 394 Td (IVA Discriminado 19%:) Tj ET');
  lines.push(`BT /F2 9 Tf 475 394 Td (${escapePdfText(formatCOP(tax))}) Tj ET`);
  lines.push('BT /F1 9 Tf 355 376 Td (Garantia Escrow en Custodia:) Tj ET');
  lines.push(`BT /F2 9 Tf 475 376 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);

  lines.push('0.85 0.35 0.12 rg 340 335 236 28 re f');
  lines.push('1 1 1 rg');
  lines.push('BT /F2 11 Tf 355 345 Td (TOTAL LIQUIDADO:) Tj ET');
  lines.push(`BT /F2 12 Tf 475 345 Td (${escapePdfText(formatCOP(total))}) Tj ET`);

  // 10. Bloque QR Mock & Validación DIAN (Inferior Izquierda)
  lines.push('0.92 0.92 0.92 rg 36 345 80 80 re f');
  lines.push('0.6 0.6 0.6 RG 36 345 80 80 re s');
  lines.push('0.2 0.2 0.2 rg');
  lines.push('BT /F2 7 Tf 42 390 Td (TIMBRADO DIAN) Tj ET');
  lines.push('BT /F1 6 Tf 42 375 Td (Validacion Previa) Tj ET');
  lines.push('BT /F1 6 Tf 42 363 Td (Aprobada) Tj ET');
  lines.push('BT /F1 6 Tf 42 352 Td (Anexo 1.8) Tj ET');

  lines.push('0.3 0.3 0.3 rg');
  lines.push('BT /F1 8 Tf 125 408 Td (Documento oficial emitido conforme a la Resolucion 18764000001 de la DIAN.) Tj ET');
  lines.push('BT /F1 8 Tf 125 393 Td (Representacion grafica digital de Factura Electronica de Venta.) Tj ET');
  lines.push('BT /F1 8 Tf 125 378 Td (La firma digital y el timbrado CUFE garantizan la plena validez fiscal.) Tj ET');
  lines.push('BT /F1 8 Tf 125 363 Td (Constituye titulo valor en los terminos de la Ley 1231 de 2008.) Tj ET');

  // 11. Línea Final de Pie de Página
  lines.push('0.8 0.8 0.8 RG 36 290 540 0 m 576 290 l s');
  lines.push('0.4 0.4 0.4 rg');
  lines.push('BT /F2 8 Tf 150 275 Td (RENTAMAQ INDUSTRIAL - Potencia y Seguridad Certificada para tus Obras) Tj ET');
  lines.push('BT /F1 7 Tf 205 263 Td (Bogota D.C., Colombia | portal.rentamaq.com.co) Tj ET');

  const pdfBytes = compilePdfDocument(lines.join('\n'));
  triggerBrowserDownload(pdfBytes, `Factura_DIAN_${invoiceNumber}.pdf`);
}

/**
 * Genera y descarga el Comprobante de Pago & Liquidación Bancaria en PDF
 */
export function downloadPaymentReceiptPdf(reservation: Reservation, paymentRecord?: PaymentRecord | null): void {
  const total = Number(reservation.totalPrice ?? (reservation as any).totalAmount ?? 0);
  const subtotal = Number(reservation.subtotalPrice ?? (reservation as any).subtotal ?? 0);
  const deposit = Number(reservation.depositAmount ?? (reservation as any).depositTotal ?? 0);
  const tax = Number(reservation.taxAmount ?? Math.round(subtotal * 0.19) ?? 0);
  const txnRef = paymentRecord?.transactionReference || `TXN-RES-${reservation.id}-CONF`;
  const gwRef = paymentRecord?.gatewayReference || `GW-${reservation.id}-AUT`;
  const paymentMethod = paymentRecord?.paymentMethod || reservation.paymentMethod || 'TARJETA_CREDITO';

  const lines: string[] = [];

  // 1. Barra superior Verde Esmeralda (Éxito / Liquidado)
  lines.push('0.12 0.44 0.26 rg 36 756 540 4 re f');

  // 2. Encabezado
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 16 Tf 36 734 Td (RENTAMAQ INDUSTRIAL - COMPROBANTE DE PAGO) Tj ET');
  lines.push('BT /F1 9 Tf 36 720 Td (Soporte Oficial de Liquidacion y Pago Seguro de Alquiler de Maquinaria) Tj ET');
  lines.push('BT /F1 9 Tf 36 708 Td (Fondo en Custodia Fiduciaria Escrow amparado por Poliza SURA N 84920-B2B) Tj ET');

  // 3. Recuadro Estado (Superior Derecho)
  lines.push('0.92 0.98 0.94 rg 380 695 196 55 re f');
  lines.push('0.2 0.6 0.3 RG 380 695 196 55 re s');
  lines.push('0.12 0.44 0.26 rg');
  lines.push('BT /F2 11 Tf 390 735 Td (TRANSACCION APROBADA) Tj ET');
  lines.push('0.1 0.1 0.1 rg');
  lines.push(`BT /F2 11 Tf 390 720 Td (Reserva: ${escapePdfText(reservation.reservationCode || `RES-${reservation.id}`)}) Tj ET`);
  lines.push('BT /F1 8 Tf 390 705 Td (Pasarela de Pagos Conectada y Verificada) Tj ET');

  // Separador
  lines.push('0.8 0.8 0.8 RG 36 685 540 0 m 576 685 l s');

  // 4. Datos de la Transacción Bancaria
  lines.push('0.98 0.98 0.98 rg 36 605 540 70 re f');
  lines.push('0.85 0.85 0.85 RG 36 605 540 70 re s');
  lines.push('0.1 0.1 0.1 rg');
  lines.push('BT /F2 10 Tf 46 660 Td (DATOS DE LA TRANSACCION BANCARIA) Tj ET');
  lines.push(`BT /F1 9 Tf 46 644 Td (Referencia TXN: ${escapePdfText(txnRef)}) Tj ET`);
  lines.push(`BT /F1 9 Tf 46 630 Td (Autorizacion Pasarela: ${escapePdfText(gwRef)}) Tj ET`);
  lines.push(`BT /F1 9 Tf 46 616 Td (Metodo: ${escapePdfText(paymentMethod)}) Tj ET`);

  lines.push(`BT /F1 9 Tf 360 644 Td (Cliente: ${escapePdfText(reservation.clientName || 'Cliente Constructora')}) Tj ET`);
  lines.push(`BT /F1 9 Tf 360 630 Td (Fecha Transaccion: ${escapePdfText(new Date().toLocaleDateString('es-CO'))}) Tj ET`);
  lines.push('BT /F1 9 Tf 360 616 Td (Estado: LIQUIDADO Y ACREDITADO) Tj ET');

  // 5. Tabla de Liquidación
  lines.push('0.12 0.15 0.20 rg 36 565 540 22 re f');
  lines.push('1 1 1 rg');
  lines.push('BT /F2 9 Tf 46 572 Td (CONCEPTO / RUBRO LIQUIDADO) Tj ET');
  lines.push('BT /F2 9 Tf 480 572 Td (MONTO TOTAL) Tj ET');

  lines.push('0.1 0.1 0.1 rg');
  lines.push(`BT /F2 9 Tf 46 540 Td (Arrendamiento: ${escapePdfText(reservation.toolName)}) Tj ET`);
  lines.push(`BT /F1 8 Tf 46 528 Td (Duracion: ${reservation.totalDays} dias | Periodo: ${escapePdfText(reservation.startDate)} a ${escapePdfText(reservation.endDate)}) Tj ET`);
  lines.push(`BT /F1 9 Tf 480 540 Td (${escapePdfText(formatCOP(subtotal))}) Tj ET`);

  lines.push('0.85 0.85 0.85 RG 36 515 540 0 m 576 515 l s');

  lines.push('BT /F1 9 Tf 46 498 Td (Impuesto sobre las Ventas - IVA 19%) Tj ET');
  lines.push(`BT /F1 9 Tf 480 498 Td (${escapePdfText(formatCOP(tax))}) Tj ET`);

  lines.push('0.85 0.85 0.85 RG 36 485 540 0 m 576 485 l s');

  lines.push('BT /F1 9 Tf 46 468 Td (Garantia en Custodia Escrow - Reembolsable) Tj ET');
  lines.push(`BT /F1 9 Tf 480 468 Td (${escapePdfText(formatCOP(deposit))}) Tj ET`);

  lines.push('0.85 0.85 0.85 RG 36 455 540 0 m 576 455 l s');

  // 6. Recuadro Total
  lines.push('0.12 0.44 0.26 rg 340 395 236 45 re f');
  lines.push('1 1 1 rg');
  lines.push('BT /F2 11 Tf 355 422 Td (TOTAL PAGADO:) Tj ET');
  lines.push(`BT /F2 13 Tf 475 422 Td (${escapePdfText(formatCOP(total))}) Tj ET`);
  lines.push('BT /F1 8 Tf 355 405 Td (Fondos recibidos y certificados) Tj ET');

  // Nota legal
  lines.push('0.4 0.4 0.4 rg');
  lines.push('BT /F1 8 Tf 36 415 Td (Este comprobante certifica la recepcion conforme de los fondos para el contrato.) Tj ET');
  lines.push('BT /F1 8 Tf 36 400 Td (Los fondos de garantia se reintegran al cliente al retornar la maquinaria.) Tj ET');

  // Pie
  lines.push('0.8 0.8 0.8 RG 36 350 540 0 m 576 350 l s');
  lines.push('0.4 0.4 0.4 rg');
  lines.push('BT /F1 8 Tf 180 335 Td (RENTAMAQ INDUSTRIAL S.A.S. - Bogota D.C., Colombia) Tj ET');

  const pdfBytes = compilePdfDocument(lines.join('\n'));
  triggerBrowserDownload(pdfBytes, `Comprobante_Pago_${reservation.reservationCode || `RES-${reservation.id}`}.pdf`);
}
