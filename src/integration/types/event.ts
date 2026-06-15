export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  category: string;
  maxAttendees?: number;
  currentAttendees: number;
  price: number;
  image?: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  registeredAt: string;
  status: 'registered' | 'attended' | 'cancelled';
}
