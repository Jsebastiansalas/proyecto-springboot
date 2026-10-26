# 📋 Funcionalidad 33: Restricción Territorial de Operación y Validación de Geocercas (Geofencing)

> **Estado:** ✅ **INTEGRADO Y ACTIVO EN EL PROYECTO**  
> **Patrón de Diseño:** Spatial Geofencing & Operational Domain Boundary  
> **Compilación y Pruebas:** `mvn test` exitoso (0 errores, 0 fallos).  
> **Módulos Involucrados:** `renta-domain` · `renta-application` · `frontend/React`

---

## 🎯 ¿Qué "Cáscara" o Pregunta Trampa del Profesor Resuelve?
En proyectos de ingeniería civil y alquiler de maquinaria pesada:
> *"¿Qué pasa si un cliente alquila un rodillo compactador con póliza de seguro y tarifa regional para el área metropolitana de Medellín, pero se lo lleva a una trocha no pavimentada en el Chocó sin autorización?"*
> *"¿La póliza de seguro cubre el siniestro? ¿Cómo valida el sistema que la dirección de la obra está dentro del perímetro operativo habilitado para esa categoría de máquina?"*

### La Solución Arquitectónica:
Cada equipo tiene asociada una **Zona de Operación Autorizada** (Radio en kilómetros desde el patio central o polígono municipal).  
Al cotizar o registrar la dirección de destino:
1. El backend calcula la distancia ortodrómica (Fórmula del Semiverseno / Haversine) o valida el municipio habilitado.
2. Si la obra excede el perímetro urbano (ej. $> 45\text{ km}$ del patio base), se exige una sobretasa de seguro intermunicipal y flete especial de cama-baja.
3. Si la zona está catalogada como fuera de cobertura técnica de soporte, el sistema bloquea preventivamente la formalización.

---

## 🧮 Algoritmo Haversine de Distancia en el Dominio

$$\Delta\sigma = 2 \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right) } \right)$$
$$d = R \cdot \Delta\sigma \quad (\text{donde } R = 6.371\text{ km})$$

```java
package com.rentamaq.domain.model;

public record GeoCoordinates(double latitude, double longitude) {
    private static final double EARTH_RADIUS_KM = 6371.0;

    public double distanceTo(GeoCoordinates other) {
        double dLat = Math.toRadians(other.latitude - this.latitude);
        double dLon = Math.toRadians(other.longitude - this.longitude);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(this.latitude)) * Math.cos(Math.toRadians(other.latitude))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
```

---

## 🏗️ Implementación en el Servicio de Cotización

```java
@Service
public class GeofenceValidationService {

    private static final GeoCoordinates PATIO_CENTRAL = new GeoCoordinates(6.2442, -75.5812); // Medellín Patio Principal
    private static final double MAX_STANDARD_RADIUS_KM = 50.0;

    public GeofenceAssessment assessJobSite(GeoCoordinates jobSiteLocation) {
        double distanceKm = PATIO_CENTRAL.distanceTo(jobSiteLocation);

        if (distanceKm <= MAX_STANDARD_RADIUS_KM) {
            return new GeofenceAssessment(true, 0.0, "Dentro del perímetro estándar metropolitano");
        } else if (distanceKm <= 150.0) {
            double intermunicipalSurcharge = 120_000.0; // Sobretasa de seguro y logística foránea
            return new GeofenceAssessment(true, intermunicipalSurcharge, "Zona Intermunicipal: Requiere póliza foránea");
        } else {
            return new GeofenceAssessment(false, 0.0, "Obra fuera de cobertura operativa de soporte técnico");
        }
    }
}
```

---

## 🎓 Pregunta de Examen y Argumento de Defensa

* **Pregunta del Profesor:** *"¿Por qué no usar simplemente una librería externa como Google Maps API en el cliente para esto?"*
* **Respuesta de 10:** *"El frontend solo sirve para facilitar la captura de coordenadas y UX. La regla de validación de geocerca y la tasación de sobrecargos obligatorios deben ejecutarse y validarse de forma soberana en el servidor. Un cliente podría alterar la petición HTTP o inyectar una dirección falsa para evadir el recargo foráneo."*
