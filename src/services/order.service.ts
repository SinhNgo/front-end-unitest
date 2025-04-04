import { Order } from '../models/order.model';
import { PaymentService } from './payment.service';
import { DiscountService } from './discount.service';
import { OrderRepository } from '../repositories/order.repository';

export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly discountService: DiscountService,
    private readonly orderRepository: OrderRepository
  ) {}

  async process(order: Partial<Order>) {
    if (!order.items?.length) throw new Error('Order items are required');

    if (order.items.some(item => item.price <= 0 || item.quantity <= 0)) {
      throw new Error('Order items are invalid');
    }

    let totalPrice = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (totalPrice <= 0) {
      throw new Error('Total price must be greater than 0');
    }

    if (order.couponId) {
      totalPrice = await this.discountService.applyDiscount(order.couponId, totalPrice);
    }

    const orderPayload = { ...order, totalPrice, paymentMethod: this.paymentService.buildPaymentMethod(totalPrice) };
    const createdOrder = await this.orderRepository.createOrder(orderPayload);

    this.paymentService.payViaLink(createdOrder);
  }
}
