/** Course taxonomy DAL — categories, sub-categories, tags, course variables. LIVE. */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as categoriesSvc from "@integration/services/categories";
import * as subCategoriesSvc from "@integration/services/sub-categories";
import * as tagsSvc from "@integration/services/tags";
import * as courseVariablesSvc from "@integration/services/course-variables";
import type { CreateCategoryInput, UpdateCategoryInput } from "@integration/services/categories";
import type { CreateSubCategoryInput, UpdateSubCategoryInput } from "@integration/services/sub-categories";
import type { CreateTagInput, UpdateTagInput } from "@integration/services/tags";
import type { TaxonomyRow, CourseSubcategory, CourseVariable } from "@/lib/db/course-taxonomy";
import { toTaxonomyRow, toCourseSubcategory, toCourseVariable } from "@/lib/courses/map-taxonomy";

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []));

async function mapList<T>(
  call: () => Promise<Result<unknown>>,
  map: (raw: any) => T,
  msg: string,
): Promise<Result<T[]>> {
  const res = await call();
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(map));
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

export const fetchCourseCategories = (): Promise<Result<TaxonomyRow[]>> =>
  mapList(categoriesSvc.listCategories, toTaxonomyRow, "Failed to load categories");
export const fetchCourseSubcategories = (): Promise<Result<CourseSubcategory[]>> =>
  mapList(subCategoriesSvc.listSubCategories, toCourseSubcategory, "Failed to load sub-categories");

export const fetchCourseCategory = async (id: string): Promise<Result<any>> =>
  categoriesSvc.getCategoryById(id);

export const fetchCourseSubcategory = async (id: string): Promise<Result<any>> =>
  subCategoriesSvc.getSubCategoryById(id);
export const fetchCourseTags = (): Promise<Result<TaxonomyRow[]>> =>
  mapList(tagsSvc.listTags, toTaxonomyRow, "Failed to load tags");
export const fetchCourseVariables = (): Promise<Result<CourseVariable[]>> =>
  mapList(courseVariablesSvc.listCourseVariables, toCourseVariable, "Failed to load course variables");

/** LIVE: create a course category (POST /categories, admin only). */
export const createCourseCategory = async (
  input: CreateCategoryInput,
): Promise<Result<TaxonomyRow>> => {
  const res = await categoriesSvc.createCategory(input);
  if (!res.ok) return res;
  try {
    return ok(toTaxonomyRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create category"));
  }
};

/** LIVE: create a sub-category (POST /sub-categories, admin only). */
export const createCourseSubcategory = async (
  input: CreateSubCategoryInput,
): Promise<Result<CourseSubcategory>> => {
  const res = await subCategoriesSvc.createSubCategory(input);
  if (!res.ok) return res;
  try {
    return ok(toCourseSubcategory(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create sub-category"));
  }
};

/** LIVE: create a course tag (POST /tags, admin only). */
export const createCourseTag = async (
  input: CreateTagInput,
): Promise<Result<TaxonomyRow>> => {
  const res = await tagsSvc.createTag(input);
  if (!res.ok) return res;
  try {
    return ok(toTaxonomyRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create tag"));
  }
};

/** LIVE: update taxonomy entries (admin only). */
export const updateCourseCategory = async (
  id: string,
  input: UpdateCategoryInput,
): Promise<Result<TaxonomyRow>> => {
  const res = await categoriesSvc.updateCategory(id, input);
  if (!res.ok) return res;
  try {
    return ok(toTaxonomyRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update category"));
  }
};

export const updateCourseSubcategory = async (
  id: string,
  input: UpdateSubCategoryInput,
): Promise<Result<CourseSubcategory>> => {
  const res = await subCategoriesSvc.updateSubCategory(id, input);
  if (!res.ok) return res;
  try {
    return ok(toCourseSubcategory(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update sub-category"));
  }
};

export const updateCourseTag = async (
  id: string,
  input: UpdateTagInput,
): Promise<Result<TaxonomyRow>> => {
  const res = await tagsSvc.updateTag(id, input);
  if (!res.ok) return res;
  try {
    return ok(toTaxonomyRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update tag"));
  }
};

/** LIVE: duplicate taxonomy entries (admin only). */
export const duplicateCourseCategory = async (id: string): Promise<Result<TaxonomyRow>> => {
  const res = await categoriesSvc.duplicateCategory(id);
  if (!res.ok) return res;
  try {
    return ok(toTaxonomyRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to duplicate category"));
  }
};

export const duplicateCourseSubcategory = async (id: string): Promise<Result<CourseSubcategory>> => {
  const res = await subCategoriesSvc.duplicateSubCategory(id);
  if (!res.ok) return res;
  try {
    return ok(toCourseSubcategory(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to duplicate sub-category"));
  }
};

/** LIVE: toggle tag active status (admin only). */
export const toggleCourseTagActive = async (id: string): Promise<Result<TaxonomyRow>> => {
  const res = await tagsSvc.toggleTagStatus(id);
  if (!res.ok) return res;
  try {
    return ok(toTaxonomyRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to toggle tag status"));
  }
};

/** LIVE: download taxonomy spreadsheets (admin only). */
export const downloadCourseCategories = () => categoriesSvc.downloadCategories();
export const downloadCourseSubcategories = () => subCategoriesSvc.downloadSubCategories();

/** LIVE: delete taxonomy entries (admin only). */
export const deleteCourseCategory = (id: string) => categoriesSvc.deleteCategory(id);
export const deleteCourseSubcategory = (id: string) => subCategoriesSvc.deleteSubCategory(id);
export const deleteCourseTag = (id: string) => tagsSvc.deleteTag(id);
