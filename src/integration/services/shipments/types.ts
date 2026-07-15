export interface ShipmentDto {
  _id: string;
  recipient: string;
  address: string;
  /** Carrier value — "aramex" | "dhl" | "egypt-post". */
  courier?: string;
  /** ISO 3166-1 alpha-2 country code. */
  country?: string;
  /** First-level admin division (governorate / emirate / wilaya). */
  state?: string;
  note?: string;
  status: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
