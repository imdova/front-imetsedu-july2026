import { GroupCategory } from "../group-categories/types";

export interface GroupSubCategory {
  _id: string;
  name: string;
  parentCategory: string | GroupCategory | null;
  groupsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateGroupSubCategoryInput {
  name: string;
  parentCategory: string; // ID of the parent category
  isActive: boolean;
}

export interface UpdateGroupSubCategoryInput {
  name?: string;
  parentCategory?: string;
  isActive?: boolean;
}
