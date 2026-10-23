package com.renta.infrastructure.adapter.in.rest;

import com.renta.application.dto.coupon.ApplyCouponRequest;
import com.renta.application.dto.coupon.CouponValidationResponse;
import com.renta.application.service.CouponApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/coupons")
@Tag(name = "9. Cupones de Descuento", description = "Validación y aplicación de cupones promocionales sobre cotizaciones de alquiler")
public class CouponController {

    private final CouponApplicationService couponService;

    public CouponController(CouponApplicationService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    @Operation(summary = "Validar y simular descuento de cupón", description = "Verifica si un código de cupón es válido para un alquiler y devuelve el subtotal descontado con IVA (19%) recalculado.")
    public ResponseEntity<CouponValidationResponse> validateAndApply(@Valid @RequestBody ApplyCouponRequest request) {
        return ResponseEntity.ok(couponService.applyCouponToQuote(request));
    }

    @GetMapping("/quick-check")
    @Operation(summary = "Verificación rápida por query param", description = "Comprueba rápidamente si un código existe y aplica para un monto estimado.")
    public ResponseEntity<CouponValidationResponse> quickCheck(
            @RequestParam String code,
            @RequestParam(defaultValue = "1") Integer days,
            @RequestParam BigDecimal subtotal) {
        ApplyCouponRequest req = new ApplyCouponRequest(code, LocalDate.now(), days, subtotal);
        return ResponseEntity.ok(couponService.applyCouponToQuote(req));
    }
}
