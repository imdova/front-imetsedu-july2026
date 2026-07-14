export interface ImportantLinkDto {
  _id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
