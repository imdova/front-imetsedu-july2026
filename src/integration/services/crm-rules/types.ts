export interface CrmRuleDto {
  _id: string;
  title: string;
  audience: string; // 'staff' | 'students' | 'general'
  body: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
