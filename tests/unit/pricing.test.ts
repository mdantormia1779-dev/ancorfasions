import { describe, it, expect } from "vitest";

// This is a boilerplate for business logic testing.
// In a real scenario, this would import the pricing utility from the application code.

const calculateDiscount = (price: number, discountPercentage: number) => {
  if (price < 0 || discountPercentage < 0 || discountPercentage > 100) {
    throw new Error("Invalid input");
  }
  return price - price * (discountPercentage / 100);
};

describe("Pricing Engine", () => {
  it("should correctly calculate a 20% discount", () => {
    const originalPrice = 100;
    const discount = 20;
    const finalPrice = calculateDiscount(originalPrice, discount);

    expect(finalPrice).toBe(80);
  });

  it("should throw an error for negative prices", () => {
    expect(() => calculateDiscount(-50, 10)).toThrow("Invalid input");
  });

  it("should handle 0% discount", () => {
    expect(calculateDiscount(150, 0)).toBe(150);
  });

  it("should handle 100% discount", () => {
    expect(calculateDiscount(200, 100)).toBe(0);
  });
});
