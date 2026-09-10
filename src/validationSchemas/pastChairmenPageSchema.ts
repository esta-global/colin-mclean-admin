import * as Yup from "yup";

export interface PastChairman {
  name: string;
  tenure: string;
  company: string;
  image: string;
}

export interface PastChairmenPageValues {
  bannerSection: {
    title: string;
    highlightedTitle: string;
    image: string;
  };
  introSection: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    text: string;
    paragraphs: string[];
    highlightText: string;
  };
  chairmenSection: {
    heading: string;
    chairmen: PastChairman[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const createEmptyPastChairman = (): PastChairman => ({
  name: "",
  tenure: "",
  company: "",
  image: "",
});

export const pastChairmenPageSchema = Yup.object({
  bannerSection: Yup.object({
    title: stringField(),
    highlightedTitle: stringField(),
    image: stringField(),
  }),
  introSection: Yup.object({
    eyebrow: stringField(),
    title: stringField(),
    highlightedTitle: stringField(),
    text: stringField(),
    paragraphs: Yup.array().of(stringField()),
    highlightText: stringField(),
  }),
  chairmenSection: Yup.object({
    heading: stringField(),
    chairmen: Yup.array().of(
      Yup.object({
        name: stringField(),
        tenure: stringField(),
        company: stringField(),
        image: stringField(),
      }),
    ),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const pastChairmenPageInitialValues: PastChairmenPageValues = {
  bannerSection: {
    title: "Past",
    highlightedTitle: "Chairmen",
    image: "",
  },
  introSection: {
    eyebrow: "Leadership Through The Years",
    title: "Illustrious. Industrious.",
    highlightedTitle: "Always Forward-Looking.",
    text:
      "IFMA has had good fortune of having illustrious industrialists and senior executives of fan industries at its helm. The contribution to the growth and well being of the industry has indeed been the outcome of leadership provided by each of them.",
    paragraphs: [
      "IFMA has had good fortune of having illustrious industrialists and senior executives of fan industries at its helm.",
      "The contribution to the growth and well being of the industry has indeed been the outcome of leadership provided by each of them.",
    ],
    highlightText:
      "A solid pedestal built by them is now ready to be nourished and taken to newer heights.",
  },
  chairmenSection: {
    heading: "Past Chairmen",
    chairmen: [
      { name: "Siddharth Shriram", tenure: "2000-01", company: "The Jay Engineering Works Ltd.", image: "" },
      { name: "Sunil Khaitan", tenure: "2002-03 & 2003-04", company: "Khaitan Electricals Ltd.", image: "" },
      { name: "Anil Agarwal", tenure: "2004-05 & 2005-06", company: "Polar Industries Ltd.", image: "" },
      { name: "Sunil Wadhwa", tenure: "2006-07 & 2007-08", company: "Usha International Ltd.", image: "" },
      { name: "Manoj Verma", tenure: "2008-09 & 2009-10", company: "Crompton Greaves Ltd.", image: "" },
      { name: "S B Bhaiya", tenure: "2010-11 & 2011-12", company: "Orient Fans", image: "" },
      { name: "A S Radhakrishna", tenure: "2012-13", company: "Bajaj Electricals ltd.", image: "" },
      { name: "Shekhar Bajaj", tenure: "2013-14", company: "Bajaj Electricals ltd.", image: "" },
      { name: "Rohit Mathur", tenure: "2014-15, 2015-16 & 2016-17", company: "Usha International Ltd.", image: "" },
      { name: "Rangarajan Sriram", tenure: "2017-18 & 2018-19", company: "Crompton Greaves Consumer Electricals Ltd.", image: "" },
      { name: "Atul Jain", tenure: "2019 - 2021", company: "Orient Electrics Ltd", image: "" },
      { name: "Ravindra Singh Negi", tenure: "2021-22", company: "Havells India Limited", image: "" },
      { name: "Anuj Poddar", tenure: "2022-2024", company: "Bajaj Electricals Limited", image: "" },
      { name: "Pradyumna Poddar", tenure: "2024", company: "Usha International Ltd.", image: "" },
    ],
  },
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};
