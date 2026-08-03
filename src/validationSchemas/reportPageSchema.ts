import * as Yup from "yup";

export interface ReportItem {
  title: string;
  year: string;
  coverImage: string;
  file: string;
  externalUrl: string;
  sortOrder: number;
  status: boolean;
}

export interface ReportPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  reportsSection: {
    heading: string;
    reports: ReportItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyReport = (sortOrder = 0): ReportItem => ({
  title: "",
  year: "",
  coverImage: "",
  file: "",
  externalUrl: "",
  sortOrder,
  status: true,
});

export const reportPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  reportsSection: Yup.object({
    heading: stringField(),
    reports: Yup.array().of(
      Yup.object({
        title: stringField(),
        year: stringField(),
        coverImage: stringField(),
        file: stringField(),
        externalUrl: stringField(),
        sortOrder: Yup.number(),
        status: Yup.boolean(),
      }),
    ),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const reportPageInitialValues: ReportPageValues = {
  bannerSection: {
    title: "Annual",
    highlightedTitle: "Reports",
    image: "",
  },
  reportsSection: {
    heading: "Annual Reports",
    reports: [
      {
        ...createEmptyReport(1),
        title: "Annual Report 2022",
        year: "2022",
      },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
