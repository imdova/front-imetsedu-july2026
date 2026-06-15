export interface LMSSubCategory {
  _id: string;
  name: string;
  parentCategory: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  coursesCount?: number;
}

export interface CreateLMSSubCategoryInput {
  name: string;
  parentCategory: string;
  isActive?: boolean;
}

export interface UpdateLMSSubCategoryInput {
  name?: string;
  parentCategory?: string;
  isActive?: boolean;
}
