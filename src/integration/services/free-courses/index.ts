export {
  listPublic, getPublicBySlug, listAll, getOne, create, update, remove,
  createLecture, updateLecture, removeLecture,
  createModule, updateModule, removeModule,
} from "./free-courses.service";
export type { FreeProgramDto, FreeLectureDto, FreeModuleDto } from "./types";
