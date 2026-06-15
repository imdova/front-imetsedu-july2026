export interface Tag {
  id?: string;
  _id?: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  color: string;
  isActive: boolean;
  coursesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTagInput {
  nameAr: string;
  nameEn: string;
  isActive?: boolean;
}

export interface UpdateTagInput {
  nameAr?: string;
  nameEn?: string;
  slug?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  color?: string;
  isActive?: boolean;
}
