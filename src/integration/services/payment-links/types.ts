export interface PaymentLinkDto {
  _id: string;
  token: string;
  courseId: string;
  courseTitle: string;
  courseImage?: string;
  paymentType: string;
  amount: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  currency: string;
  status: string;
  payments?: PaymentEntryDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentEntryDto {
  transactionId?: string;
  payerName?: string;
  payerEmail?: string;
  amount?: number;
  paidAt?: string;
}

/** Public projection returned by /payment-links/public/:token. */
export interface PublicPaymentLinkDto {
  token: string;
  courseTitle: string;
  courseImage?: string;
  paymentType: string;
  amount: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  currency: string;
  status: string;
}
