/** Admin-editable template for the downloadable invoice PDF. Mirrors the
 * backend `invoice-template` singleton. */

export interface InvoiceTemplateColors {
  primary: string;
  headerText: string;
  accent: string;
  heading: string;
  text: string;
  muted: string;
  tableHeaderBg: string;
  border: string;
}

export interface InvoiceTemplateCompany {
  wordmark: string;
  tagline: string;
  name: string;
  address: string;
}

export interface InvoiceTemplateSections {
  coloredHeader: boolean;
  showCompany: boolean;
  showTerms: boolean;
  showReceipt: boolean;
  showFooter: boolean;
}

export interface InvoiceTemplateLabels {
  invoiceTitle: string;
  billTo: string;
  receipt: string;
  footer: string;
}

export interface InvoiceTemplate {
  colors: InvoiceTemplateColors;
  company: InvoiceTemplateCompany;
  sections: InvoiceTemplateSections;
  labels: InvoiceTemplateLabels;
}

export type InvoiceTemplatePatch = { [K in keyof InvoiceTemplate]?: Partial<InvoiceTemplate[K]> };
