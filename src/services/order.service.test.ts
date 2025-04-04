import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { DiscountService } from './discount.service';
import { OrderRepository } from '../repositories/order.repository';
import { Order } from '../models/order.model';

describe('OrderService', () => {
  let paymentService: PaymentService;
  let discountService: DiscountService;
  let orderRepository: OrderRepository;
  let orderService: OrderService;

  const validOrderItems = [
    { id: '1', productId: 'prod-1', name: 'Product 1', price: 100, quantity: 2 },
    { id: '2', productId: 'prod-2', name: 'Product 2', price: 50, quantity: 1 }
  ];  

  const validOrder: Partial<Order> = {
    items: validOrderItems
  };

  beforeEach(() => {
    paymentService = {
      buildPaymentMethod: vi.fn().mockReturnValue('credit_card'),
      payViaLink: vi.fn()
    } as unknown as PaymentService;

    discountService = {
      applyDiscount: vi.fn().mockImplementation((couponId, price) => Promise.resolve(price * 0.9)) 
    } as unknown as DiscountService;

    orderRepository = {
      createOrder: vi.fn().mockImplementation((order) => Promise.resolve({ ...order, id: 'order123' }))
    } as unknown as OrderRepository;

    orderService = new OrderService(paymentService, discountService, orderRepository);
  });

  it('should process a valid order successfully', async () => {
    const expectedTotal = 250;

    await orderService.process(validOrder);

    expect(paymentService.buildPaymentMethod).toHaveBeenCalledWith(expectedTotal);
    expect(orderRepository.createOrder).toHaveBeenCalledWith({
      ...validOrder,
      totalPrice: expectedTotal,
      paymentMethod: 'credit_card'
    });
    expect(paymentService.payViaLink).toHaveBeenCalled();
  });

  it('should throw error when order has no items', async () => {
    const orderWithNoItems: Partial<Order> = {
      items: []
    };

    await expect(orderService.process(orderWithNoItems))
      .rejects.toThrow('Order items are required');
  });

  it('should throw error when order items are invalid (price <= 0)', async () => {
    const orderWithInvalidPrice: Partial<Order> = {
      items: [
        { id: '1', productId: 'prod-1', price: 0, quantity: 2 },
        { id: '2', productId: 'prod-2', price: 50, quantity: 1 }
      ]
    };

    await expect(orderService.process(orderWithInvalidPrice))
      .rejects.toThrow('Order items are invalid');
  });

  it('should throw error when order items are invalid (quantity <= 0)', async () => {
    const orderWithInvalidQuantity: Partial<Order> = {
      items: [
        { id: '1', productId: 'prod-1', price: 100, quantity: 0 },
        { id: '2', productId: 'prod-2', price: 50, quantity: 1 }
      ]
    };

    await expect(orderService.process(orderWithInvalidQuantity))
      .rejects.toThrow('Order items are invalid');
  });

  it('should throw error when total price is less than or equal to 0', async () => {
    const orderWithNegativePrice: Partial<Order> = {
      items: [
        { id: '1',  productId: 'prod-1', price: -100, quantity: 2 }, 
      ]
    };

    vi.spyOn(orderWithNegativePrice.items!, 'some').mockReturnValue(false);

    await expect(orderService.process(orderWithNegativePrice))
      .rejects.toThrow('Total price must be greater than 0');
  });

  it('should call payViaLink after order is created', async () => {
    orderRepository.createOrder = vi.fn().mockResolvedValue({ id: 'order123' } as Order);
  
    await orderService.process(validOrder);
  
    expect(paymentService.payViaLink).toHaveBeenCalledWith(expect.objectContaining({ id: 'order123' }));
  });

  it('should apply discount when coupon is provided', async () => {
    discountService.applyDiscount = vi.fn().mockResolvedValue(225);
  
    await orderService.process({ ...validOrder, couponId: 'DISCOUNT10' });
  
    expect(discountService.applyDiscount).toHaveBeenCalledWith('DISCOUNT10', 250);
    expect(orderRepository.createOrder).toHaveBeenCalledWith(expect.objectContaining({ totalPrice: 225 }));
  });
  

  it('should handle errors from discount service', async () => {
    const orderWithCoupon: Partial<Order> = {
      ...validOrder,
      couponId: 'INVALID_COUPON'
    };

    discountService.applyDiscount = vi.fn().mockRejectedValue(new Error('Invalid coupon'));

    await expect(orderService.process(orderWithCoupon))
      .rejects.toThrow('Invalid coupon');
  });

  it('should handle errors from order repository', async () => {
    orderRepository.createOrder = vi.fn().mockRejectedValue(new Error('Database error'));

    await expect(orderService.process(validOrder))
      .rejects.toThrow('Database error');
  });

  it('should correctly calculate total for multiple items', async () => {
    const orderWithMultipleItems: Partial<Order> = {
      items: [
        { id: '1', productId: 'prod-1', price: 100, quantity: 2 },  
        { id: '2', productId: 'prod-2', price: 50, quantity: 3 },   
        { id: '3', productId: 'prod-3', price: 75, quantity: 1 }    
      ]
    };

    const expectedTotal = 425;

    await orderService.process(orderWithMultipleItems);

    expect(paymentService.buildPaymentMethod).toHaveBeenCalledWith(expectedTotal);
    expect(orderRepository.createOrder).toHaveBeenCalledWith({
      ...orderWithMultipleItems,
      totalPrice: expectedTotal,
      paymentMethod: 'credit_card'
    });
  });
});