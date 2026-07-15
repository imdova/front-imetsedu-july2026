export interface ShipmentDto {
  _id: string;
  recipient: string;
  address: string;
  note?: string;
  status: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
