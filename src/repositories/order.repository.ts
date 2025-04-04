import { Order } from "../models/order.model";

export class OrderRepository {
  private readonly API_URL =
    "https://67eb7353aa794fb3222a4c0e.mockapi.io/order";

  async createOrder(order: Partial<Order>): Promise<Order> {
    const response = await fetch(this.API_URL, {
      method: "POST",
      body: JSON.stringify(order),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to create order");
    }

    return await response.json();
  }
}
