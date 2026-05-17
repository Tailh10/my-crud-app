export type Item = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
};

export const MOCK_ITEMS: Item[] = [
  { id: 1, name: "Laptop", description: "High-performance laptop for developers", createdAt: "2025-01-15" },
  { id: 2, name: "Mechanical Keyboard", description: "Tactile switches with RGB backlighting", createdAt: "2025-02-20" },
  { id: 3, name: "Monitor", description: "27-inch 4K display with USB-C hub", createdAt: "2025-03-10" },
];
