export interface CrmSetting {
  id: string;
  _id?: string;
  nameAr: string;
  nameEn: string;
  options: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCrmSettingDto {
  nameAr: string;
  nameEn: string;
  options: string[];
  isActive?: boolean;
}

export interface UpdateCrmSettingDto {
  nameAr?: string;
  nameEn?: string;
  options?: string[];
  isActive?: boolean;
}
