export interface CrmSetting {
  _id: string;       // primary field returned by the API
  id?: string;       // alias – may be absent in raw API responses
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
