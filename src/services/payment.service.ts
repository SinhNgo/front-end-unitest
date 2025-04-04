import { PaymentMethod } from "../models/payment.model";
import { Order } from '../models/order.model';

export class PaymentService {
  buildPaymentMethod(totalPrice: number): PaymentMethod {
    if (totalPrice <= 300000) return PaymentMethod.AUPAY;
    if (totalPrice <= 500000) return PaymentMethod.PAYPAY;
    return PaymentMethod.CREDIT;
  }
  

  async payViaLink(order: Order) {
    window.open(`https://payment.example.com/pay?orderId=${order.id}`, '_blank');
  }
}
