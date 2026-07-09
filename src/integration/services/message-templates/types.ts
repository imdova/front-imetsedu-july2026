export interface MessageTemplateDto {
  _id: string;
  title: string;
  body: string;
  courseId: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}
