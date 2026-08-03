import * as Yup from "yup";

export const contactInquiryCategories = [
  "General Inquiry",
  "Technical Support",
  "Billing",
  "Bug Report",
  "Feature Request",
  "Other",
] as const;

export const contactInquiryStatuses = [
  "New",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

export type ContactInquiryCategory = (typeof contactInquiryCategories)[number];
export type ContactInquiryStatus = (typeof contactInquiryStatuses)[number];

export type ContactInquiryValues = {
  status: ContactInquiryStatus | "";
  adminNotes: string;
  category: ContactInquiryCategory | "";
  subject: string;
  message: string;
};

export const contactInquiryInitialValues: ContactInquiryValues = {
  status: "",
  adminNotes: "",
  category: "",
  subject: "",
  message: "",
};

export const contactInquirySchema = Yup.object({
  status: Yup.string()
    .oneOf([...contactInquiryStatuses], "Invalid status")
    .required("Status is required")
    .label("Status"),
  adminNotes: Yup.string().label("Admin Notes"),
  category: Yup.string()
    .oneOf([...contactInquiryCategories], "Invalid category")
    .required("Category is required")
    .label("Category"),
  subject: Yup.string().required("Subject is required").label("Subject"),
  message: Yup.string()
    .min(20, "Message must be at least 20 characters")
    .required("Message is required")
    .label("Message"),
});
