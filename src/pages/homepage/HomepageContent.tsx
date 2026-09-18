import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import {
  GoBackButton,
  OverlayLoading,
  SubmitButton,
  InputBox,
  TextareaBox,
  ImageUploadBox,
} from "../../components";
import { get, post } from "../../utills";
import {
  HomepageValues,
  homepageInitialValues,
  homepageSchema,
} from "../../validationSchemas/homepageSchema";

export function HomepageContent() {
  const [loading, setLoading] = useState(false);

  const formik = useFormik<HomepageValues>({
    initialValues: homepageInitialValues,
    validationSchema: homepageSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          aboutPreviewSection: {
            ...values.aboutPreviewSection,
            paragraphs: values.aboutPreviewSection.paragraphs.map((p) => p.trim()).filter(Boolean),
          },
          seo: {
            ...values.seo,
            keywords: values.seo.keywords.map((k) => k.trim()).filter(Boolean),
          },
        };

        const res = await post("/homepage", payload, true);
        if (res?.status === 200 || res?.isOkay) {
          toast.success("Home page content saved successfully!");
        } else {
          toast.error(res?.message || "Failed to save home page content.");
        }
      } catch {
        toast.error("An error occurred while saving.");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await get("/homepage", true);
        if (res?.status === 200 && res?.body) {
          const body = res.body;
          formik.setValues({
            heroSection: {
              ...homepageInitialValues.heroSection,
              ...(body.heroSection || {}),
            },
            perspectivesSection: {
              ...homepageInitialValues.perspectivesSection,
              ...(body.perspectivesSection || {}),
              items: Array.isArray(body.perspectivesSection?.items)
                ? body.perspectivesSection.items
                : homepageInitialValues.perspectivesSection.items,
            },
            topicsSection: {
              ...homepageInitialValues.topicsSection,
              ...(body.topicsSection || {}),
            },
            aboutPreviewSection: {
              ...homepageInitialValues.aboutPreviewSection,
              ...(body.aboutPreviewSection || {}),
              paragraphs: Array.isArray(body.aboutPreviewSection?.paragraphs) && body.aboutPreviewSection.paragraphs.length > 0
                ? body.aboutPreviewSection.paragraphs
                : homepageInitialValues.aboutPreviewSection.paragraphs,
            },
            essaysPreviewSection: {
              ...homepageInitialValues.essaysPreviewSection,
              ...(body.essaysPreviewSection || {}),
            },
            lecturesSection: {
              ...homepageInitialValues.lecturesSection,
              ...(body.lecturesSection || {}),
              items: Array.isArray(body.lecturesSection?.items)
                ? body.lecturesSection.items
                : homepageInitialValues.lecturesSection.items,
            },
            seo: {
              metaTitle: body.seo?.metaTitle || homepageInitialValues.seo.metaTitle,
              metaDescription: body.seo?.metaDescription || homepageInitialValues.seo.metaDescription,
              keywords: Array.isArray(body.seo?.keywords)
                ? body.seo.keywords
                : homepageInitialValues.seo.keywords,
            },
          });
        }
      } catch {
        // use initial values
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAboutParagraph = () => {
    formik.setFieldValue("aboutPreviewSection.paragraphs", [
      ...(formik.values.aboutPreviewSection.paragraphs || []),
      "",
    ]);
  };

  const removeAboutParagraph = (index: number) => {
    const updated = (formik.values.aboutPreviewSection.paragraphs || []).filter(
      (_, i) => i !== index,
    );
    formik.setFieldValue("aboutPreviewSection.paragraphs", updated);
  };

  return (
    <div className="content-wrapper">
      <OverlayLoading loading={loading} />
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <span className="text-muted text-uppercase font-weight-bold small">Pages</span>
                  <h3 className="card-title mb-1 font-weight-bold">Home Page Management</h3>
                  <p className="card-description mb-0">
                    Customize sections of Colin McLean&apos;s home page: Hero, Perspectives, About, and Lectures.
                  </p>
                </div>
                <GoBackButton />
              </div>

              <form onSubmit={formik.handleSubmit}>
                {/* 1. Hero Section */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 font-weight-bold">1. Hero Section</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Eyebrow Tag"
                          name="heroSection.eyebrow"
                          placeholder="e.g. Investor · Writer · Lecturer"
                          value={formik.values.heroSection.eyebrow}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Hero Title"
                          name="heroSection.title"
                          placeholder="e.g. Thoughts on finance, business and public policy."
                          value={formik.values.heroSection.title}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.heroSection?.title ? (formik.errors.heroSection as any)?.title : undefined}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <TextareaBox
                          label="Hero Summary Description"
                          name="heroSection.summary"
                          placeholder="Short summary paragraph"
                          value={formik.values.heroSection.summary}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <ImageUploadBox
                          label="Hero Background Image"
                          name="heroSection.image"
                          value={formik.values.heroSection.image}
                          error={formik.touched.heroSection?.image ? (formik.errors.heroSection as any)?.image : undefined}
                          touched={!!formik.touched.heroSection?.image}
                          onChange={(filename) => {
                            formik.setFieldValue("heroSection.image", filename);
                          }}
                          onBlur={() => {
                            formik.setFieldTouched("heroSection.image", true);
                          }}
                          hint="1920 x 1080 px recommended"
                          description="Upload landscape image for the homepage hero background. Paste image also works."
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <InputBox
                          label="Primary Button Text"
                          name="heroSection.primaryButtonText"
                          value={formik.values.heroSection.primaryButtonText}
                          onChange={formik.handleChange}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <InputBox
                          label="Primary Button Link"
                          name="heroSection.primaryButtonLink"
                          value={formik.values.heroSection.primaryButtonLink}
                          onChange={formik.handleChange}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <InputBox
                          label="Secondary Button Text"
                          name="heroSection.secondaryButtonText"
                          value={formik.values.heroSection.secondaryButtonText}
                          onChange={formik.handleChange}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <InputBox
                          label="Secondary Button Link"
                          name="heroSection.secondaryButtonLink"
                          value={formik.values.heroSection.secondaryButtonLink}
                          onChange={formik.handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Perspectives Section */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 font-weight-bold">2. Perspectives Section</h5>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <InputBox
                          label="Section Eyebrow"
                          name="perspectivesSection.eyebrow"
                          value={formik.values.perspectivesSection.eyebrow}
                          onChange={formik.handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputBox
                          label="Section Title"
                          name="perspectivesSection.title"
                          value={formik.values.perspectivesSection.title}
                          onChange={formik.handleChange}
                        />
                      </div>
                      <div className="col-12 mt-3">
                        <TextareaBox
                          label="Section Description"
                          name="perspectivesSection.description"
                          value={formik.values.perspectivesSection.description}
                          onChange={formik.handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. About Section Preview */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 font-weight-bold">3. About Section Preview</h5>
                    <span className="badge badge-light border text-muted">Side-by-side layout</span>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Left Column: Portrait Image */}
                      <div className="col-lg-5 col-md-12 mb-3">
                        <ImageUploadBox
                          label="Portrait Image"
                          name="aboutPreviewSection.image"
                          value={formik.values.aboutPreviewSection.image}
                          error={formik.touched.aboutPreviewSection?.image ? (formik.errors.aboutPreviewSection as any)?.image : undefined}
                          touched={!!formik.touched.aboutPreviewSection?.image}
                          onChange={(filename) => {
                            formik.setFieldValue("aboutPreviewSection.image", filename);
                          }}
                          onBlur={() => {
                            formik.setFieldTouched("aboutPreviewSection.image", true);
                          }}
                          hint="Portrait ratio recommended"
                          description="Portrait image of Colin McLean for the About preview section. Paste image also works."
                          minHeight={360}
                        />
                      </div>

                      {/* Right Column: Content Fields */}
                      <div className="col-lg-7 col-md-12">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <InputBox
                              label="Heading"
                              name="aboutPreviewSection.heading"
                              value={formik.values.aboutPreviewSection.heading}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <InputBox
                              label="Role / Subtitle"
                              name="aboutPreviewSection.role"
                              value={formik.values.aboutPreviewSection.role}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-12 mb-3">
                            <InputBox
                              label="Credential Tag"
                              name="aboutPreviewSection.credential"
                              value={formik.values.aboutPreviewSection.credential}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <InputBox
                              label="Button Text"
                              name="aboutPreviewSection.buttonText"
                              value={formik.values.aboutPreviewSection.buttonText}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <InputBox
                              label="Button Link"
                              name="aboutPreviewSection.buttonLink"
                              value={formik.values.aboutPreviewSection.buttonLink}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>

                          {/* Paragraphs */}
                          <div className="col-12 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <label className="font-weight-bold mb-0 text-dark">About Paragraphs</label>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={addAboutParagraph}
                              >
                                + Add Paragraph
                              </button>
                            </div>
                            {formik.values.aboutPreviewSection.paragraphs?.map((para, idx) => (
                              <div key={idx} className="mb-2 p-2 border rounded bg-light position-relative">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <small className="text-muted font-weight-bold">Paragraph {idx + 1}</small>
                                  {formik.values.aboutPreviewSection.paragraphs.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-xs btn-outline-danger py-0 px-2"
                                      onClick={() => removeAboutParagraph(idx)}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <textarea
                                  className="form-control"
                                  rows={2}
                                  value={para}
                                  onChange={(e) =>
                                    formik.setFieldValue(`aboutPreviewSection.paragraphs[${idx}]`, e.target.value)
                                  }
                                  placeholder="Enter paragraph text..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Blogs Section */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 font-weight-bold">4. Blogs Section</h5>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <InputBox
                          label="Section Eyebrow"
                          name="essaysPreviewSection.eyebrow"
                          value={formik.values.essaysPreviewSection?.eyebrow || ""}
                          onChange={formik.handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <InputBox
                          label="Section Title"
                          name="essaysPreviewSection.title"
                          value={formik.values.essaysPreviewSection?.title || ""}
                          onChange={formik.handleChange}
                        />
                      </div>
                      <div className="col-12 mt-3">
                        <TextareaBox
                          label="Section Description"
                          name="essaysPreviewSection.description"
                          value={formik.values.essaysPreviewSection?.description || ""}
                          onChange={formik.handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. SEO */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 font-weight-bold">5. SEO Metadata</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <InputBox
                        label="Meta Title"
                        name="seo.metaTitle"
                        value={formik.values.seo.metaTitle}
                        onChange={formik.handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <TextareaBox
                        label="Meta Description"
                        name="seo.metaDescription"
                        value={formik.values.seo.metaDescription}
                        onChange={formik.handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <InputBox
                        label="Keywords (comma separated)"
                        name="keywords"
                        value={formik.values.seo.keywords.join(", ")}
                        onChange={(e: any) => {
                          const list = e.target.value.split(",").map((k: string) => k.trim());
                          formik.setFieldValue("seo.keywords", list);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <SubmitButton loading={loading} text="Save Home Page" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
