import * as Yup from "yup";

export const categorySchema = Yup.object({
  email: Yup.string().email().required().label("Email"),
  subscriptionStatus: Yup.string().required().label("Subscription Status"),
});

export const newsletterInitialValues: NewsletterValues = {
  email: "",
  subscriptionStatus: "SUBSCRIBED",
};

export interface NewsletterValues {
  email: string;
  subscriptionStatus: string;
}
