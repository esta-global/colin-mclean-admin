import * as Yup from "yup";

export const sustainabilityPageSchema = Yup.object({
  breadcrumbTitle: Yup.string().label("Breadcrumb Title"),
  breadcrumbBanner: Yup.string().label("Page Content"),

  // First Section
  firstSectionTitle: Yup.string().label("About Section Title"),
  firstSectionSubTitle: Yup.string().label("About Section Sub Title"),
  firstSectionContent: Yup.string().label("About Section Content"),
  firstSectionFirstImage: Yup.string().label("About Section First Image"),
  firstSectionSecondImage: Yup.string().label("About Section Second Image"),

  // Second Section
  secondSectionTitle: Yup.string().label("Second Section Title"),
  secondSectionSubTitle: Yup.string().label("Second Section Sub Title"),
  secondSectionImage: Yup.string().label("Second Section Image"),
  secondSectionContent: Yup.string().label("Second Section Content"),

  // Second Section
  thirdSectionTitle: Yup.string().label("Third Section Title"),
  thirdSectionSubTitle: Yup.string().label("Third Section Sub Title"),
  thirdSectionImage: Yup.string().label("Third Section Image"),
  thirdSectionContent: Yup.string().label("Third Section Content"),

  // Meta
  metaTitle: Yup.string().label("Meta Title"),
  metaDescription: Yup.string().label("Meta Description"),
  metaKeywords: Yup.string().label("Meta Keywords"),
});

export const sustainabilityPageInitialValues: SustainabilityPageValues = {
  breadcrumbTitle: "",
  breadcrumbBanner: "",

  // First section
  firstSectionTitle: "",
  firstSectionSubTitle: "",
  firstSectionContent: "",
  firstSectionFirstImage: "",
  firstSectionSecondImage: "",

  // Second section
  secondSectionTitle: "",
  secondSectionSubTitle: "",
  secondSectionContent: "",
  secondSectionImage: "",

  // Third section
  thirdSectionTitle: "",
  thirdSectionSubTitle: "",
  thirdSectionContent: "",
  thirdSectionImage: "",

  // Meta
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

export interface SustainabilityPageValues {
  breadcrumbTitle: string;
  breadcrumbBanner: string;

  firstSectionTitle: string;
  firstSectionSubTitle: string;
  firstSectionContent: string;
  firstSectionFirstImage: string;
  firstSectionSecondImage: string;

  secondSectionTitle: string;
  secondSectionSubTitle: string;
  secondSectionImage: string;
  secondSectionContent: string;

  thirdSectionTitle: string;
  thirdSectionSubTitle: string;
  thirdSectionImage: string;
  thirdSectionContent: string;

  // Meta
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}
