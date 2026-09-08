import * as Yup from "yup";

export interface MediaImageItem {
  title: string;
  image: string;
  sortOrder: number;
  status: boolean;
}

export interface MediaImagesPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  imagesSection: {
    heading: string;
    images: MediaImageItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyMediaImage = (sortOrder = 0): MediaImageItem => ({
  title: "",
  image: "",
  sortOrder,
  status: true,
});

export const mediaImagesPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  imagesSection: Yup.object({
    heading: stringField(),
    images: Yup.array().of(
      Yup.object({
        title: stringField(),
        image: stringField(),
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

export const mediaImagesPageInitialValues: MediaImagesPageValues = {
  bannerSection: {
    title: "Media",
    highlightedTitle: "Images",
    image: "",
  },
  imagesSection: {
    heading: "Media Images",
    images: [
      {
        ...createEmptyMediaImage(1),
        title: "Hardeep Singh being facilitated for his talk/launch of Mr Energy Saver mascot at YIFI",
      },
      {
        ...createEmptyMediaImage(2),
        title: "Hardeep Singh presenting the road map to energy efficient fans.",
      },
      {
        ...createEmptyMediaImage(3),
        title: "Hardeep Singh launching and explaining concept of the Mascot of Mr Energy Saver.",
      },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
