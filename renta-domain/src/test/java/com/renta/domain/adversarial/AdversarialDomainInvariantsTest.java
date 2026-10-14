package com.renta.domain.adversarial;

import com.renta.domain.exception.BusinessRuleViolationException;
import com.renta.domain.exception.InvalidDateRangeException;
import com.renta.domain.model.entity.Tool;
import com.renta.domain.model.enums.ToolStatus;
import com.renta.domain.model.vo.DateRange;
import com.renta.domain.model.vo.Money;
import com.renta.domain.model.vo.RentalPriceCalculation;
import com.renta.domain.service.RentalPricingCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Adversarial & Empirical Invariant Tests - Phase 2 (Challenger 1)")
class AdversarialDomainInvariantsTest {

    private RentalPricingCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new RentalPricingCalculator();
    }

    // =========================================================================
    // 1. DATERANGE INVARIANT & ADVERSARIAL TESTS
    // =========================================================================
    @Nested
    @DisplayName("1. DateRange Invariants & Edge Cases")
    class DateRangeAdversarialTests {

        @Test
        @DisplayName("DateRange: start after end must throw InvalidDateRangeException")
        void shouldThrowWhenStartDateIsAfterEndDate() {
            LocalDate start = LocalDate.of(2026, 6, 15);
            LocalDate end = LocalDate.of(2026, 6, 14);

            InvalidDateRangeException ex = assertThrows(
                    InvalidDateRangeException.class,
                    () -> new DateRange(start, end)
            );
            assertNotNull(ex.getMessage());
            assertTrue(ex.getMessage().contains("no puede ser anterior"));
        }

        @Test
        @DisplayName("DateRange: start after end by many months/years must throw InvalidDateRangeException")
        void shouldThrowWhenStartIsYearsAfterEnd() {
            LocalDate start = LocalDate.of(2027, 1, 1);
            LocalDate end = LocalDate.of(2025, 1, 1);

            assertThrows(InvalidDateRangeException.class, () -> DateRange.of(start, end));
        }

        @Test
        @DisplayName("DateRange.fromDays: non-positive days must throw InvalidDateRangeException")
        void shouldThrowWhenFromDaysIsZeroOrNegative() {
            LocalDate start = LocalDate.of(2026, 5, 1);

            assertThrows(InvalidDateRangeException.class, () -> DateRange.fromDays(start, 0));
            assertThrows(InvalidDateRangeException.class, () -> DateRange.fromDays(start, -5));
        }

        @Test
        @DisplayName("DateRange: null arguments must throw NullPointerException")
        void shouldThrowWhenDatesAreNull() {
            LocalDate now = LocalDate.now();

            assertThrows(NullPointerException.class, () -> new DateRange(null, now));
            assertThrows(NullPointerException.class, () -> new DateRange(now, null));
            assertThrows(NullPointerException.class, () -> DateRange.fromDays(null, 3));
        }

        @Test
        @DisplayName("DateRange: single day range (start == end) must be valid and duration == 1")
        void shouldBeValidForSingleDayRange() {
            LocalDate day = LocalDate.of(2026, 8, 20);
            DateRange singleDay = DateRange.of(day, day);

            assertEquals(1, singleDay.durationInDays());
            assertEquals(1, singleDay.totalDays());
            assertTrue(singleDay.contains(day));
            assertFalse(singleDay.contains(day.minusDays(1)));
            assertFalse(singleDay.contains(day.plusDays(1)));
        }

        @Test
        @DisplayName("DateRange: single day range created via fromDays(start, 1) equals of(day, day)")
        void shouldCreateSingleDayFromDays() {
            LocalDate day = LocalDate.of(2026, 8, 20);
            DateRange range = DateRange.fromDays(day, 1);

            assertEquals(day, range.startDate());
            assertEquals(day, range.endDate());
            assertEquals(1, range.durationInDays());
        }

        @Test
        @DisplayName("DateRange Overlap: ranges sharing only boundary days must overlap (closed interval)")
        void shouldOverlapWhenSharingOnlyBoundaryDays() {
            DateRange r1 = DateRange.of(LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 5));
            DateRange r2 = DateRange.of(LocalDate.of(2026, 4, 5), LocalDate.of(2026, 4, 10));

            assertTrue(r1.overlapsWith(r2), "Intervals sharing boundary day 2026-04-05 must overlap");
            assertTrue(r2.overlapsWith(r1), "Overlap must be commutative");
        }

        @Test
        @DisplayName("DateRange Overlap: single day range touching boundary of multi-day range must overlap")
        void shouldOverlapSingleDayTouchingBoundary() {
            DateRange multiDay = DateRange.of(LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 5));
            DateRange singleDayStart = DateRange.of(LocalDate.of(2026, 4, 1), LocalDate.of(2026, 4, 1));
            DateRange singleDayEnd = DateRange.of(LocalDate.of(2026, 4, 5), LocalDate.of(2026, 4, 5));

            assertTrue(multiDay.overlapsWith(singleDayStart));
            assertTrue(singleDayStart.overlapsWith(multiDay));
            assertTrue(multiDay.overlapsWith(singleDayEnd));
            assertTrue(singleDayEnd.overlapsWith(multiDay));
        }

        @Test
        @DisplayName("DateRange Overlap: range completely contained inside another must overlap")
        void shouldOverlapWhenCompletelyContained() {
            DateRange outer = DateRange.of(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31));
            DateRange inner = DateRange.of(LocalDate.of(2026, 1, 10), LocalDate.of(2026, 1, 20));

            assertTrue(outer.overlapsWith(inner));
            assertTrue(inner.overlapsWith(outer));
        }

        @Test
        @DisplayName("DateRange Overlap: identical ranges must overlap")
        void shouldOverlapIdenticalRanges() {
            DateRange r1 = DateRange.of(LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 10));
            DateRange r2 = DateRange.of(LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 10));

            assertTrue(r1.overlapsWith(r2));
        }

        @Test
        @DisplayName("DateRange Overlap: disjoint contiguous ranges (e.g. 1-5 and 6-10) must NOT overlap")
        void shouldNotOverlapDisjointContiguousRanges() {
            DateRange r1 = DateRange.of(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5));
            DateRange r2 = DateRange.of(LocalDate.of(2026, 1, 6), LocalDate.of(2026, 1, 10));

            assertFalse(r1.overlapsWith(r2), "Contiguous ranges without common days must not overlap");
            assertFalse(r2.overlapsWith(r1), "Commutative check must also be false");
        }

        @Test
        @DisplayName("DateRange Overlap: contiguous ranges across month boundary must NOT overlap")
        void shouldNotOverlapAcrossMonthBoundary() {
            DateRange janEnd = DateRange.of(LocalDate.of(2026, 1, 25), LocalDate.of(2026, 1, 31));
            DateRange febStart = DateRange.of(LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 5));

            assertFalse(janEnd.overlapsWith(febStart));
            assertFalse(febStart.overlapsWith(janEnd));
        }

        @Test
        @DisplayName("DateRange Overlap: disjoint ranges with gap must NOT overlap")
        void shouldNotOverlapWithGap() {
            DateRange r1 = DateRange.of(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5));
            DateRange r2 = DateRange.of(LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 15));

            assertFalse(r1.overlapsWith(r2));
            assertFalse(r2.overlapsWith(r1));
        }

        @Test
        @DisplayName("DateRange Overlap: overlap with null must return false safely")
        void shouldReturnFalseForNullOverlap() {
            DateRange r = DateRange.of(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 5));
            assertFalse(r.overlapsWith(null));
        }

        @Test
        @DisplayName("DateRange Duration: accurate across leap years and month transitions")
        void shouldAccuratelyCalculateDurationAcrossLeapYear() {
            // 2024 is leap year: Feb 28, Feb 29, Mar 1 = 3 days
            DateRange leapRange = DateRange.of(LocalDate.of(2024, 2, 28), LocalDate.of(2024, 3, 1));
            assertEquals(3, leapRange.durationInDays());

            // 2025 is standard year: Feb 28, Mar 1 = 2 days
            DateRange normalRange = DateRange.of(LocalDate.of(2025, 2, 28), LocalDate.of(2025, 3, 1));
            assertEquals(2, normalRange.durationInDays());
        }
    }

    // =========================================================================
    // 2. MONEY INVARIANT & ARITHMETIC TESTS
    // =========================================================================
    @Nested
    @DisplayName("2. Money Invariants, Precision & Arithmetic")
    class MoneyAdversarialTests {

        @Test
        @DisplayName("Money: zero representation and predicates")
        void shouldHandleZeroCorrectly() {
            Money zero = Money.zero();
            Money zeroExplicit = Money.cop(BigDecimal.ZERO);
            Money zeroString = Money.cop(new BigDecimal("0.000"));

            assertTrue(zero.isZero());
            assertTrue(zeroExplicit.isZero());
            assertTrue(zeroString.isZero());
            assertFalse(zero.isPositive());
            assertFalse(zero.isNegative());
            assertEquals(new BigDecimal("0.00"), zero.amount());
            assertEquals(2, zero.amount().scale());
            assertEquals(zero, zeroExplicit);
            assertEquals(zero, zeroString);
        }

        @Test
        @DisplayName("Money: negative amounts and negative predicates")
        void shouldHandleNegativeAmountsCorrectly() {
            Money negative = Money.cop(new BigDecimal("-45000.50"));

            assertTrue(negative.isNegative());
            assertFalse(negative.isPositive());
            assertFalse(negative.isZero());
            assertEquals(new BigDecimal("-45000.50"), negative.amount());
        }

        @Test
        @DisplayName("Money: subtraction yielding negative amount")
        void shouldAllowSubtractionIntoNegative() {
            Money a = Money.cop(100_000);
            Money b = Money.cop(150_000);

            Money result = a.minus(b);
            assertTrue(result.isNegative());
            assertEquals(new BigDecimal("-50000.00"), result.amount());
        }

        @ParameterizedTest
        @CsvSource({
                "100.124, 100.12",
                "100.125, 100.13",
                "100.126, 100.13",
                "0.004, 0.00",
                "0.005, 0.01",
                "-100.124, -100.12",
                "-100.125, -100.13",
                "-100.126, -100.13"
        })
        @DisplayName("Money: HALF_UP commercial rounding to 2 decimal places")
        void shouldRoundCommercialHalfUp(String input, String expected) {
            Money money = Money.cop(new BigDecimal(input));
            assertEquals(new BigDecimal(expected), money.amount());
            assertEquals(2, money.amount().scale());
        }

        @Test
        @DisplayName("Money: scale normalization ensures equals() works across different input scales")
        void shouldNormalizeScaleForEquality() {
            Money m1 = Money.cop(new BigDecimal("100"));
            Money m2 = Money.cop(new BigDecimal("100.0"));
            Money m3 = Money.cop(new BigDecimal("100.00"));
            Money m4 = Money.cop(new BigDecimal("100.0000"));

            assertEquals(m1, m2);
            assertEquals(m2, m3);
            assertEquals(m3, m4);
            assertEquals(m1.hashCode(), m4.hashCode());
        }

        @Test
        @DisplayName("Money: addition & subtraction algebraic invariants")
        void shouldSatisfyAlgebraicInvariants() {
            Money a = Money.cop(123_456.78);
            Money b = Money.cop(987_654.32);

            // Commutativity: a + b == b + a
            assertEquals(a.plus(b), b.plus(a));

            // Identity: a + 0 == a, a - 0 == a
            assertEquals(a, a.plus(Money.zero()));
            assertEquals(a, a.minus(Money.zero()));

            // Self-subtraction: a - a == 0
            assertTrue(a.minus(a).isZero());

            // Opposite addition: a + (-a) == 0
            assertEquals(Money.zero(), a.plus(a.multiply(-1)));
        }

        @Test
        @DisplayName("Money: multiplication precision and rounding")
        void shouldMultiplyWithHalfUpRounding() {
            Money base = Money.cop(new BigDecimal("10.00"));

            // 10.00 * 0.33333 = 3.3333 -> 3.33
            assertEquals(new BigDecimal("3.33"), base.multiply(new BigDecimal("0.33333")).amount());

            // 10.00 * 0.33335 = 3.3335 -> 3.33 (wait: 10.00 * 0.33335 = 3.33350 -> round to 2 dec is 3.33)
            // Let's test exact boundary: 10.00 * 0.335 = 3.350
            // 10.00 * 0.3355 = 3.3550 -> 3.36
            assertEquals(new BigDecimal("3.36"), base.multiply(new BigDecimal("0.3355")).amount());

            // Zero multiplication
            assertTrue(base.multiply(0).isZero());
            assertTrue(base.multiply(BigDecimal.ZERO).isZero());
        }

        @Test
        @DisplayName("Money: percentage calculation precision")
        void shouldCalculatePercentagesAccurately() {
            Money amount = Money.cop(225_000);
            assertEquals(new BigDecimal("42750.00"), amount.percentage(new BigDecimal("19")).amount());
            assertEquals(new BigDecimal("0.00"), amount.percentage(BigDecimal.ZERO).amount());
            assertEquals(new BigDecimal("225000.00"), amount.percentage(new BigDecimal("100")).amount());

            // Fractional percentage: 1 COP @ 19.5% -> 0.195 -> 0.20
            Money oneCop = Money.cop(1);
            assertEquals(new BigDecimal("0.20"), oneCop.percentage(new BigDecimal("19.5")).amount());
        }

        @Test
        @DisplayName("Money: currency mismatch throws BusinessRuleViolationException")
        void shouldThrowOnCurrencyMismatch() {
            Money cop = Money.of(new BigDecimal("50000"), "COP");
            Money usd = Money.of(new BigDecimal("12"), "USD");

            assertThrows(BusinessRuleViolationException.class, () -> cop.plus(usd));
            assertThrows(BusinessRuleViolationException.class, () -> cop.minus(usd));
            assertThrows(BusinessRuleViolationException.class, () -> cop.compareTo(usd));
        }

        @Test
        @DisplayName("Money: comparisons consistent with Comparable")
        void shouldCompareConsistently() {
            Money small = Money.cop(10_000);
            Money large = Money.cop(20_000);

            assertTrue(large.isGreaterThan(small));
            assertTrue(small.isLessThan(large));
            assertTrue(large.isGreaterThanOrEqualTo(small));
            assertTrue(small.isLessThanOrEqualTo(large));
            assertTrue(large.isGreaterThanOrEqualTo(large));
            assertTrue(large.compareTo(small) > 0);
            assertTrue(small.compareTo(large) < 0);
            assertEquals(0, large.compareTo(Money.cop(20_000)));
        }

        @Test
        @DisplayName("Money: null safety validation")
        void shouldValidateNullInputs() {
            assertThrows(NullPointerException.class, () -> Money.cop(null));
            Money m = Money.cop(100);
            assertThrows(NullPointerException.class, () -> m.plus(null));
            assertThrows(NullPointerException.class, () -> m.minus(null));
            assertThrows(NullPointerException.class, () -> m.multiply((BigDecimal) null));
            assertThrows(NullPointerException.class, () -> m.percentage(null));
        }
    }

    // =========================================================================
    // 3. RENTAL PRICING CALCULATOR ACCEPTANCE CRITERIA & FINANCIAL INVARIANTS
    // =========================================================================
    @Nested
    @DisplayName("3. RentalPricingCalculator Acceptance Criteria & Stress Invariants")
    class RentalPricingCalculatorAdversarialTests {

        private final Money baseDaily45k = Money.cop(45_000);

        @Test
        @DisplayName("AC: 5 days @ 45,000 COP -> subtotal 225,000 COP, IVA 42,750 COP, total 267,750 COP")
        void shouldMatchExactAcceptanceCriteriaForFiveDays() {
            RentalPriceCalculation calc = calculator.calculate(baseDaily45k, 5);

            assertEquals(5, calc.totalDays());
            assertFalse(calc.weeklyDiscountApplied(), "No weekly discount for 5 days");
            assertEquals(new BigDecimal("45000.00"), calc.effectiveDailyPrice().amount());
            assertEquals(new BigDecimal("225000.00"), calc.subtotal().amount());
            assertEquals(new BigDecimal("42750.00"), calc.taxAmount().amount());
            assertEquals(new BigDecimal("267750.00"), calc.totalWithTax().amount());
            assertEquals(new BigDecimal("0.00"), calc.depositAmount().amount());
            assertEquals(new BigDecimal("225000.00"), calc.totalReservationAmount().amount());
        }

        @Test
        @DisplayName("AC: 6 days @ 45,000 COP (no weekly discount, threshold boundary)")
        void shouldCalculateSixDaysWithoutWeeklyDiscount() {
            RentalPriceCalculation calc = calculator.calculate(baseDaily45k, 6);

            assertEquals(6, calc.totalDays());
            assertFalse(calc.weeklyDiscountApplied(), "6 days must NOT trigger weekly discount (threshold is 7)");
            assertEquals(new BigDecimal("45000.00"), calc.effectiveDailyPrice().amount());
            // 6 * 45,000 = 270,000
            assertEquals(new BigDecimal("270000.00"), calc.subtotal().amount());
            // 270,000 * 0.19 = 51,300
            assertEquals(new BigDecimal("51300.00"), calc.taxAmount().amount());
            // 270,000 + 51,300 = 321,300
            assertEquals(new BigDecimal("321300.00"), calc.totalWithTax().amount());
        }

        @Test
        @DisplayName("AC: 7 days @ 45,000 COP -> 85% weekly rate applies (45k*0.85=38,250/day; subtotal 267,750; IVA 50,872.50; total 318,622.50)")
        void shouldMatchExactAcceptanceCriteriaForSevenDays() {
            RentalPriceCalculation calc = calculator.calculate(baseDaily45k, 7);

            assertEquals(7, calc.totalDays());
            assertTrue(calc.weeklyDiscountApplied(), "7 days MUST trigger 85% weekly tier");
            // 45,000 * 0.85 = 38,250
            assertEquals(new BigDecimal("38250.00"), calc.effectiveDailyPrice().amount());
            // 7 * 38,250 = 267,750
            assertEquals(new BigDecimal("267750.00"), calc.subtotal().amount());
            // 267,750 * 0.19 = 50,872.50
            assertEquals(new BigDecimal("50872.50"), calc.taxAmount().amount());
            // 267,750 + 50,872.50 = 318,622.50
            assertEquals(new BigDecimal("318622.50"), calc.totalWithTax().amount());
        }

        @Test
        @DisplayName("AC: 10 days @ 45,000 COP -> 85% weekly rate applies")
        void shouldMatchCalculationForTenDays() {
            RentalPriceCalculation calc = calculator.calculate(baseDaily45k, 10);

            assertEquals(10, calc.totalDays());
            assertTrue(calc.weeklyDiscountApplied());
            assertEquals(new BigDecimal("38250.00"), calc.effectiveDailyPrice().amount());
            // 10 * 38,250 = 382,500
            assertEquals(new BigDecimal("382500.00"), calc.subtotal().amount());
            // 382,500 * 0.19 = 72,675
            assertEquals(new BigDecimal("72675.00"), calc.taxAmount().amount());
            // 382,500 + 72,675 = 455,175
            assertEquals(new BigDecimal("455175.00"), calc.totalWithTax().amount());
        }

        @Test
        @DisplayName("AC: 30 days @ 45,000 COP -> 85% weekly rate applies")
        void shouldMatchCalculationForThirtyDays() {
            RentalPriceCalculation calc = calculator.calculate(baseDaily45k, 30);

            assertEquals(30, calc.totalDays());
            assertTrue(calc.weeklyDiscountApplied());
            assertEquals(new BigDecimal("38250.00"), calc.effectiveDailyPrice().amount());
            // 30 * 38,250 = 1,147,500
            assertEquals(new BigDecimal("1147500.00"), calc.subtotal().amount());
            // 1,147,500 * 0.19 = 218,025
            assertEquals(new BigDecimal("218025.00"), calc.taxAmount().amount());
            // 1,147,500 + 218,025 = 1,365,525
            assertEquals(new BigDecimal("1365525.00"), calc.totalWithTax().amount());
        }

        @Test
        @DisplayName("Stress: 1 single day rental boundary")
        void shouldCalculateOneDayRental() {
            RentalPriceCalculation calc = calculator.calculate(baseDaily45k, 1);

            assertEquals(1, calc.totalDays());
            assertFalse(calc.weeklyDiscountApplied());
            assertEquals(new BigDecimal("45000.00"), calc.subtotal().amount());
            // 45,000 * 0.19 = 8,550
            assertEquals(new BigDecimal("8550.00"), calc.taxAmount().amount());
            assertEquals(new BigDecimal("53550.00"), calc.totalWithTax().amount());
        }

        @Test
        @DisplayName("Stress: 365 days long-term rental financial invariant")
        void shouldCalculateFullYearRental() {
            RentalPriceCalculation calc = calculator.calculate(baseDaily45k, 365);

            assertEquals(365, calc.totalDays());
            assertTrue(calc.weeklyDiscountApplied());
            // 365 * 38,250 = 13,961,250.00
            assertEquals(new BigDecimal("13961250.00"), calc.subtotal().amount());
            // 13,961,250 * 0.19 = 2,652,637.50
            assertEquals(new BigDecimal("2652637.50"), calc.taxAmount().amount());
            // Total = 16,613,887.50
            assertEquals(new BigDecimal("16613887.50"), calc.totalWithTax().amount());
        }

        @Test
        @DisplayName("Stress: Fractional price rounding during weekly discount and tax")
        void shouldHandleFractionalDailyRatesWithHalfUpRounding() {
            // Base price: 33,333.33 COP
            Money fractionalPrice = Money.cop(new BigDecimal("33333.33"));
            RentalPriceCalculation calc = calculator.calculate(fractionalPrice, 7);

            // 33,333.33 * 0.85 = 28,333.3305 -> 28,333.33
            assertEquals(new BigDecimal("28333.33"), calc.effectiveDailyPrice().amount());
            // 7 * 28,333.33 = 198,333.31
            assertEquals(new BigDecimal("198333.31"), calc.subtotal().amount());
            // 198,333.31 * 0.19 = 37,683.3289 -> 37,683.33
            assertEquals(new BigDecimal("37683.33"), calc.taxAmount().amount());
            // Total = 198,333.31 + 37,683.33 = 236,016.64
            assertEquals(new BigDecimal("236016.64"), calc.totalWithTax().amount());
        }

        @Test
        @DisplayName("Calculator with Tool entity and DateRange integration")
        void shouldCalculateViaToolAndDateRange() {
            Tool tool = new Tool(
                    100L,
                    1L,
                    1,
                    "SKU-CHALLENGER-01",
                    "Taladro Percutor",
                    "DeWalt",
                    "DCD796",
                    "Taladro percutor inalámbrico",
                    baseDaily45k,
                    Money.cop(150_000),
                    ToolStatus.DISPONIBLE,
                    "http://image.png",
                    null,
                    null
            );

            DateRange dateRange = DateRange.of(LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 7)); // exactly 7 days

            RentalPriceCalculation result = calculator.calculate(tool, dateRange);

            assertEquals(7, result.totalDays());
            assertTrue(result.weeklyDiscountApplied());
            assertEquals(new BigDecimal("267750.00"), result.subtotal().amount());
            assertEquals(new BigDecimal("50872.50"), result.taxAmount().amount());
            assertEquals(new BigDecimal("318622.50"), result.totalWithTax().amount());
            assertEquals(new BigDecimal("150000.00"), result.depositAmount().amount());
            assertEquals(new BigDecimal("417750.00"), result.totalReservationAmount().amount());
        }

        @ParameterizedTest
        @ValueSource(ints = {0, -1, -100})
        @DisplayName("Validation: Zero or negative days must throw IllegalArgumentException")
        void shouldRejectInvalidDayCounts(int invalidDays) {
            assertThrows(IllegalArgumentException.class, () -> calculator.calculate(baseDaily45k, invalidDays));
        }

        @Test
        @DisplayName("Validation: Null inputs must throw NullPointerException")
        void shouldRejectNullArguments() {
            assertThrows(NullPointerException.class, () -> calculator.calculate((Money) null, 5));
            assertThrows(NullPointerException.class, () -> calculator.calculate((Tool) null, DateRange.fromDays(LocalDate.now(), 5)));
            Tool dummyTool = new Tool(1L, 1L, 1, "SKU", "N", "B", "M", "D", baseDaily45k, Money.zero(), ToolStatus.DISPONIBLE, null, null, null);
            assertThrows(NullPointerException.class, () -> calculator.calculate(dummyTool, null));
        }
    }
}
