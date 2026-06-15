export interface GroupCategory {
  _id: string;
  name: string;
  groupsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateGroupCategoryInput {
  name: string;
  isActive: boolean;
}

export interface UpdateGroupCategoryInput {
  name?: string;
  isActive?: boolean;
}
