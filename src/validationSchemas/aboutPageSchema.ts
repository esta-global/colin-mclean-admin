import * as Yup from "yup";

export interface AboutPageTextBlock {
  title: string;
  description: string;
}

export interface AboutPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  introSection: {
    text: string;
  };
  storySection: {
    heading: string;
    logoImage: string;
    paragraphs: string[];
  };
  visionMissionSection: {
    vision: AboutPageTextBlock;
    mission: AboutPageTextBlock;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const aboutPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  introSection: Yup.object({
    text: stringField(),
  }),
  storySection: Yup.object({
    heading: stringField(),
    logoImage: stringField(),
    paragraphs: Yup.array().of(stringField()),
  }),
  visionMissionSection: Yup.object({
    vision: Yup.object({
      title: stringField(),
      description: stringField(),
    }),
    mission: Yup.object({
      title: stringField(),
      description: stringField(),
    }),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const aboutPageInitialValues: AboutPageValues = {
  bannerSection: {
    title: "About",
    highlightedTitle: "IFMA",
    image: "",
  },
  introSection: {
    text:
      "What started in 1950 as a small group of few dedicated fan industry entrepreneurs known as FMA (Fan Makers Association) has grown into the formidable IFMA by the turn of the century, now boasting of over 120 members and is ever growing.",
  },
  storySection: {
    heading:
      "Over the past seven decades, IFMA's leading members have not only shaped the fan industry but have also laid the foundation for its future by embracing newer technologies. The entire ecosystem has been well covered and great initiatives are in process.",
    logoImage: "",
    paragraphs: [
      "With a vision focused on sustainability and energy efficiency, IFMA has made significant strides in recent years. A standout achievement has been their compliance with the BEE star labelling norms, propelling the development of energy-efficient fans. This commitment not only reduces energy consumption but also bring tangible benefits to consumers and to the nation.",
      "In an effort to better serve the industry and its customers, IFMA has expanded its reach by welcoming vendors and small manufacturers into its fold. This inclusivity has led to a fivefold increase in membership, strengthening the association's collective expertise and voice.",
      "As we approach our upcoming AGM, we are not just looking back at the 75 years of the Indian fan industry's rich legacy but also celebrating the continued growth and innovation that defines IFMA's journey.",
    ],
  },
  visionMissionSection: {
    vision: {
      title: "Vision",
      description:
        "To be a catalyst for the growth of the Indian Fan Industry and act as a bridge between Industry Government & Society at large.",
    },
    mission: {
      title: "Mission",
      description:
        "IFMA aims to promote and develop cooperation among the fan manufacturers and to further provide quality services to its members and society at large enabling them to grow qualitatively & quantitatively.",
    },
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
