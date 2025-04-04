import { OrderRepository } from '../repositories/order.repository';
import { describe, it, expect, vi, beforeEach } from 'vitest';

global.fetch = vi.fn();

describe('OrderRepository', () => {
  let orderRepository: OrderRepository;

  beforeEach(() => {
    vi.clearAllMocks(); 
    orderRepository = new OrderRepository();
  });

  it('should return created order when API request is successful', async () => {
    const mockOrder = { id: '123', totalPrice: 200 };
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockOrder),
    });

    const orderData = { totalPrice: 200 };
    const createdOrder = await orderRepository.createOrder(orderData);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://67eb7353aa794fb3222a4c0e.mockapi.io/order',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(createdOrder).toEqual(mockOrder);
  });

  it('should throw error when API response is not OK', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({ ok: false });

    await expect(orderRepository.createOrder({ totalPrice: 200 }))
      .rejects.toThrow('Failed to create order');

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});