import * as Yup from "yup";

export interface VideoItem {
  title: string;
  videoUrl: string;
  sortOrder: number;
  status: boolean;
}

export interface VideosPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  videosSection: {
    heading: string;
    videos: VideoItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyVideo = (sortOrder = 0): VideoItem => ({
  title: "",
  videoUrl: "",
  sortOrder,
  status: true,
});

export const videosPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  videosSection: Yup.object({
    heading: stringField(),
    videos: Yup.array().of(
      Yup.object({
        title: stringField(),
        videoUrl: stringField(),
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

export const videosPageInitialValues: VideosPageValues = {
  bannerSection: {
    title: "Trivia",
    highlightedTitle: "Videos",
    image: "",
  },
  videosSection: {
    heading: "Videos",
    videos: [
      {
        ...createEmptyVideo(1),
        title: "IFMA trivia video",
        videoUrl: "",
      },
      {
        ...createEmptyVideo(2),
        title: "Vintage Fan in Indian Parliament",
        videoUrl: "",
      },
      {
        ...createEmptyVideo(3),
        title: "Legacy of Indian Fan",
        videoUrl: "",
      },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
