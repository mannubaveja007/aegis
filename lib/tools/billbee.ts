// Billbee — MOCKED, no real API call
// Returns deterministic data based on the last digit of orderId

export async function getOrderStatus(
  orderId: string
): Promise<{ state: "returned" | "shipped" | "pending" }> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 200));

  const lastDigit = parseInt(orderId.slice(-1), 10);

  if (Number.isNaN(lastDigit) || lastDigit >= 7) {
    return { state: "returned" };
  } else if (lastDigit >= 3) {
    return { state: "shipped" };
  } else {
    return { state: "pending" };
  }
}
