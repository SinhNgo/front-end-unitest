import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiscountService } from '../services/discount.service'; 

describe('DiscountService', () => {
  let discountService: DiscountService;
  let mockFetch: vi.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    discountService = new DiscountService();
    mockFetch = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('should call the correct API endpoint with coupon ID', async () => {
    const couponId = 'valid-coupon';
    const totalPrice = 500;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ discount: 100 }),
    } as Response);

    await discountService.applyDiscount(couponId, totalPrice);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons/valid-coupon'
    );
  });

  it('should return discounted price when coupon is valid', async () => {
    const couponId = 'valid-coupon';
    const totalPrice = 500;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ discount: 100 }),
    } as Response);

    const discountedPrice = await discountService.applyDiscount(couponId, totalPrice);

    expect(discountedPrice).toBe(400); 
  });

  it('should throw an error when coupon is invalid', async () => {
    const couponId = 'invalid-coupon';
    const totalPrice = 500;

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(discountService.applyDiscount(couponId, totalPrice)).rejects.toThrowError('Invalid coupon');
  });

  it('should return 0 if the discounted price is less than 0', async () => {
    const couponId = 'valid-coupon';
    const totalPrice = 50;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ discount: 100 }),
    } as Response);

    const discountedPrice = await discountService.applyDiscount(couponId, totalPrice);

    expect(discountedPrice).toBe(0);
  });

  it('should return the original price when discount is 0', async () => {
    const couponId = 'zero-discount';
    const totalPrice = 500;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ discount: 0 }),
    } as Response);

    const discountedPrice = await discountService.applyDiscount(couponId, totalPrice);

    expect(discountedPrice).toBe(500);
  });

  it('should handle network errors properly', async () => {
    const couponId = 'valid-coupon';
    const totalPrice = 500;

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(discountService.applyDiscount(couponId, totalPrice)).rejects.toThrow();
  });
  
  it('should handle the case when coupon is exactly equal to the price', async () => {
    const couponId = 'exact-discount';
    const totalPrice = 100;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ discount: 100 }),
    } as Response);

    const discountedPrice = await discountService.applyDiscount(couponId, totalPrice);

    expect(discountedPrice).toBe(0);
  });
});