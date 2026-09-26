// TODO: Mocked — no real Billbee integration, returns hardcoded order state
export async function getOrderStatus(
  orderId: string
): Promise<{ state: "returned" | "shipped" | "pending" }> {
  throw new Error("getOrderStatus() not implemented yet");
}
