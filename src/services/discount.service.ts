export class DiscountService {
  private readonly API_URL =
    "https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons";

  async applyDiscount(couponId: string, totalPrice: number): Promise<number> {
    const response = await fetch(`${this.API_URL}/${couponId}`);
    if (!response.ok) {
      throw new Error("Invalid coupon");
    }

    const coupon = await response.json();
    const discountedPrice = totalPrice - coupon.discount;

    return discountedPrice > 0 ? discountedPrice : 0;
  }
}
