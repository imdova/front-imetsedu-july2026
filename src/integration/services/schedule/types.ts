export interface ScheduleGroupRef {
  _id: string;
  title: string;
}

export interface LiveClassScheduleEvent {
  type: "live_class";
  groupTitle: string;
  groupId: string;
  zoomLink?: string;
  lectureDay?: string;
  startTime?: string;
  endTime?: string;
}

export interface DeadlineScheduleEvent {
  type: "deadline";
  title: string;
  dueDate: string;
  group?: ScheduleGroupRef;
  priority?: string;
}

export interface QuizScheduleEvent {
  type: "quiz";
  title?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  group?: ScheduleGroupRef;
  groupTitle?: string;
  groupId?: string;
}

export interface StudentScheduleApiResponse {
  scheduleEvents: LiveClassScheduleEvent[];
  deadlineEvents: DeadlineScheduleEvent[];
  quizEvents: QuizScheduleEvent[];
}
