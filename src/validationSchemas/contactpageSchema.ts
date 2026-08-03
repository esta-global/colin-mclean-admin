import * as Yup from "yup";

export type ContactPageValues = {
  uiText: {
    headerBadge: string;
    headerTitle: string;
    headerDescription: string;
    heroCardTitle: string;
    heroCardSubtitle: string;
    businessEyebrow: string;
    businessTitle: string;
    faqEyebrow: string;
    faqTitle: string;
    socialEyebrow: string;
    socialTitle: string;
    seoEyebrow: string;
    seoTitle: string;
    formEyebrow: string;
    formHeading: string;
    fullNameLabel: string;
    emailLabel: string;
    companyLabel: string;
    companyOptionalLabel: string;
    subjectLabel: string;
    categoryLabel: string;
    categoryDefaultOption: string;
    messagePlaceholder: string;
    formHelpTitle: string;
    formCounterText: string;
    formSubmitButtonText: string;
    formFootnote: string;
    stickyTitle: string;
    stickyDescription: string;
  };
  heroSection: {
    eyebrow: string;
    heading: string;
    description: string;
    supportIcon: string;
  };
  contactOptions: {
    title: string;
    value: string;
    description: string;
    href: string;
    badge: string;
    icon: string;
    isActive: boolean;
  }[];
  businessInfo: {
    businessHours: {
      label: string;
      days: string;
      time: string;
    };
    timezone: {
      label: string;
      value: string;
      description: string;
    };
    responseTime: {
      label: string;
      value: string;
      description: string;
    };
  };
  faqs: {
    question: string;
    answer: string;
    isActive: boolean;
  }[];
  socialLinks: {
    label: string;
    href: string;
    icon: string;
    isActive: boolean;
    badge: string;
  }[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
};

export const contactOptionInitialValue = {
  title: "",
  value: "",
  description: "",
  href: "",
  badge: "",
  icon: "",
  isActive: true,
};

export const contactFaqInitialValue = {
  question: "",
  answer: "",
  isActive: true,
};

export const contactSocialLinkInitialValue = {
  label: "",
  href: "",
  icon: "",
  isActive: true,
  badge: "",
};

export const contactpageInitialValues: ContactPageValues = {
  uiText: {
    headerBadge: "Contact Page CMS",
    headerTitle: "Contact Page",
    headerDescription:
      "Edit the public contact page in the same visual layout customers see.",
    heroCardTitle: "Support routing ready",
    heroCardSubtitle: "Bugs, support, sales, and ideas",
    businessEyebrow: "Business Information",
    businessTitle: "Support availability",
    faqEyebrow: "FAQ Shortcut",
    faqTitle: "Quick answers",
    socialEyebrow: "Social",
    socialTitle: "Social links",
    seoEyebrow: "SEO",
    seoTitle: "Search metadata",
    formEyebrow: "Message The Team",
    formHeading: "Tell us what you need",
    fullNameLabel: "Full Name",
    emailLabel: "Email Address",
    companyLabel: "Company",
    companyOptionalLabel: "(Optional)",
    subjectLabel: "Subject",
    categoryLabel: "Category",
    categoryDefaultOption: "General Inquiry",
    messagePlaceholder:
      "Share the issue, goal, marketplace, and any details that will help us route your message.",
    formHelpTitle: "Helpful context gets faster replies",
    formCounterText: "0/1000",
    formSubmitButtonText: "Send Message",
    formFootnote:
      "This form opens your email app. No backend submission endpoint is used.",
    stickyTitle: "Contact page changes",
    stickyDescription: "Inline edits save to the Contact Page CMS API.",
  },
  heroSection: {
    eyebrow: "",
    heading: "",
    description: "",
    supportIcon: "",
  },
  contactOptions: [],
  businessInfo: {
    businessHours: {
      label: "",
      days: "",
      time: "",
    },
    timezone: {
      label: "",
      value: "",
      description: "",
    },
    responseTime: {
      label: "",
      value: "",
      description: "",
    },
  },
  faqs: [],
  socialLinks: [],
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  },
};

export const contactpageSchema = Yup.object({
  uiText: Yup.object({
    headerBadge: Yup.string().label("Header Badge"),
    headerTitle: Yup.string().label("Header Title"),
    headerDescription: Yup.string().label("Header Description"),
    heroCardTitle: Yup.string().label("Hero Card Title"),
    heroCardSubtitle: Yup.string().label("Hero Card Subtitle"),
    businessEyebrow: Yup.string().label("Business Eyebrow"),
    businessTitle: Yup.string().label("Business Title"),
    faqEyebrow: Yup.string().label("FAQ Eyebrow"),
    faqTitle: Yup.string().label("FAQ Title"),
    socialEyebrow: Yup.string().label("Social Eyebrow"),
    socialTitle: Yup.string().label("Social Title"),
    seoEyebrow: Yup.string().label("SEO Eyebrow"),
    seoTitle: Yup.string().label("SEO Title"),
    formEyebrow: Yup.string().label("Form Eyebrow"),
    formHeading: Yup.string().label("Form Heading"),
    fullNameLabel: Yup.string().label("Full Name Label"),
    emailLabel: Yup.string().label("Email Label"),
    companyLabel: Yup.string().label("Company Label"),
    companyOptionalLabel: Yup.string().label("Company Optional Label"),
    subjectLabel: Yup.string().label("Subject Label"),
    categoryLabel: Yup.string().label("Category Label"),
    categoryDefaultOption: Yup.string().label("Category Default Option"),
    messagePlaceholder: Yup.string().label("Message Placeholder"),
    formHelpTitle: Yup.string().label("Form Help Title"),
    formCounterText: Yup.string().label("Form Counter Text"),
    formSubmitButtonText: Yup.string().label("Form Submit Button Text"),
    formFootnote: Yup.string().label("Form Footnote"),
    stickyTitle: Yup.string().label("Sticky Title"),
    stickyDescription: Yup.string().label("Sticky Description"),
  }),
  heroSection: Yup.object({
    eyebrow: Yup.string().label("Eyebrow"),
    heading: Yup.string().label("Heading"),
    description: Yup.string().label("Description"),
    supportIcon: Yup.string().label("Support Icon"),
  }),
  contactOptions: Yup.array().of(
    Yup.object({
      title: Yup.string().label("Title"),
      value: Yup.string().label("Value"),
      description: Yup.string().label("Description"),
      href: Yup.string().label("Link"),
      badge: Yup.string().label("Badge"),
      icon: Yup.string().label("Icon"),
      isActive: Yup.boolean().default(true).label("Active"),
    }),
  ),
  businessInfo: Yup.object({
    businessHours: Yup.object({
      label: Yup.string().label("Business Hours Label"),
      days: Yup.string().label("Business Days"),
      time: Yup.string().label("Business Time"),
    }),
    timezone: Yup.object({
      label: Yup.string().label("Timezone Label"),
      value: Yup.string().label("Timezone"),
      description: Yup.string().label("Timezone Description"),
    }),
    responseTime: Yup.object({
      label: Yup.string().label("Response Time Label"),
      value: Yup.string().label("Response Time"),
      description: Yup.string().label("Response Time Description"),
    }),
  }),
  faqs: Yup.array().of(
    Yup.object({
      question: Yup.string().label("Question"),
      answer: Yup.string().label("Answer"),
      isActive: Yup.boolean().default(true).label("Active"),
    }),
  ),
  socialLinks: Yup.array().of(
    Yup.object({
      label: Yup.string().label("Label"),
      href: Yup.string().label("Link"),
      icon: Yup.string().label("Icon"),
      isActive: Yup.boolean().default(true).label("Active"),
      badge: Yup.string().label("Badge"),
    }),
  ),
  seo: Yup.object({
    metaTitle: Yup.string().label("Meta Title"),
    metaDescription: Yup.string().label("Meta Description"),
    keywords: Yup.string().label("Keywords"),
  }),
});
