import * as Yup from "yup";

export interface AboutPageValues {
  title: string;
  role: string;
  portraitImage: string;
  biography: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const aboutPageSchema = Yup.object({
  title: stringField().required("Title is required"),
  role: stringField().required("Role / Subtitle is required"),
  portraitImage: stringField(),
  biography: Yup.array().of(stringField()),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const aboutPageInitialValues: AboutPageValues = {
  title: "Colin McLean",
  role: "Investor. Writer. Guest Lecturer.",
  portraitImage: "/images/portrait.png",
  biography: [
    "I’m a professional investor, writing on finance, business and public policy. My recent articles examine current socio-economic and population-health challenges through an economic lens, advocating fresh perspectives on the problems.",
    "Lecturing is on behavioural finance and current market topics. This site also includes some of my other thoughts and interests. Recent work includes a non-executive role on the board of Public Health Scotland and executive positions in the asset management business I founded and sold.",
    "Previously I was vice chair of CFA Institute, the global body for investment professionals, and a former chair of CFA UK. I have served as an Honorary Professor at two Scottish universities and continue to guest lecture. I am co-author on two health economics papers submitted for publication.",
  ],
  seo: {
    metaTitle: "About Colin McLean | Investor, Writer and Lecturer",
    metaDescription: "Independent perspectives on investment, economics, business, behaviour and public policy.",
    keywords: ["Colin McLean", "Investor", "Writer", "Lecturer", "Finance"],
  },
};
