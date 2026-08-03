import * as Yup from "yup";

export const marketplaceSchema = Yup.object({
  title: Yup.string().required().label("Title"),
  slug: Yup.string().required().label("Slug"),
  image: Yup.string().label("Image"),
  description: Yup.string().label("Description"),
  status: Yup.string().label("Status"),
});

export const marketplaceInitialValues: MarketplaceValues = {
  title: "",
  slug: "",
  image: "",
  description: "",
  status: "true",
};

export interface MarketplaceValues {
  title: string;
  slug: string;
  image: string;
  description: string;
  status: string;
}
