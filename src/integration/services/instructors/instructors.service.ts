import { api, type Result } from "../http/client";
import { INSTRUCTORS_API } from "@integration/constants/api/instructors";
import {
  CreateInstructorDto,
  InstructorResponse,
  GetInstructorsQuery,
  GetInstructorsResponse,
} from "./types";

class InstructorService {
  async create(data: CreateInstructorDto): Promise<Result<InstructorResponse>> {
    return api.post<InstructorResponse>(
      INSTRUCTORS_API.CREATE,
      data
    );
  }

  async getAll(query?: GetInstructorsQuery): Promise<Result<GetInstructorsResponse>> {
    const params: Record<string, string | number | boolean> = {};
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });
    }
    return api.get<GetInstructorsResponse>(INSTRUCTORS_API.LIST, { params });
  }

  async getById(id: string): Promise<Result<InstructorResponse>> {
    const res = await api.get<InstructorResponse | { data: InstructorResponse }>(
      INSTRUCTORS_API.GET_BY_ID(id),
    );
    if (!res.ok) return res;
    const payload = res.data as InstructorResponse & { data?: InstructorResponse };
    const row = payload?.data ?? payload;
    return { ok: true, data: row as InstructorResponse };
  }

  async update(id: string, data: Partial<CreateInstructorDto>): Promise<Result<InstructorResponse>> {
    return api.patch<InstructorResponse>(INSTRUCTORS_API.UPDATE(id), data);
  }

  async delete(id: string): Promise<Result<void>> {
    return api.delete<void>(INSTRUCTORS_API.DELETE(id));
  }
}

export const instructorService = new InstructorService();
