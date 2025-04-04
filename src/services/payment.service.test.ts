import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PaymentService } from "../services/payment.service";
import { PaymentMethod } from "../models/payment.model";
import { Order } from "../models/order.model";

describe("PaymentService", () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
  });

  describe("buildPaymentMethod", () => {
    it("should return AUPAY when totalPrice is equal to or less than 300000", () => {
      expect(paymentService.buildPaymentMethod(300000)).toBe(PaymentMethod.AUPAY);
      expect(paymentService.buildPaymentMethod(200000)).toBe(PaymentMethod.AUPAY);
      expect(paymentService.buildPaymentMethod(0)).toBe(PaymentMethod.AUPAY);
    });

    it("should return PAYPAY when totalPrice is between 300001 and 500000", () => {
      expect(paymentService.buildPaymentMethod(300001)).toBe(PaymentMethod.PAYPAY);
      expect(paymentService.buildPaymentMethod(400000)).toBe(PaymentMethod.PAYPAY);
      expect(paymentService.buildPaymentMethod(500000)).toBe(PaymentMethod.PAYPAY);
    });

    it("should return CREDIT when totalPrice is greater than 500000", () => {
      expect(paymentService.buildPaymentMethod(500001)).toBe(PaymentMethod.CREDIT);
      expect(paymentService.buildPaymentMethod(1000000)).toBe(PaymentMethod.CREDIT);
    });
  });

  describe("payViaLink", () => {
    let openSpy: any;

    beforeEach(() => {
      openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    });

    afterEach(() => {
      openSpy.mockRestore();
    });

    it("should open a new window with the correct URL", async () => {
      const order: Order = { 
        id: "12345",
        items: [],
        totalPrice: 50000,
        paymentMethod: PaymentMethod.AUPAY
      } as Order;

      await paymentService.payViaLink(order);

      expect(openSpy).toHaveBeenCalledWith(
        "https://payment.example.com/pay?orderId=12345",
        "_blank"
      );
    });

    it("should handle order IDs correctly in the URL", async () => {
      const order: Order = { 
        id: "ABC789",
        items: [],
        totalPrice: 50000,
        paymentMethod: PaymentMethod.AUPAY
      } as Order;

      await paymentService.payViaLink(order);

      expect(openSpy).toHaveBeenCalledWith(
        "https://payment.example.com/pay?orderId=ABC789",
        "_blank"
      );
    });
  });
});