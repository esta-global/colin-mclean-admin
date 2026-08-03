import * as Yup from "yup";

export const faqsSchema = Yup.object({
  faqsCategory: Yup.object().required().label("Faqs Category"),
  question: Yup.string().required().label("Question"),
  answer: Yup.string().required().label("Answer"),

  status: Yup.string().label("Status"),
});

export const faqsInitialValues: FaqsValue = {
  faqsCategory: null,
  question: "",
  answer: "",
  status: "true",
};

export interface FaqsValue {
  faqsCategory: {
    label: string;
    value: string;
  } | null;

  question: string;
  answer: string;

  status: string;
}
