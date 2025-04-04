## Class PaymentService
  1. should return AUPAY when totalPrice is equal to or less than 300000
  2. should return PAYPAY when totalPrice is between 300001 and 500000
  3. should return CREDIT when totalPrice is greater than 500000
  4. should open a new window with the correct URL
  5. should handle order IDs correctly in the URL

## Class OrderService
  1. should process a valid order successfully
  2. should throw error when order has no items
  3. should throw error when order items are invalid (price <= 0)
  4. should throw error when order items are invalid (quantity <= 0)
  5. should throw error when total price is less than or equal to 0
  6. should call payViaLink after order is created
  7. should apply discount when coupon is provided
  8. should handle errors from discount service
  9. should handle errors from order repository
  10. should correctly calculate total for multiple items

## Class DiscountService
  1. should call the correct API endpoint with coupon ID
  2. should return discounted price when coupon is valid
  3. should throw an error when coupon is invalid
  4. should return 0 if the discounted price is less than 0
  5. should return the original price when discount is 0
  6. should handle network errors properly
  7. should handle the case when coupon is exactly equal to the price

## Class OrderRepository
  1. should return created order when API request is successful
  2. should throw error when API response is not OK