export interface LMSCategory {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  coursesCount?: number;
}

export interface CreateLMSCategoryInput {
  name: string;
  isActive?: boolean;
}

export interface UpdateLMSCategoryInput {
  name?: string;
  isActive?: boolean;
}
