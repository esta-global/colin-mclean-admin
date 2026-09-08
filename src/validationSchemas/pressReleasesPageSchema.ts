import * as Yup from "yup";

export interface PressReleaseItem {
  date: string;
  title: string;
  file: string;
  externalUrl: string;
  sortOrder: number;
  status: boolean;
}

export interface PressReleasesPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  releasesSection: {
    heading: string;
    releases: PressReleaseItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyPressRelease = (sortOrder = 0): PressReleaseItem => ({
  date: "",
  title: "",
  file: "",
  externalUrl: "",
  sortOrder,
  status: true,
});

export const pressReleasesPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  releasesSection: Yup.object({
    heading: stringField(),
    releases: Yup.array().of(
      Yup.object({
        date: stringField(),
        title: stringField(),
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

export const pressReleasesPageInitialValues: PressReleasesPageValues = {
  bannerSection: {
    title: "Media",
    highlightedTitle: "",
    image: "",
  },
  releasesSection: {
    heading: "Press Releases",
    releases: [
      {
        ...createEmptyPressRelease(1),
        date: "August 25th, 2022",
        title: "Indian Fan Manufacturers Association (IFMA) bats for energy-efficient fans to reduce power consumption In India",
      },
      {
        ...createEmptyPressRelease(2),
        date: "April 30th, 2022",
        title: "Soaring temperatures, innovations, premiumisation driving fan industry growth",
      },
      {
        ...createEmptyPressRelease(3),
        date: "September 30th, 2021",
        title: "21st AGM Of Indian Fan Manufacturers Association",
      },
      {
        ...createEmptyPressRelease(4),
        date: "August 30th, 2020",
        title: "20th AGM Of Indian Fan Manufacturers Association",
      },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
