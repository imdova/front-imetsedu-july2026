const B = "/admin/email";

export const API_EMAIL_STATS = `${B}/campaigns/stats`;
export const API_EMAIL_SEGMENTS = `${B}/campaigns/segments`;
export const API_EMAIL_AUDIENCE_PREVIEW = `${B}/campaigns/audience-preview`;
export const API_EMAIL_AUDIENCES = `${B}/audiences`;
export const API_EMAIL_RECIPIENTS_PREVIEW = `${B}/recipients-preview`;

export const API_EMAIL_CAMPAIGNS = `${B}/campaigns`;
export const apiEmailCampaign = (id: string) => `${B}/campaigns/${id}`;
export const apiEmailCampaignAction = (id: string, action: string) => `${B}/campaigns/${id}/${action}`;

export const API_EMAIL_TEMPLATES = `${B}/templates`;
export const apiEmailTemplate = (id: string) => `${B}/templates/${id}`;
export const apiEmailTemplateDesign = (id: string) => `${B}/templates/${id}/design`;
export const API_EMAIL_TEMPLATE_CATEGORIES = `${B}/template-categories`;
export const apiEmailTemplateCategory = (name: string) => `${B}/template-categories/${encodeURIComponent(name)}`;

export const API_EMAIL_AUTOMATIONS = `${B}/automations`;
export const apiEmailAutomation = (id: string) => `${B}/automations/${id}`;
export const apiEmailAutomationToggle = (id: string) => `${B}/automations/${id}/toggle`;

export const API_EMAIL_BRAND_BLOCKS = `${B}/brand-blocks`;
export const apiEmailBrandBlock = (id: string) => `${B}/brand-blocks/${id}`;

export const API_EMAIL_SUBSCRIBERS = `${B}/subscribers`;
export const apiEmailSubscriber = (id: string) => `${B}/subscribers/${id}`;
export const API_EMAIL_SUBSCRIBERS_IMPORT = `${B}/subscribers/import`;
export const API_EMAIL_SUBSCRIBERS_BULK_DELETE = `${B}/subscribers/bulk-delete`;
export const API_EMAIL_SUBSCRIBERS_ASSIGN = `${B}/subscribers/assign`;
export const API_EMAIL_SUBSCRIBERS_UNASSIGN = `${B}/subscribers/unassign`;
export const API_EMAIL_SUBSCRIBER_GROUPS = `${B}/subscriber-groups`;
export const apiEmailSubscriberGroup = (name: string) => `${B}/subscriber-groups/${encodeURIComponent(name)}`;
export const API_EMAIL_SUBSCRIBER_GROUP_LINKS = `${B}/subscriber-group-links`;
