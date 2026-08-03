import * as Yup from "yup";

export const certificatepageSchema = Yup.object({
  // Aboutus
  pageTitle: Yup.string().label("Page Title"),
  pageSubTitle: Yup.string().label("Page Sub Title"),
  pageContent: Yup.string().label("Page Content"),

  breadcrumbTitle: Yup.string().label("Breadcrumb Title"),
  breadcrumbBanner: Yup.string().label("Page Content"),

  // Meta
  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),
});

export const certificatepageInitialValues: CertificatePageValues = {
  // Aboutus
  pageTitle: "",
  pageSubTitle: "",
  pageContent: "",

  breadcrumbTitle: "",
  breadcrumbBanner: "",

  // Meta
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

export interface CertificatePageValues {
  // Aboutus
  pageTitle: string;
  pageSubTitle: string;
  pageContent: string;

  breadcrumbTitle: string;
  breadcrumbBanner: string;

  // Meta
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}
