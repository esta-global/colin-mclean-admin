import { FormikHelpers, getIn, useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { GoBackButton, OverlayLoading, SubmitButton, TextareaBox } from "../../components";
import { get, post, put } from "../../utills";
import {
  BlogPageValues,
  blogPageInitialValues,
  blogPageSchema,
  createEmptyBlogGuideItem,
} from "../../validationSchemas/blogPageSchema";

type BlogPageApiBody = Partial<BlogPageValues> & {
  _id?: string;
  __v?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeBlogPageValues<T>(initial: T, incoming: unknown): T {
  if (Array.isArray(initial)) {
    return (Array.isArray(incoming) ? incoming : initial) as T;
  }

  if (isPlainObject(initial)) {
    const source = isPlainObject(incoming) ? incoming : {};
    const result: Record<string, unknown> = {};

    Object.keys(initial).forEach((key) => {
      result[key] = mergeBlogPageValues(initial[key], source[key]);
    });

    return result as T;
  }

  return (incoming === undefined || incoming === null ? initial : incoming) as T;
}

function stripApiFields(data: BlogPageApiBody): Partial<BlogPageValues> {
  const payload = { ...data };

  delete payload._id;
  delete payload.__v;
  delete payload.isDeleted;
  delete payload.createdAt;
  delete payload.updatedAt;

  return payload;
}

function normalizeBlogPageValues(values: BlogPageValues): BlogPageValues {
  return {
    ...values,
    heroSection: {
      ...values.heroSection,
      guideItems: values.heroSection.guideItems.map((item, index) => ({
        ...item,
        number: Number(item.number) || index + 1,
      })),
    },
  };
}

function EditableText({
  className,
  label,
  multiline = false,
  name,
  placeholder,
  setFieldValue,
  value,
}: {
  className: string;
  label: string;
  multiline?: boolean;
  name: string;
  placeholder: string;
  setFieldValue: (field: string, value: unknown) => void;
  value: string;
}) {
  return (
    <div
      aria-label={label}
      className={`${className} ${value ? "" : "is-empty"}`}
      contentEditable
      data-placeholder={placeholder}
      onBlur={(event) => setFieldValue(name, event.currentTarget.textContent?.trim() || "")}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      role="textbox"
      suppressContentEditableWarning
    >
      {value}
    </div>
  );
}

export function BlogPageContent() {
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);

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
    initialValues: blogPageInitialValues,
    validationSchema: blogPageSchema,
    onSubmit: async function (
      formValues: BlogPageValues,
      helpers: FormikHelpers<BlogPageValues>,
    ) {
      setUpdating(true);
      const payload = normalizeBlogPageValues(formValues);
      const apiResponse = hasExistingData
        ? await put("/blogPage", payload)
        : await post("/blogPage", payload, true);

      if (apiResponse?.status === 200) {
        toast.success(apiResponse?.message || "Blog page saved successfully");
        const body = apiResponse.body ? stripApiFields(apiResponse.body as BlogPageApiBody) : payload;
        setValues(normalizeBlogPageValues(mergeBlogPageValues(blogPageInitialValues, body)));
        setHasExistingData(true);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message || "Unable to save blog page content");
      }
      setUpdating(false);
    },
  });

  useEffect(
    function () {
      async function fetchBlogPage() {
        setLoading(true);
        const apiResponse = await get("/blogPage", true);

        if (apiResponse?.status === 200 && apiResponse.body) {
          setValues(
            normalizeBlogPageValues(
              mergeBlogPageValues(
                blogPageInitialValues,
                stripApiFields(apiResponse.body as BlogPageApiBody),
              ),
            ),
          );
          setHasExistingData(true);
        } else {
          setValues(blogPageInitialValues);
          setHasExistingData(false);
        }
        setLoading(false);
      }

      fetchBlogPage();
    },
    [setValues],
  );

  function getError(name: string): string | undefined {
    const error = getIn(errors, name);
    return typeof error === "string" ? error : undefined;
  }

  function getTouched(name: string): boolean {
    return Boolean(getIn(touched, name));
  }

  function getNumberValue(name: string): number {
    const value = getIn(values, name);
    return typeof value === "number" ? value : Number(value) || 0;
  }

  function updateGuideItem(index: number, field: "number" | "title" | "description", value: unknown) {
    void setFieldValue(`heroSection.guideItems.${index}.${field}`, value);
  }

  function addGuideItem() {
    const nextItem = {
      ...createEmptyBlogGuideItem(),
      number: values.heroSection.guideItems.length + 1,
    };
    void setFieldValue("heroSection.guideItems", [
      ...values.heroSection.guideItems,
      nextItem,
    ]);
  }

  function removeGuideItem(index: number) {
    const updated = values.heroSection.guideItems
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item, itemIndex) => ({ ...item, number: itemIndex + 1 }));
    void setFieldValue("heroSection.guideItems", updated);
  }

  const keywordsString = values.seo.keywords.filter((keyword) => keyword.trim()).join(", ");

  return (
    <div className="content-wrapper blog-page-admin">
      <div className="blog-page-admin__header">
        <div>
          <div className="blog-page-admin__header-actions">
            <GoBackButton />
            <span className="blog-page-admin__eyebrow">Pages</span>
          </div>
          <h1>Blog Page</h1>
          <p>Manage the blog landing hero, guide cards, calls to action, and search metadata.</p>
        </div>
        <div className="blog-page-admin__meta">
          <span>{hasExistingData ? "Existing page" : "New page"}</span>
          <strong>{hasExistingData ? "PUT on save" : "POST on save"}</strong>
        </div>
      </div>

      {loading ? <OverlayLoading /> : null}

      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="blog-page-admin__layout">
          <main className="blog-page-admin__main">
            <section className="card blog-page-card">
              <div className="card-body">
                <div className="blog-page-card__heading">
                  <span>Homepage</span>
                  <h2>Blog hero</h2>
                </div>

                <div className="blog-page-hero-editor">
                  <div className="blog-page-hero-editor__copy">
                    <EditableText
                      className="blog-page-hero-eyebrow"
                      label="Eyebrow"
                      name="heroSection.eyebrow"
                      placeholder="SIMPLESELLERS BLOG"
                      setFieldValue={setFieldValue}
                      value={values.heroSection.eyebrow}
                    />
                    <EditableText
                      className="blog-page-hero-heading"
                      label="Heading"
                      multiline
                      name="heroSection.heading"
                      placeholder="Practical guides for faster, cleaner marketplace listings"
                      setFieldValue={setFieldValue}
                      value={values.heroSection.heading}
                    />
                    <EditableText
                      className="blog-page-hero-description"
                      label="Description"
                      multiline
                      name="heroSection.description"
                      placeholder="Learn how to photograph products, write searchable listings, price with confidence, and cross-list without creating the same work twice."
                      setFieldValue={setFieldValue}
                      value={values.heroSection.description}
                    />

                    <div className="blog-page-hero-buttons">
                      <div className="blog-page-button-edit">
                        <input
                          aria-label="Primary button text"
                          className="blog-page-hero-button blog-page-hero-button--primary"
                          name="heroSection.buttons.primary.text"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Generate a Listing"
                          value={values.heroSection.buttons.primary.text}
                        />
                        <input
                          aria-label="Primary button URL"
                          className="blog-page-url-input"
                          name="heroSection.buttons.primary.url"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Primary button URL"
                          value={values.heroSection.buttons.primary.url}
                        />
                      </div>
                      <div className="blog-page-button-edit">
                        <input
                          aria-label="Secondary button text"
                          className="blog-page-hero-button blog-page-hero-button--secondary"
                          name="heroSection.buttons.secondary.text"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Browse Guides"
                          value={values.heroSection.buttons.secondary.text}
                        />
                        <input
                          aria-label="Secondary button URL"
                          className="blog-page-url-input"
                          name="heroSection.buttons.secondary.url"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Secondary button URL"
                          value={values.heroSection.buttons.secondary.url}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="blog-page-guide-list">
                    {values.heroSection.guideItems.map((item, index) => (
                      <article className="blog-page-guide-card" key={`${index}-${item.number}`}>
                        <input
                          aria-label={`Guide ${index + 1} number`}
                          className="blog-page-guide-number"
                          min="1"
                          onBlur={handleBlur}
                          onChange={(event) =>
                            updateGuideItem(index, "number", Number(event.target.value) || index + 1)
                          }
                          type="number"
                          value={getNumberValue(`heroSection.guideItems.${index}.number`)}
                        />
                        <div className="blog-page-guide-copy">
                          <EditableText
                            className="blog-page-guide-title"
                            label={`Guide ${index + 1} title`}
                            name={`heroSection.guideItems.${index}.title`}
                            placeholder="Guide title"
                            setFieldValue={setFieldValue}
                            value={item.title}
                          />
                          <EditableText
                            className="blog-page-guide-description"
                            label={`Guide ${index + 1} description`}
                            multiline
                            name={`heroSection.guideItems.${index}.description`}
                            placeholder="Guide description"
                            setFieldValue={setFieldValue}
                            value={item.description}
                          />
                        </div>
                        <button
                          aria-label={`Remove guide ${index + 1}`}
                          className="blog-page-guide-remove"
                          onClick={() => removeGuideItem(index)}
                          type="button"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </article>
                    ))}

                    <button className="blog-page-guide-add" onClick={addGuideItem} type="button">
                      + Add Guide
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card blog-page-card">
              <div className="card-body">
                <div className="blog-page-card__heading">
                  <span>SEO</span>
                  <h2>Meta details</h2>
                </div>
                <div className="row">
                  <div className="form-group col-md-6">
                    <label htmlFor="seo.metaTitle">Meta Title</label>
                    <input
                      className="form-control"
                      id="seo.metaTitle"
                      name="seo.metaTitle"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Enter meta title"
                      value={values.seo.metaTitle}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Meta Description"
                      name="seo.metaDescription"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Enter meta description"
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
                      placeholder="Enter keywords separated by commas"
                      value={keywordsString}
                      touched={getTouched("seo.keywords")}
                      error={getError("seo.keywords")}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="blog-page-sticky-actions">
              <div>
                <strong>Blog Page</strong>
                <span>Save hero content, guide items, CTA links, and SEO metadata.</span>
              </div>
              <SubmitButton loading={updating} text="Update Details" />
            </div>
          </main>

          <aside className="blog-page-admin__side">
            <div className="card blog-page-card">
              <div className="card-body">
                <span className="blog-page-admin__eyebrow">Publishing</span>
                <h2>Content checklist</h2>
                <ul className="blog-page-check-list">
                  <li>
                    <i className="fa fa-check"></i>
                    Hero copy ready
                  </li>
                  <li>
                    <i className="fa fa-check"></i>
                    Guide cards updated
                  </li>
                  <li>
                    <i className="fa fa-check"></i>
                    CTA links checked
                  </li>
                  <li>
                    <i className="fa fa-check"></i>
                    SEO metadata added
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
