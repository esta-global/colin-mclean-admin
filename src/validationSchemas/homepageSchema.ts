import * as Yup from "yup";

export interface PerspectiveItem {
  title: string;
  category: string;
  href: string;
}

export interface LectureItem {
  number: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

export interface HomepageValues {
  heroSection: {
    eyebrow: string;
    title: string;
    summary: string;
    image: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };
  perspectivesSection: {
    eyebrow: string;
    title: string;
    description: string;
    items: PerspectiveItem[];
  };
  topicsSection: {
    eyebrow: string;
    title: string;
    description: string;
  };
  aboutPreviewSection: {
    heading: string;
    role: string;
    paragraphs: string[];
    credential: string;
    image: string;
    buttonText: string;
    buttonLink: string;
  };
  essaysPreviewSection: {
    eyebrow: string;
    title: string;
    description: string;
  };
  lecturesSection: {
    eyebrow: string;
    title: string;
    description: string;
    items: LectureItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const stringField = () => Yup.string().trim();

export const homepageSchema = Yup.object({
  heroSection: Yup.object({
    eyebrow: stringField(),
    title: stringField().required("Hero title is required"),
    summary: stringField(),
    image: stringField(),
    primaryButtonText: stringField(),
    primaryButtonLink: stringField(),
    secondaryButtonText: stringField(),
    secondaryButtonLink: stringField(),
  }),
  perspectivesSection: Yup.object({
    eyebrow: stringField(),
    title: stringField(),
    description: stringField(),
  }),
  topicsSection: Yup.object({
    eyebrow: stringField(),
    title: stringField(),
    description: stringField(),
  }),
  aboutPreviewSection: Yup.object({
    heading: stringField(),
    role: stringField(),
    credential: stringField(),
    image: stringField(),
    buttonText: stringField(),
    buttonLink: stringField(),
  }),
  essaysPreviewSection: Yup.object({
    eyebrow: stringField(),
    title: stringField(),
    description: stringField(),
  }),
  lecturesSection: Yup.object({
    eyebrow: stringField(),
    title: stringField(),
    description: stringField(),
  }),
  seo: Yup.object({
    metaTitle: stringField(),
    metaDescription: stringField(),
    keywords: Yup.array().of(stringField()),
  }),
});

export const homepageInitialValues: HomepageValues = {
  heroSection: {
    eyebrow: "Investor · Writer · Lecturer",
    title: "Thoughts on finance, business and public policy.",
    summary: "Colin McLean's insights and perspectives on economics, business, behaviour and public policy.",
    image: "/images/hero.webp",
    primaryButtonText: "Read latest thinking",
    primaryButtonLink: "/writing",
    secondaryButtonText: "About Colin",
    secondaryButtonLink: "/about",
  },
  perspectivesSection: {
    eyebrow: "Point of view",
    title: "Perspectives",
    description: "Thought leadership is more than subjects and credentials. It is the perspective brought to the questions that matter.",
    items: [
      { title: "Finance is failing Gen Z", category: "Business", href: "/writing/finance-is-failing-gen-z" },
      { title: "AI drives growth in micro enterprises", category: "Economics", href: "/writing/ai-drives-growth-in-micro-enterprises" },
      { title: "Prosperity underpins economic growth", category: "Public policy", href: "/writing/prosperity-underpins-economic-growth" },
    ],
  },
  topicsSection: {
    eyebrow: "Focus areas",
    title: "Key Topics",
    description: "Explore core subjects across markets, business, public policy and society.",
  },
  aboutPreviewSection: {
    heading: "About",
    role: "Investor. Writer. Guest Lecturer.",
    paragraphs: [
      "I’m a professional investor, writing on finance, business and public policy. My recent articles examine current socio-economic and population-health challenges through an economic lens, advocating fresh perspectives on the problems.",
      "Lecturing focuses on behavioural finance and current market topics, alongside other interests spanning public health, society and life in Scotland.",
    ],
    credential: "Recently retired from Board of Public Health Scotland. Writes for The Herald.",
    image: "/images/portrait.png",
    buttonText: "More about Colin",
    buttonLink: "/about",
  },
  essaysPreviewSection: {
    eyebrow: "Recent blogs",
    title: "Blogs",
    description: "Recent articles, insights and commentary on markets, business, behaviour and public policy.",
  },
  lecturesSection: {
    eyebrow: "Lectures & speaking",
    title: "Lectures",
    description: "Ideas brought into practice through talks and presentations on behavioural finance, investment and current economic topics.",
    items: [
      { number: "01", title: "Behavioural Finance in Practice", description: "How human behaviour shapes investment decisions.", image: "/images/lecture-finance.png", href: "/lectures/behavioural-finance-in-practice" },
      { number: "02", title: "Current Topics in Investment", description: "Key trends and what they mean for investors.", image: "/images/lecture-behaviour.png", href: "/lectures/current-topics-in-investment" },
    ],
  },
  seo: {
    metaTitle: "Colin McLean | Investor, writer and lecturer",
    metaDescription: "Independent perspectives on investment, economics, business, behaviour and public policy.",
    keywords: ["Colin McLean", "Investing", "Economics", "Public Policy", "Lectures"],
  },
};
