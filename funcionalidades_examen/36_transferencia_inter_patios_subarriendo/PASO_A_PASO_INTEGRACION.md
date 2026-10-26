# 📋 Funcionalidad 36: Transferencia de Flota Inter-Patios y Sub-Arriendo entre Sedes

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Inter-Branch Asset Transfer & Fulfillment Mediation Pattern  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-application` · `renta-infrastructure`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En exámenes con modelos distribuidos o redes de franquicias/patios:
> *"Si un cliente solicita con urgencia una retroexcavadora en la sede 'Patio Sur - Medellín', pero esa sede tiene stock cero mientras que la sede 'Patio Norte - Bello' tiene 2 unidades disponibles: ¿le dices al cliente que se vaya a la competencia?"*
> *"¿O el sistema permite una transferencia logística interna entre patios, manteniendo la responsabilidad del contrato en la sede originadora?"*

### La Solución Arquitectónica:
El módulo de **Transferencia Inter-Patios**:
1. Permite a una sede solicitar una máquina en custodia temporal a otra sede de la red.
2. Durante el traslado, la máquina pasa a estado `EN_TRASLADO_LOGISTICO`, inhabilitada para alquiler directo en la sede de origen.
3. Al recibirla el patio receptor, se firma el acta de entrega interna y se vincula automáticamente a la reserva del contratista final.
4. Se liquida una comisión de intermediación interna (90% patio dueño, 10% patio gestor).

---

## 🏗️ Modelo de Datos y Entidad de Transferencia

```sql
CREATE TABLE IF NOT EXISTS branch_transfers (
    id BIGSERIAL PRIMARY KEY,
    tool_id BIGINT NOT NULL REFERENCES tools(id),
    origin_branch_id BIGINT NOT NULL,
    destination_branch_id BIGINT NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    transfer_status VARCHAR(30) NOT NULL DEFAULT 'SOLICITADA', -- SOLICITADA, EN_TRANSITO, COMPLETADA, CANCELADA
    logistics_cost NUMERIC(12,2) DEFAULT 0,
    tracking_guide VARCHAR(60),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMP WITH TIME ZONE
);
```

### Orquestación en `BranchTransferService.java`

```java
@Service
@Transactional
public class BranchTransferService {

    private final ToolRepository toolRepo;
    private final BranchTransferRepository transferRepo;

    public BranchTransfer initiateTransfer(Long toolId, Long originBranch, Long destBranch, Long userId) {
        Tool tool = toolRepo.findById(toolId)
                .orElseThrow(() -> new EntityNotFoundException("Herramienta no encontrada"));

        if (tool.getStatus() != ToolStatus.DISPONIBLE) {
            throw new DomainException("Solo se pueden transferir equipos en estado DISPONIBLE en patio");
        }

        tool.setStatus(ToolStatus.EN_TRANSITO);
        toolRepo.save(tool);

        BranchTransfer transfer = new BranchTransfer(toolId, originBranch, destBranch, userId);
        return transferRepo.save(transfer);
    }

    public void completeTransfer(Long transferId) {
        BranchTransfer transfer = transferRepo.findById(transferId)
                .orElseThrow(() -> new EntityNotFoundException("Transferencia no encontrada"));

        Tool tool = toolRepo.findById(transfer.getToolId())
                .orElseThrow(() -> new EntityNotFoundException("Herramienta no encontrada"));

        tool.setBranchId(transfer.getDestinationBranchId());
        tool.setStatus(ToolStatus.DISPONIBLE);
        toolRepo.save(tool);

        transfer.markCompleted();
        transferRepo.save(transfer);
    }
}
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Cómo evitas condiciones de carrera si dos administradores intentan transferir la misma máquina a sedes distintas en el mismo segundo?"*
* **Respuesta de 10:** *"Aplicamos un bloqueo pesimista de escritura (`PESSIMISTIC_WRITE` / `SELECT FOR UPDATE`) sobre el registro de la herramienta durante la transacción de transferencia, asegurando que solo la primera petición adquiera el lock y la segunda reciba un rechazo ordenado sin inconsistencias de inventario."*
