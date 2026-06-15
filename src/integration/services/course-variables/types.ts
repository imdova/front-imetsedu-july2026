export interface CourseVariable {
  id: string;
  _id?: string;
  nameAr: string;
  nameEn: string;
  optionsAr: string[];
  optionsEn: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseVariableDto {
  nameAr: string;
  nameEn: string;
  optionsAr: string[];
  optionsEn: string[];
  isActive?: boolean;
}

export interface UpdateCourseVariableDto {
  nameAr?: string;
  nameEn?: string;
  optionsAr?: string[];
  optionsEn?: string[];
  isActive?: boolean;
}
