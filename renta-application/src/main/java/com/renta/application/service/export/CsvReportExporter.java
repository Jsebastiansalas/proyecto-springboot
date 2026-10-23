package com.renta.application.service.export;

import com.renta.domain.model.entity.Reservation;
import com.renta.domain.model.entity.Tool;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * ============================================================================
 * EXPORTADOR DE REPORTES EN FORMATO CSV / EXCEL
 * ============================================================================
 * Genera archivos CSV compatibles con Microsoft Excel usando delimitador ';'
 * y anteponiendo el byte order mark (BOM) UTF-8 (\uFEFF) para preservar acentos.
 */
public class CsvReportExporter {

    private static final String CSV_DELIMITER = ";";
    private static final String NEW_LINE = "\r\n";
    private static final String UTF8_BOM = "\uFEFF";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static byte[] exportReservationsToCsv(List<Reservation> reservations) {
        StringBuilder sb = new StringBuilder();
        sb.append(UTF8_BOM); // Garantiza que Excel lea tildes y caracteres especiales

        // Encabezados
        sb.append("ID").append(CSV_DELIMITER)
                .append("CÓDIGO").append(CSV_DELIMITER)
                .append("CLIENTE_ID").append(CSV_DELIMITER)
                .append("HERRAMIENTA_ID").append(CSV_DELIMITER)
                .append("FECHA_INICIO").append(CSV_DELIMITER)
                .append("FECHA_FIN").append(CSV_DELIMITER)
                .append("DÍAS_TOTALES").append(CSV_DELIMITER)
                .append("SUBTOTAL_COP").append(CSV_DELIMITER)
                .append("FIANZA_COP").append(CSV_DELIMITER)
                .append("TOTAL_COP").append(CSV_DELIMITER)
                .append("ESTADO").append(CSV_DELIMITER)
                .append("NOTAS").append(NEW_LINE);

        // Filas de datos
        for (Reservation r : reservations) {
            sb.append(r.getId()).append(CSV_DELIMITER)
                    .append(escape(r.getReservationCode())).append(CSV_DELIMITER)
                    .append(r.getClientId()).append(CSV_DELIMITER)
                    .append(r.getToolId()).append(CSV_DELIMITER)
                    .append(r.getDateRange() != null ? r.getDateRange().startDate().format(DATE_FORMATTER) : "").append(CSV_DELIMITER)
                    .append(r.getDateRange() != null ? r.getDateRange().endDate().format(DATE_FORMATTER) : "").append(CSV_DELIMITER)
                    .append(r.getTotalDays()).append(CSV_DELIMITER)
                    .append(r.getSubtotal() != null ? r.getSubtotal().amount().toPlainString() : "0").append(CSV_DELIMITER)
                    .append(r.getDepositTotal() != null ? r.getDepositTotal().amount().toPlainString() : "0").append(CSV_DELIMITER)
                    .append(r.getTotalAmount() != null ? r.getTotalAmount().amount().toPlainString() : "0").append(CSV_DELIMITER)
                    .append(r.getStatus() != null ? r.getStatus().name() : "").append(CSV_DELIMITER)
                    .append(escape(r.getNotes())).append(NEW_LINE);
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    public static byte[] exportToolsToCsv(List<Tool> tools) {
        StringBuilder sb = new StringBuilder();
        sb.append(UTF8_BOM);

        sb.append("ID").append(CSV_DELIMITER)
                .append("SKU").append(CSV_DELIMITER)
                .append("NOMBRE").append(CSV_DELIMITER)
                .append("MARCA").append(CSV_DELIMITER)
                .append("MODELO").append(CSV_DELIMITER)
                .append("TARIFA_DIARIA_COP").append(CSV_DELIMITER)
                .append("DEPÓSITO_COP").append(CSV_DELIMITER)
                .append("ESTADO").append(NEW_LINE);

        for (Tool t : tools) {
            sb.append(t.getId()).append(CSV_DELIMITER)
                    .append(escape(t.getCodeSku())).append(CSV_DELIMITER)
                    .append(escape(t.getName())).append(CSV_DELIMITER)
                    .append(escape(t.getBrand())).append(CSV_DELIMITER)
                    .append(escape(t.getModel())).append(CSV_DELIMITER)
                    .append(t.getBaseDailyPrice() != null ? t.getBaseDailyPrice().amount().toPlainString() : "0").append(CSV_DELIMITER)
                    .append(t.getDepositAmount() != null ? t.getDepositAmount().amount().toPlainString() : "0").append(CSV_DELIMITER)
                    .append(t.getStatus() != null ? t.getStatus().name() : "").append(NEW_LINE);
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private static String escape(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"").replace("\n", " ").replace("\r", " ") + "\"";
    }
}
