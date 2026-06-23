/** Raw backend shapes from the NestJS `marketing` module (Mongoose docs). */
export interface BannerDto {
  _id: string;
  title: string;
  message: string;
  linkUrl: string;
  linkLabel: string;
  placement: string;
  variant: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromotedDto {
  _id: string;
  itemType: string;
  itemId: string;
  label: string;
  slot: string;
  order: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerInput {
  title: string;
  message?: string;
  linkUrl?: string;
  linkLabel?: string;
  placement?: string;
  variant?: string;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  order?: number;
}

export interface PromotedInput {
  itemType: string;
  itemId: string;
  label?: string;
  slot?: string;
  order?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}
