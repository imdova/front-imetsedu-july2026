import { api, type Result } from "@integration/services/http/client";
import { COURSE_VARIABLES_API } from "@integration/constants/api/course-variables";
import type { CourseVariable, CreateCourseVariableDto, UpdateCourseVariableDto } from "./types";

export function listCourseVariables(): Promise<Result<CourseVariable[]>> {
  return api.get<CourseVariable[]>(COURSE_VARIABLES_API.LIST);
}

export function listActiveCourseVariables(): Promise<Result<CourseVariable[]>> {
  return api.get<CourseVariable[]>(COURSE_VARIABLES_API.LIST_ACTIVE, { requireAuth: false });
}

export function createCourseVariable(input: CreateCourseVariableDto): Promise<Result<CourseVariable>> {
  return api.post<CourseVariable>(COURSE_VARIABLES_API.CREATE, input);
}

export function getCourseVariableById(id: string): Promise<Result<CourseVariable>> {
  return api.get<CourseVariable>(COURSE_VARIABLES_API.GET_BY_ID(id));
}

export function updateCourseVariable(id: string, input: UpdateCourseVariableDto): Promise<Result<CourseVariable>> {
  return api.patch<CourseVariable>(COURSE_VARIABLES_API.UPDATE(id), input, {
    headers: { "lang": "en" }
  });
}

export function deleteCourseVariable(id: string): Promise<Result<void>> {
  return api.delete<void>(COURSE_VARIABLES_API.DELETE(id));
}

export function toggleCourseVariableStatus(id: string): Promise<Result<CourseVariable>> {
  return api.patch<CourseVariable>(COURSE_VARIABLES_API.TOGGLE_ACTIVE(id), {});
}

export function addCourseVariableOption(id: string, optionAr: string, optionEn: string): Promise<Result<CourseVariable>> {
  return api.post<CourseVariable>(COURSE_VARIABLES_API.ADD_OPTION(id), { optionAr, optionEn });
}

export function removeCourseVariableOption(id: string, optionAr: string, optionEn: string): Promise<Result<CourseVariable>> {
  return api.delete<CourseVariable>(COURSE_VARIABLES_API.REMOVE_OPTION(id), { 
    body: JSON.stringify({ optionAr, optionEn }) 
  });
}
