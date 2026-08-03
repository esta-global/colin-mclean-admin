import * as Yup from "yup";

export interface IndustryHighlight {
  text: string;
  position: "left" | "right";
}

export interface IndustryLink {
  label: string;
  url: string;
}

export interface IndustryDetailsPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  detailsSection: {
    heading: string;
    paragraphs: string[];
    highlights: IndustryHighlight[];
    links: IndustryLink[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyIndustryHighlight = (): IndustryHighlight => ({
  text: "",
  position: "right",
});

export const createEmptyIndustryLink = (): IndustryLink => ({
  label: "",
  url: "",
});

export const industryDetailsPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  detailsSection: Yup.object({
    heading: stringField(),
    paragraphs: Yup.array().of(stringField()),
    highlights: Yup.array().of(
      Yup.object({
        text: stringField(),
        position: Yup.string().oneOf(["left", "right"]),
      }),
    ),
    links: Yup.array().of(
      Yup.object({
        label: stringField(),
        url: stringField(),
      }),
    ),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const industryDetailsPageInitialValues: IndustryDetailsPageValues = {
  bannerSection: {
    title: "Industry",
    highlightedTitle: "Details",
    image: "",
  },
  detailsSection: {
    heading: "Industry Details",
    paragraphs: [
      "The India Fan Industry is one of the leading in the world, both in terms of manufactured quantities as well as domestic consumption. Though the invention of fans happened in the USA which also started emerging as a leading manufacturer till 1930's yet India caught up briskly. By the late 1940's India had over a score of leading Industries making Fans in India, mainly in Calcutta.",
      "Two leading brands however remained flourishing in Western India. What is interesting is that 3 of the leading brands of late 40's are still amongst the leading brands of today.",
      "This interesting fact that is not widely known that by late 40's (after the independence) Amritsar and some parts of Punjab too came into being as a large centre of small and tiny industries manufacturing fans.",
      "From Calcutta, the major manufacturers like Orient and Usha started expanding with newer factories in Faridabad / Agra in North and Hyderabad in South India.",
      "Cinni enters with a new unique model with Black Table fans. Sturdy and entirely different in looks, it took its inspiration of design and feature gramme from antique models of few American and Italian brands of 1930's.",
      "The era of mid-eighties onwards saw a large number of Industries moving into Hardwar and Himachal due to excise benefits.",
    ],
    highlights: [
      { text: "Birthplace of Indian Industry was Calcutta - beginning 1930's", position: "right" },
      { text: "In late 1940's Amritsar too became the centre of small manufacturers - which vanished in next few decades", position: "left" },
      { text: "Hyderabad and parts of North India also become alternate hubs post 1960's", position: "right" },
      { text: "Cinni from Varanasi makes a quiet but formidable entry in 1950.", position: "left" },
      { text: "In 1980's, enter Haridwar and Himachal as other manufacturing hubs", position: "right" },
    ],
    links: [
      { label: "Indian Fan Industry: How It All Began", url: "" },
      { label: "The History of Electric Fans that intrigues us all", url: "" },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
