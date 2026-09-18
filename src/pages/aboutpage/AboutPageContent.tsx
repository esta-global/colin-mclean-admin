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
  AboutPageValues,
  aboutPageInitialValues,
  aboutPageSchema,
} from "../../validationSchemas/aboutPageSchema";

export function AboutPageContent() {
  const [loading, setLoading] = useState(false);

  const formik = useFormik<AboutPageValues>({
    initialValues: aboutPageInitialValues,
    validationSchema: aboutPageSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          biography: values.biography.map((p) => p.trim()).filter(Boolean),
          seo: {
            ...values.seo,
            keywords: values.seo.keywords.map((k) => k.trim()).filter(Boolean),
          },
        };

        const res = await post("/aboutPage", payload, true);
        if (res?.status === 200 || res?.isOkay) {
          toast.success("About page content saved successfully!");
        } else {
          toast.error(res?.message || "Failed to save about page content.");
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
        const res = await get("/aboutPage", true);
        if (res?.status === 200 && res?.body) {
          formik.setValues({
            title: res.body.title || aboutPageInitialValues.title,
            role: res.body.role || aboutPageInitialValues.role,
            portraitImage: res.body.portraitImage || aboutPageInitialValues.portraitImage,
            biography: Array.isArray(res.body.biography) && res.body.biography.length > 0
              ? res.body.biography
              : aboutPageInitialValues.biography,
            seo: {
              metaTitle: res.body.seo?.metaTitle || aboutPageInitialValues.seo.metaTitle,
              metaDescription: res.body.seo?.metaDescription || aboutPageInitialValues.seo.metaDescription,
              keywords: Array.isArray(res.body.seo?.keywords)
                ? res.body.seo.keywords
                : aboutPageInitialValues.seo.keywords,
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

  const addBiographyParagraph = () => {
    formik.setFieldValue("biography", [...formik.values.biography, ""]);
  };

  const removeBiographyParagraph = (index: number) => {
    const updated = formik.values.biography.filter((_, i) => i !== index);
    formik.setFieldValue("biography", updated);
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
                  <h3 className="card-title mb-1 font-weight-bold">About Page Management</h3>
                  <p className="card-description mb-0">
                    Manage Colin McLean&apos;s title, role, biography paragraphs, and portrait.
                  </p>
                </div>
                <GoBackButton />
              </div>

              <form onSubmit={formik.handleSubmit}>
                {/* Profile Details */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 font-weight-bold">Profile Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Full Name / Title"
                          name="title"
                          placeholder="e.g. Colin McLean"
                          value={formik.values.title}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.title ? formik.errors.title : undefined}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Role / Subtitle"
                          name="role"
                          placeholder="e.g. Investor. Writer. Guest Lecturer."
                          value={formik.values.role}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.role ? formik.errors.role : undefined}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <ImageUploadBox
                          label="Portrait Image"
                          name="portraitImage"
                          value={formik.values.portraitImage}
                          onChange={(filename) => {
                            formik.setFieldValue("portraitImage", filename);
                          }}
                          onBlur={() => {
                            formik.setFieldTouched("portraitImage", true);
                          }}
                          error={formik.touched.portraitImage ? formik.errors.portraitImage : undefined}
                          touched={formik.touched.portraitImage}
                          hint="Portrait ratio recommended"
                          description="Upload Colin McLean's portrait image for the About page. Paste image also works."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biography Paragraphs */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 font-weight-bold">Biography Paragraphs</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={addBiographyParagraph}
                    >
                      + Add Paragraph
                    </button>
                  </div>
                  <div className="card-body">
                    {formik.values.biography.map((para, idx) => (
                      <div key={idx} className="mb-3 p-3 border rounded bg-light position-relative">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="font-weight-bold mb-0">Paragraph {idx + 1}</label>
                          {formik.values.biography.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeBiographyParagraph(idx)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <textarea
                          className="form-control"
                          rows={4}
                          name={`biography[${idx}]`}
                          value={para}
                          onChange={(e) => formik.setFieldValue(`biography[${idx}]`, e.target.value)}
                          placeholder="Enter biography paragraph..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 font-weight-bold">SEO Metadata</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <InputBox
                        label="Meta Title"
                        name="seo.metaTitle"
                        placeholder="About Page Meta Title"
                        value={formik.values.seo.metaTitle}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    <div className="mb-3">
                      <TextareaBox
                        label="Meta Description"
                        name="seo.metaDescription"
                        placeholder="About Page Meta Description"
                        value={formik.values.seo.metaDescription}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    <div className="mb-3">
                      <InputBox
                        label="Keywords (comma separated)"
                        name="keywords"
                        placeholder="Colin McLean, Investor, Finance, Scotland"
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
                  <SubmitButton loading={loading} text="Save About Page" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
