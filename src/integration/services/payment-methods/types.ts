export interface PaymentMethodDto {
  _id: string;
  title: string;
  details: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
