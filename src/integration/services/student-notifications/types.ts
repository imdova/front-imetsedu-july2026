export interface StudentPortalNotification {
  _id: string;
  type?: string;
  title?: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPortalNotificationsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentPortalNotificationsResponse {
  unreadCount: number;
  data: StudentPortalNotification[];
  meta: StudentPortalNotificationsMeta;
}

export interface GetStudentNotificationsQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}
