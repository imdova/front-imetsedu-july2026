/** Shipments DAL — LIVE against the NestJS `shipments` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/shipments";

export type ShipmentStatus = "requested" | "shipped" | "delivered" | "cancelled";
export type ShipmentCourier = "aramex" | "dhl" | "egypt-post";

export interface Shipment {
  id: string;
  recipient: string;
  address: string;
  courier: ShipmentCourier;
  /** ISO 3166-1 alpha-2 country code (Arab League states). */
  country: string;
  /** Governorate / emirate / wilaya. May be blank on older records. */
  state: string;
  note: string;
  status: ShipmentStatus;
  deliveredAt: string;
  createdAt: string;
}

export type ShipmentInput = {
  recipient: string;
  address: string;
  courier?: ShipmentCourier;
  country?: string;
  state?: string;
  note?: string;
  status?: ShipmentStatus;
};

const map = (d: svc.ShipmentDto): Shipment => ({
  id: d._id,
  recipient: d.recipient,
  address: d.address,
  // Records created before couriers/countries existed have neither; default
  // them the same way the backend schema does rather than render blanks.
  courier: (d.courier as ShipmentCourier) || "aramex",
  country: d.country || "EG",
  state: d.state ?? "",
  note: d.note ?? "",
  status: (d.status as ShipmentStatus) ?? "requested",
  deliveredAt: d.deliveredAt ?? "",
  createdAt: d.createdAt ?? "",
});

export async function fetchShipments(): Promise<Result<Shipment[]>> {
  const res = await svc.list();
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function createShipment(input: ShipmentInput): Promise<Result<Shipment>> {
  const res = await svc.create(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updateShipment(id: string, input: Partial<ShipmentInput>): Promise<Result<Shipment>> {
  const res = await svc.update(id, input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deleteShipment(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}
