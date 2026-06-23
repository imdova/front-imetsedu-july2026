// Public
export const API_BLOG = "/blog";
export const apiBlogBySlug = (slug: string) => `/blog/${slug}`;
export const API_BLOG_CATEGORIES_PUBLIC = "/blog/categories";
export const API_BLOG_TOPICS = "/blog/topics";
export const apiBlogCategoryLanding = (slug: string) => `/blog/category/${slug}`;

// Admin — articles
export const API_ADMIN_BLOG = "/admin/blog";
export const apiAdminBlog = (id: string) => `/admin/blog/${id}`;
export const apiAdminBlogAction = (id: string, action: string) => `/admin/blog/${id}/${action}`;
export const apiAdminBlogFeatured = (id: string) => `/admin/blog/${id}/featured`;
export const API_ADMIN_BLOG_AI = "/admin/blog/ai-assist";

// Admin — taxonomy / authors / templates
export const API_ADMIN_BLOG_CATEGORIES = "/admin/blog/categories";
export const apiAdminBlogCategory = (id: string) => `/admin/blog/categories/${id}`;
export const API_ADMIN_BLOG_SUBCATEGORIES = "/admin/blog/subcategories";
export const apiAdminBlogSubcategory = (id: string) => `/admin/blog/subcategories/${id}`;
export const API_ADMIN_BLOG_AUTHORS = "/admin/blog/authors";
export const apiAdminBlogAuthor = (id: string) => `/admin/blog/authors/${id}`;
export const API_ADMIN_BLOG_TEMPLATES = "/admin/blog/templates";
export const apiAdminBlogTemplate = (id: string) => `/admin/blog/templates/${id}`;
