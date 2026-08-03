import * as Yup from "yup";

export const galleryImageSchema = Yup.object({
  galleryCategory: Yup.object().required().label("Gallery Category"),

  status: Yup.string().label("Status"),
});

export const galleryImageInitialValues: GalleryImageValues = {
  galleryCategory: null,

  status: "true",
};

export interface GalleryImageValues {
  galleryCategory: {
    label: string;
    value: string;
  } | null;

  status: string;
}
