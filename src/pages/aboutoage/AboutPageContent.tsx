import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  GoBackButton,
  OverlayLoading,
  Pagination,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { API_URL } from "../../constants";
import { get, post, put } from "../../utills";
import { addUrlToFile } from "../../utills/addUrlToFile";
import {
  AboutPageValues,
  aboutPageInitialValues,
  aboutPageSchema,
} from "../../validationSchemas/aboutPageSchema";

type AboutPageApiBody = Partial<AboutPageValues> & {
  _id?: string;
  __v?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MediaRecord = {
  _id?: string;
  filename: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeAboutPageValues<T>(initial: T, incoming: unknown): T {
  if (Array.isArray(initial)) {
    return (Array.isArray(incoming) ? incoming : initial) as T;
  }

  if (isPlainObject(initial)) {
    const source = isPlainObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};

    Object.keys(initial).forEach((key) => {
      result[key] = mergeAboutPageValues(initial[key], source[key]);
    });

    return result as T;
  }

  return (incoming === undefined || incoming === null ? initial : incoming) as T;
}

function stripApiFields(data: AboutPageApiBody): Partial<AboutPageValues> {
  const payload = { ...data };

  delete payload._id;
  delete payload.__v;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;

  return payload;
}

function normalizeAboutPageValues(values: AboutPageValues): AboutPageValues {
  return {
    ...values,
    storySection: {
      ...values.storySection,
      paragraphs: values.storySection.paragraphs
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    },
    seo: {
      ...values.seo,
      keywords: values.seo.keywords
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    },
  };
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="about-page-card__heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

export function AboutPageContent() {
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedFileFor, setSelectedFileFor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<MediaRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 60,
    totalRecords: 0,
    totalPages: 0,
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: aboutPageInitialValues,
    validationSchema: aboutPageSchema,
    onSubmit: async function (
      formValues: AboutPageValues,
      helpers: FormikHelpers<AboutPageValues>,
    ) {
      setUpdating(true);
      const payload = normalizeAboutPageValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/aboutPage", payload)
        : await post("/aboutPage", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "About page saved successfully");
        const body = apiResponse.body
          ? stripApiFields(apiResponse.body as AboutPageApiBody)
          : payload;
        setValues(
          normalizeAboutPageValues(
            mergeAboutPageValues(aboutPageInitialValues, body),
          ),
        );
        setHasExistingData(true);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save about page");
      }
      setUpdating(false);
    },
  });

  useEffect(
    function () {
      async function fetchAboutPage() {
        setLoading(true);
        const apiResponse = await get("/aboutPage", true);

        if (apiResponse?.status === 200 && apiResponse.body) {
          setValues(
            normalizeAboutPageValues(
              mergeAboutPageValues(
                aboutPageInitialValues,
                stripApiFields(apiResponse.body as AboutPageApiBody),
              ),
            ),
          );
          setHasExistingData(true);
        } else {
          setValues(aboutPageInitialValues);
          setHasExistingData(false);
        }
        setLoading(false);
      }

      fetchAboutPage();
    },
    [setValues],
  );

  useEffect(
    function () {
      async function fetchMedia() {
        let url = `/media?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status === 200) {
          setRecords(apiResponse.body || []);
          setPagination((oldPagination) => ({
            ...oldPagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          }));
        } else {
          setRecords([]);
        }
      }

      fetchMedia();
    },
    [pagination.page, pagination.limit, searchQuery],
  );

  const keywordsString = useMemo(
    () => values.seo.keywords.filter((keyword) => keyword.trim()).join(", "),
    [values.seo.keywords],
  );

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function handleSelectImage(img: MediaRecord) {
    if (!selectedFileFor) return;
    void setFieldValue(selectedFileFor, img.filename);
  }

  function addParagraph() {
    void setFieldValue("storySection.paragraphs", [
      ...values.storySection.paragraphs,
      "",
    ]);
  }

  function removeParagraph(index: number) {
    void setFieldValue(
      "storySection.paragraphs",
      values.storySection.paragraphs.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  }

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const files = event.target.files;

    if (!files || files.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      if (!mimeTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WEBP images are allowed.");
        return;
      }
      formData.append("files", file);
    });

    if (!formData.has("files")) return;

    try {
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(`${API_URL}/media`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const apiData = await apiResponse.json();

      if (apiData.status === 200) {
        setRecords((oldRecords) => [...apiData.body, ...oldRecords]);
        toast.success(apiData.message || "Image uploaded successfully");
      } else {
        toast.error(apiData.message || "Unable to upload image");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to upload image";
      toast.error(message);
    } finally {
      event.target.value = "";
    }
  }

  function renderImagePicker({
    field,
    image,
    label,
    wide = false,
  }: {
    field: string;
    image: string;
    label: string;
    wide?: boolean;
  }) {
    return (
      <div className={wide ? "about-page-image-field is-wide" : "about-page-image-field"}>
        <button
          className="about-page-image-picker"
          data-bs-target="#selectAboutImageFileModal"
          data-bs-toggle="modal"
          onClick={() => setSelectedFileFor(field)}
          type="button"
        >
          <img
            src={image ? addUrlToFile(image) : "/images/select-photo.png"}
            alt={label}
          />
          <span>{label}</span>
        </button>
        {image ? (
          <button
            className="about-page-remove mt-2"
            onClick={() => setFieldValue(field, "")}
            type="button"
          >
            Clear image
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="content-wrapper about-page-admin">
      <div className="about-page-admin__header">
        <div>
          <div className="about-page-admin__header-actions">
            <GoBackButton />
            <span className="about-page-admin__eyebrow">Pages</span>
          </div>
          <h1>About Page</h1>
          <p>Manage the About page banner, association story, vision, mission, and SEO.</p>
        </div>
      </div>

      {loading ? <OverlayLoading /> : null}

      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="about-page-admin__layout">
          <main className="about-page-admin__main">
            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="About" title="Banner Section" />
                <div className="about-page-simple-grid">
                  <div className="about-page-field-grid">
                    <input
                      className="form-control"
                      name="bannerSection.title"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="About"
                      value={values.bannerSection.title}
                    />
                    <input
                      className="form-control"
                      name="bannerSection.highlightedTitle"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="IFMA"
                      value={values.bannerSection.highlightedTitle}
                    />
                  </div>
                  {renderImagePicker({
                    field: "bannerSection.image",
                    image: values.bannerSection.image,
                    label: "Select banner image",
                    wide: true,
                  })}
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="About" title="Intro Highlight" />
                <TextareaBox
                  label="Intro Text"
                  name="introSection.text"
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  placeholder="Short highlighted intro text"
                  value={values.introSection.text}
                  touched={getTouched("introSection.text")}
                  error={getError("introSection.text")}
                />
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <div className="about-page-card-top">
                  <SectionHeading eyebrow="About" title="Story Section" />
                  <button
                    className="about-page-add"
                    onClick={addParagraph}
                    type="button"
                  >
                    + Add Paragraph
                  </button>
                </div>
                <div className="about-page-story-editor">
                  {renderImagePicker({
                    field: "storySection.logoImage",
                    image: values.storySection.logoImage,
                    label: "Select story logo",
                  })}
                  <div className="about-page-field-grid">
                    <TextareaBox
                      label="Main Heading"
                      name="storySection.heading"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Main story heading"
                      value={values.storySection.heading}
                      touched={getTouched("storySection.heading")}
                      error={getError("storySection.heading")}
                    />
                    {values.storySection.paragraphs.map((paragraph, index) => (
                      <div className="about-page-paragraph-row" key={`story-${index}`}>
                        <textarea
                          className="form-control"
                          name={`storySection.paragraphs.${index}`}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder={`Paragraph ${index + 1}`}
                          rows={4}
                          value={paragraph}
                        />
                        <button
                          className="about-page-remove"
                          onClick={() => removeParagraph(index)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="About" title="Vision & Mission" />
                <div className="about-page-vm-grid">
                  <div className="about-page-vm-card">
                    <input
                      className="form-control"
                      name="visionMissionSection.vision.title"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Vision"
                      value={values.visionMissionSection.vision.title}
                    />
                    <textarea
                      className="form-control"
                      name="visionMissionSection.vision.description"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Vision description"
                      rows={5}
                      value={values.visionMissionSection.vision.description}
                    />
                  </div>
                  <div className="about-page-vm-card">
                    <input
                      className="form-control"
                      name="visionMissionSection.mission.title"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Mission"
                      value={values.visionMissionSection.mission.title}
                    />
                    <textarea
                      className="form-control"
                      name="visionMissionSection.mission.description"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Mission description"
                      rows={5}
                      value={values.visionMissionSection.mission.description}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="card about-page-card">
              <div className="card-body">
                <SectionHeading eyebrow="Search" title="SEO" />
                <div className="row">
                  <div className="form-group col-md-6">
                    <label>Meta Title</label>
                    <input
                      className="form-control"
                      name="seo.metaTitle"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Meta title"
                      value={values.seo.metaTitle}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Meta Description"
                      name="seo.metaDescription"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Meta description"
                      value={values.seo.metaDescription}
                      touched={getTouched("seo.metaDescription")}
                      error={getError("seo.metaDescription")}
                    />
                  </div>
                  <div className="form-group col-md-12 mb-0">
                    <TextareaBox
                      label="SEO Keywords"
                      name="seo.keywords"
                      handleBlur={() => {}}
                      handleChange={(event) => {
                        const keywords = event.target.value
                          .split(",")
                          .map((keyword) => keyword.trim())
                          .filter(Boolean);
                        void setFieldValue("seo.keywords", keywords);
                      }}
                      placeholder="keyword one, keyword two"
                      value={keywordsString}
                      touched={getTouched("seo.keywords")}
                      error={getError("seo.keywords")}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="about-page-sticky-actions">
              <div>
                <strong>About Page</strong>
                <span>Save about page content and SEO metadata.</span>
              </div>
              <SubmitButton loading={updating} text="Update Details" />
            </div>
          </main>

          <aside className="about-page-admin__side">
            <div className="card about-page-card">
              <div className="card-body">
                <span className="about-page-admin__eyebrow">Publishing</span>
                <h2>Content checklist</h2>
                <ul className="about-page-check-list">
                  <li><i className="fa fa-check"></i>Banner image and text</li>
                  <li><i className="fa fa-check"></i>Intro highlight</li>
                  <li><i className="fa fa-check"></i>Story content</li>
                  <li><i className="fa fa-check"></i>Vision and mission</li>
                  <li><i className="fa fa-check"></i>SEO metadata</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </form>

      <div
        className="modal fade"
        id="selectAboutImageFileModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="selectAboutImageFileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5 me-2"
                id="selectAboutImageFileModalLabel"
              >
                Select Image
              </h1>
              <input type="file" onChange={handleUploadFile} />
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="about-page-media-toolbar">
                <input
                  className="form-control"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search media"
                  type="search"
                  value={searchQuery}
                />
              </div>
              <div className="row mb-2 gy-2 media-list-section">
                {records.map((item) => (
                  <div className="col-md-2 col-4" key={item._id || item.filename}>
                    <button
                      className="about-page-media-card"
                      data-bs-dismiss="modal"
                      onClick={() => handleSelectImage(item)}
                      type="button"
                    >
                      <img src={addUrlToFile(item.filename)} alt="" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-3">
              <Pagination
                pagination={pagination}
                setPagination={setPagination}
                tableName="table-to-xls"
                csvFileName="images"
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary px-3 py-2"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
