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
  const [keywordsInput, setKeywordsInput] = useState(
    aboutPageInitialValues.seo.keywords.join(", ")
  );

  const formik = useFormik<AboutPageValues>({
    initialValues: aboutPageInitialValues,
    validationSchema: aboutPageSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          title: values.title,
          role: values.role,
          portraitImage: values.portraitImage,
          biography: (values.biography || []).map((p) => p.trim()).filter(Boolean),
          seo: {
            metaTitle: values.seo?.metaTitle || "",
            metaDescription: values.seo?.metaDescription || "",
            keywords: (values.seo?.keywords || []).map((k) => k.trim()).filter(Boolean),
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
          const body = res.body;
          const loadedKeywords = Array.isArray(body.seo?.keywords)
            ? body.seo.keywords
            : aboutPageInitialValues.seo.keywords;

          setKeywordsInput(loadedKeywords.join(", "));

          formik.setValues({
            title: body.title || aboutPageInitialValues.title,
            role: body.role || aboutPageInitialValues.role,
            portraitImage: body.portraitImage || aboutPageInitialValues.portraitImage,
            biography:
              Array.isArray(body.biography) && body.biography.length > 0
                ? body.biography
                : aboutPageInitialValues.biography,
            seo: {
              metaTitle: body.seo?.metaTitle || aboutPageInitialValues.seo.metaTitle,
              metaDescription: body.seo?.metaDescription || aboutPageInitialValues.seo.metaDescription,
              keywords: loadedKeywords,
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
    formik.setFieldValue("biography", [...(formik.values.biography || []), ""]);
  };

  const removeBiographyParagraph = (index: number) => {
    const updated = (formik.values.biography || []).filter((_, i) => i !== index);
    formik.setFieldValue("biography", updated);
  };

  return (
    <div className="content-wrapper homepage-management-wrapper">
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
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.title ? formik.errors.title : undefined}
                          touched={formik.touched.title}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Role / Subtitle"
                          name="role"
                          placeholder="e.g. Investor. Writer. Guest Lecturer."
                          value={formik.values.role}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.role ? formik.errors.role : undefined}
                          touched={formik.touched.role}
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
                      className="btn btn-sm btn-primary py-1 px-3"
                      onClick={addBiographyParagraph}
                    >
                      + Add Paragraph
                    </button>
                  </div>
                  <div className="card-body">
                    {(formik.values.biography || []).map((para, idx) => (
                      <div key={idx} className="mb-3 p-3 border rounded bg-light position-relative">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="font-weight-bold mb-0">Paragraph {idx + 1}</label>
                          {(formik.values.biography || []).length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger py-1 px-2"
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
                        value={formik.values.seo?.metaTitle || ""}
                        handleChange={formik.handleChange}
                        handleBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    <div className="mb-3">
                      <TextareaBox
                        label="Meta Description"
                        name="seo.metaDescription"
                        placeholder="About Page Meta Description"
                        value={formik.values.seo?.metaDescription || ""}
                        handleChange={formik.handleChange}
                        handleBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={3}
                      />
                    </div>
                    <div className="mb-3">
                      <InputBox
                        label="Keywords (comma separated)"
                        name="keywords"
                        placeholder="Colin McLean, Investor, Finance, Scotland"
                        value={keywordsInput}
                        handleChange={(e: any) => {
                          const val = e.target.value;
                          setKeywordsInput(val);
                          const list = val.split(",").map((k: string) => k.trim()).filter(Boolean);
                          formik.setFieldValue("seo.keywords", list);
                        }}
                        onChange={(e: any) => {
                          const val = e.target.value;
                          setKeywordsInput(val);
                          const list = val.split(",").map((k: string) => k.trim()).filter(Boolean);
                          formik.setFieldValue("seo.keywords", list);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <SubmitButton loading={loading} text="Save About Page" className="py-2 px-4" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
