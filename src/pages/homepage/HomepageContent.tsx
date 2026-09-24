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
  const [keywordsInput, setKeywordsInput] = useState(
    homepageInitialValues.seo.keywords.join(", ")
  );

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
            paragraphs: (values.aboutPreviewSection?.paragraphs || [])
              .map((p) => p.trim())
              .filter(Boolean),
          },
          seo: {
            ...values.seo,
            keywords: (values.seo?.keywords || []).map((k) => k.trim()).filter(Boolean),
          },
        };

        const res = await post("/homepage", payload, true);
        if (res?.status === 200) {
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
          const loadedKeywords = Array.isArray(body.seo?.keywords)
            ? body.seo.keywords
            : homepageInitialValues.seo.keywords;

          setKeywordsInput(loadedKeywords.join(", "));

          formik.setValues({
            heroSection: {
              ...homepageInitialValues.heroSection,
              ...(body.heroSection || {}),
            },
            perspectivesSection: {
              ...homepageInitialValues.perspectivesSection,
              ...(body.perspectivesSection || {}),
              items:
                Array.isArray(body.perspectivesSection?.items) &&
                body.perspectivesSection.items.length > 0
                  ? body.perspectivesSection.items
                  : homepageInitialValues.perspectivesSection.items,
            },
            topicsSection: {
              ...homepageInitialValues.topicsSection,
              ...(body.topicsSection || {}),
              items:
                Array.isArray(body.topicsSection?.items) &&
                body.topicsSection.items.length > 0
                  ? body.topicsSection.items
                  : homepageInitialValues.topicsSection.items,
            },
            aboutPreviewSection: {
              ...homepageInitialValues.aboutPreviewSection,
              ...(body.aboutPreviewSection || {}),
              paragraphs:
                Array.isArray(body.aboutPreviewSection?.paragraphs) &&
                body.aboutPreviewSection.paragraphs.length > 0
                  ? body.aboutPreviewSection.paragraphs
                  : homepageInitialValues.aboutPreviewSection.paragraphs,
            },
            essaysPreviewSection: {
              ...homepageInitialValues.essaysPreviewSection,
              ...(body.essaysPreviewSection || {}),
              items:
                Array.isArray(body.essaysPreviewSection?.items) &&
                body.essaysPreviewSection.items.length > 0
                  ? body.essaysPreviewSection.items
                  : homepageInitialValues.essaysPreviewSection.items,
            },
            lecturesSection: {
              ...homepageInitialValues.lecturesSection,
              ...(body.lecturesSection || {}),
              items:
                Array.isArray(body.lecturesSection?.items) &&
                body.lecturesSection.items.length > 0
                  ? body.lecturesSection.items
                  : homepageInitialValues.lecturesSection.items,
            },
            seo: {
              metaTitle: body.seo?.metaTitle || homepageInitialValues.seo.metaTitle,
              metaDescription:
                body.seo?.metaDescription || homepageInitialValues.seo.metaDescription,
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

  const addAboutParagraph = () => {
    formik.setFieldValue("aboutPreviewSection.paragraphs", [
      ...(formik.values.aboutPreviewSection?.paragraphs || []),
      "",
    ]);
  };

  const removeAboutParagraph = (index: number) => {
    const updated = (formik.values.aboutPreviewSection?.paragraphs || []).filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("aboutPreviewSection.paragraphs", updated);
  };

  const addPerspectiveItem = () => {
    formik.setFieldValue("perspectivesSection.items", [
      ...(formik.values.perspectivesSection?.items || []),
      { title: "", category: "", href: "" },
    ]);
  };

  const removePerspectiveItem = (index: number) => {
    const updated = (formik.values.perspectivesSection?.items || []).filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("perspectivesSection.items", updated);
  };

  const addTopicItem = () => {
    const currentItems = formik.values.topicsSection?.items || [];
    const nextNumber =
      currentItems.length + 1 < 10
        ? `0${currentItems.length + 1}`
        : `${currentItems.length + 1}`;
    formik.setFieldValue("topicsSection.items", [
      ...currentItems,
      { number: nextNumber, title: "", description: "", image: "", href: "" },
    ]);
  };

  const removeTopicItem = (index: number) => {
    const updated = (formik.values.topicsSection?.items || []).filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("topicsSection.items", updated);
  };

  const addEssayItem = () => {
    formik.setFieldValue("essaysPreviewSection.items", [
      ...(formik.values.essaysPreviewSection?.items || []),
      {
        title: "",
        paragraph: "",
        category: "",
        date: "",
        readingTime: "",
        image: "",
        href: "",
      },
    ]);
  };

  const removeEssayItem = (index: number) => {
    const updated = (formik.values.essaysPreviewSection?.items || []).filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("essaysPreviewSection.items", updated);
  };

  const addLectureItem = () => {
    const currentItems = formik.values.lecturesSection?.items || [];
    const nextNumber =
      currentItems.length + 1 < 10
        ? `0${currentItems.length + 1}`
        : `${currentItems.length + 1}`;
    formik.setFieldValue("lecturesSection.items", [
      ...currentItems,
      { number: nextNumber, title: "", description: "", image: "", href: "" },
    ]);
  };

  const removeLectureItem = (index: number) => {
    const updated = (formik.values.lecturesSection?.items || []).filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("lecturesSection.items", updated);
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
                  <h3 className="card-title mb-1 font-weight-bold">Home Page Management</h3>
                  <p className="card-description mb-0">
                    Customize sections of Colin McLean&apos;s home page: Hero, Perspectives, Topics, About, Blogs, and Lectures.
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
                          value={formik.values.heroSection?.eyebrow || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Hero Title"
                          name="heroSection.title"
                          placeholder="e.g. Thoughts on finance, business and public policy."
                          value={formik.values.heroSection?.title || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={
                            formik.touched.heroSection?.title
                              ? (formik.errors.heroSection as any)?.title
                              : undefined
                          }
                          touched={!!formik.touched.heroSection?.title}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <TextareaBox
                          label="Hero Summary Description"
                          name="heroSection.summary"
                          placeholder="Short summary paragraph"
                          value={formik.values.heroSection?.summary || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          rows={3}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <ImageUploadBox
                          label="Hero Background Image"
                          name="heroSection.image"
                          value={formik.values.heroSection?.image || ""}
                          error={
                            formik.touched.heroSection?.image
                              ? (formik.errors.heroSection as any)?.image
                              : undefined
                          }
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
                          value={formik.values.heroSection?.primaryButtonText || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <InputBox
                          label="Primary Button Link"
                          name="heroSection.primaryButtonLink"
                          value={formik.values.heroSection?.primaryButtonLink || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <InputBox
                          label="Secondary Button Text"
                          name="heroSection.secondaryButtonText"
                          value={formik.values.heroSection?.secondaryButtonText || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <InputBox
                          label="Secondary Button Link"
                          name="heroSection.secondaryButtonLink"
                          value={formik.values.heroSection?.secondaryButtonLink || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Perspectives Section */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 font-weight-bold">2. Perspectives Section</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary py-1 px-3"
                      onClick={addPerspectiveItem}
                    >
                      + Add Perspective Card
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Section Eyebrow"
                          name="perspectivesSection.eyebrow"
                          value={formik.values.perspectivesSection?.eyebrow || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Section Title"
                          name="perspectivesSection.title"
                          value={formik.values.perspectivesSection?.title || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <TextareaBox
                          label="Section Description"
                          name="perspectivesSection.description"
                          value={formik.values.perspectivesSection?.description || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Perspective Items */}
                    <label className="font-weight-bold text-dark mb-2">Perspective Cards</label>
                    {(formik.values.perspectivesSection?.items || []).map((item, idx) => (
                      <div key={idx} className="p-3 mb-3 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-secondary">Card {idx + 1}</strong>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            onClick={() => removePerspectiveItem(idx)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <InputBox
                              label="Quote Title"
                              name={`perspectivesSection.items[${idx}].title`}
                              placeholder="e.g. Finance is failing Gen Z"
                              value={item.title || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-md-3 mb-2">
                            <InputBox
                              label="Category"
                              name={`perspectivesSection.items[${idx}].category`}
                              placeholder="e.g. Business"
                              value={item.category || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-md-3 mb-2">
                            <InputBox
                              label="Link"
                              name={`perspectivesSection.items[${idx}].href`}
                              placeholder="e.g. /writing/finance-is-failing-gen-z"
                              value={item.href || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Topics Section */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 font-weight-bold">3. Topics Section</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary py-1 px-3"
                      onClick={addTopicItem}
                    >
                      + Add Topic Card
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Section Eyebrow"
                          name="topicsSection.eyebrow"
                          placeholder="e.g. Focus areas"
                          value={formik.values.topicsSection?.eyebrow || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Section Title"
                          name="topicsSection.title"
                          placeholder="e.g. Key Topics"
                          value={formik.values.topicsSection?.title || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <TextareaBox
                          label="Section Description"
                          name="topicsSection.description"
                          placeholder="Explore core subjects across markets, business, public policy and society."
                          value={formik.values.topicsSection?.description || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Topic Items */}
                    <label className="font-weight-bold text-dark mb-2">Topic Cards</label>
                    {(formik.values.topicsSection?.items || []).map((topic, idx) => (
                      <div key={idx} className="p-3 mb-3 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-secondary">Topic {topic.number || idx + 1}: {topic.title || "Untitled"}</strong>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger py-1"
                            onClick={() => removeTopicItem(idx)}
                          >
                            X
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="row">
                              <div className="col-md-4 mb-2">
                                <InputBox
                                  label="Number"
                                  name={`topicsSection.items[${idx}].number`}
                                  placeholder="01"
                                  value={topic.number || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                />
                              </div>
                              <div className="col-md-8 mb-2">
                                <InputBox
                                  label="Title"
                                  name={`topicsSection.items[${idx}].title`}
                                  placeholder="e.g. Investment & Markets"
                                  value={topic.title || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                />
                              </div>
                              <div className="col-12 mb-2">
                                <InputBox
                                  label="Link"
                                  name={`topicsSection.items[${idx}].href`}
                                  placeholder="e.g. /writing/economics/pensions-are-not-fit-for-purpose-reform-is-needed"
                                  value={topic.href || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                />
                              </div>
                              <div className="col-12 mb-2">
                                <TextareaBox
                                  label="Description"
                                  name={`topicsSection.items[${idx}].description`}
                                  placeholder="Short description of topic"
                                  value={topic.description || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <ImageUploadBox
                              label={`Topic ${topic.number || idx + 1} Image`}
                              name={`topicsSection.items[${idx}].image`}
                              value={topic.image || ""}
                              onChange={(filename) => {
                                formik.setFieldValue(`topicsSection.items[${idx}].image`, filename);
                              }}
                              hint="Landscape ratio recommended"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. About Section Preview */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 font-weight-bold">4. About Section Preview</h5>
                    <span className="badge badge-light border text-muted">Side-by-side layout</span>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* Left Column: Portrait Image */}
                      <div className="col-lg-5 col-md-12 mb-3">
                        <ImageUploadBox
                          label="Portrait Image"
                          name="aboutPreviewSection.image"
                          value={formik.values.aboutPreviewSection?.image || ""}
                          error={
                            formik.touched.aboutPreviewSection?.image
                              ? (formik.errors.aboutPreviewSection as any)?.image
                              : undefined
                          }
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
                              value={formik.values.aboutPreviewSection?.heading || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <InputBox
                              label="Role / Subtitle"
                              name="aboutPreviewSection.role"
                              value={formik.values.aboutPreviewSection?.role || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-12 mb-3">
                            <InputBox
                              label="Credential Tag"
                              name="aboutPreviewSection.credential"
                              value={formik.values.aboutPreviewSection?.credential || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <InputBox
                              label="Button Text"
                              name="aboutPreviewSection.buttonText"
                              value={formik.values.aboutPreviewSection?.buttonText || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <InputBox
                              label="Button Link"
                              name="aboutPreviewSection.buttonLink"
                              value={formik.values.aboutPreviewSection?.buttonLink || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
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
                                className="btn btn-sm btn-outline-primary py-1 px-3"
                                onClick={addAboutParagraph}
                              >
                                + Add Paragraph
                              </button>
                            </div>
                            {(formik.values.aboutPreviewSection?.paragraphs || []).map((para, idx) => (
                              <div key={idx} className="mb-2 p-2 border rounded bg-light position-relative">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <small className="text-muted font-weight-bold">Paragraph {idx + 1}</small>
                                  {(formik.values.aboutPreviewSection?.paragraphs || []).length > 1 && (
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

                {/* 5. Blogs Section */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 font-weight-bold">5. Blogs Section</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary py-1 px-3"
                      onClick={addEssayItem}
                    >
                      + Add Blog/Essay Card
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Section Eyebrow"
                          name="essaysPreviewSection.eyebrow"
                          value={formik.values.essaysPreviewSection?.eyebrow || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Section Title"
                          name="essaysPreviewSection.title"
                          value={formik.values.essaysPreviewSection?.title || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <TextareaBox
                          label="Section Description"
                          name="essaysPreviewSection.description"
                          value={formik.values.essaysPreviewSection?.description || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Essay Items */}
                    <label className="font-weight-bold text-dark mb-2">Blog / Essay Cards</label>
                    {(formik.values.essaysPreviewSection?.items || []).map((essay, idx) => (
                      <div key={idx} className="p-3 mb-3 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-secondary">Card {idx + 1}: {essay.title || "Untitled"}</strong>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger py-1"
                            onClick={() => removeEssayItem(idx)}
                          >
                            X
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="row">
                              <div className="col-12 mb-2">
                                <InputBox
                                  label="Title"
                                  name={`essaysPreviewSection.items[${idx}].title`}
                                  placeholder="e.g. Behavioural biases that influence decisions"
                                  value={essay.title || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                />
                              </div>
                              <div className="col-md-6 mb-2">
                                <InputBox
                                  label="Category"
                                  name={`essaysPreviewSection.items[${idx}].category`}
                                  placeholder="e.g. Economics"
                                  value={essay.category || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                />
                              </div>
                              <div className="col-md-6 mb-2">
                                <InputBox
                                  label="Reading Time"
                                  name={`essaysPreviewSection.items[${idx}].readingTime`}
                                  placeholder="e.g. 7 min read"
                                  value={essay.readingTime || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                />
                              </div>
                              <div className="col-md-6 mb-2">
                                <InputBox
                                  label="Date"
                                  name={`essaysPreviewSection.items[${idx}].date`}
                                  placeholder="e.g. 16 May 2025"
                                  value={essay.date || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                />
                              </div>
                              <div className="col-md-6 mb-2">
                                <InputBox
                                  label="Link"
                                  name={`essaysPreviewSection.items[${idx}].href`}
                                  placeholder="e.g. /writing/economics/behavioural-finance-the-risks-of-mixing-emotion-and-investments"
                                  value={essay.href || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                />
                              </div>
                              <div className="col-12 mb-2">
                                <TextareaBox
                                  label="Excerpt / Paragraph"
                                  name={`essaysPreviewSection.items[${idx}].paragraph`}
                                  placeholder="Understanding the psychology behind smarter choices."
                                  value={essay.paragraph || ""}
                                  handleChange={formik.handleChange}
                                  handleBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <ImageUploadBox
                              label={`Card ${idx + 1} Image`}
                              name={`essaysPreviewSection.items[${idx}].image`}
                              value={essay.image || ""}
                              onChange={(filename) => {
                                formik.setFieldValue(`essaysPreviewSection.items[${idx}].image`, filename);
                              }}
                              hint="Landscape ratio recommended"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Lectures Section */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 font-weight-bold">6. Lectures Section</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary py-1 px-3"
                      onClick={addLectureItem}
                    >
                      + Add Lecture Card
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Section Eyebrow"
                          name="lecturesSection.eyebrow"
                          placeholder="e.g. Lectures & speaking"
                          value={formik.values.lecturesSection?.eyebrow || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <InputBox
                          label="Section Title"
                          name="lecturesSection.title"
                          placeholder="e.g. Lectures"
                          value={formik.values.lecturesSection?.title || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <TextareaBox
                          label="Section Description"
                          name="lecturesSection.description"
                          placeholder="Ideas brought into practice through talks and presentations..."
                          value={formik.values.lecturesSection?.description || ""}
                          handleChange={formik.handleChange}
                          handleBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Lecture Items */}
                    <label className="font-weight-bold text-dark mb-2">Lecture Cards</label>
                    {(formik.values.lecturesSection?.items || []).map((lecture, idx) => (
                      <div key={idx} className="p-3 mb-3 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-secondary">Lecture {lecture.number || idx + 1}</strong>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger py-1"
                            onClick={() => removeLectureItem(idx)}
                          >
                            X
                          </button>
                        </div>
                        <div className="row">
                          <div className="col-6">
                        <div className="row">
                          <div className="col-12 mb-2">
                            <InputBox
                              label="Number"
                              name={`lecturesSection.items[${idx}].number`}
                              placeholder="01"
                              value={lecture.number || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-12 mb-2">
                            <InputBox
                              label="Title"
                              name={`lecturesSection.items[${idx}].title`}
                              placeholder="e.g. Behavioural Finance in Practice"
                              value={lecture.title || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-12 mb-2">
                            <InputBox
                              label="Link"
                              name={`lecturesSection.items[${idx}].href`}
                              placeholder="e.g. /lectures/behavioural-finance-in-practice"
                              value={lecture.href || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                          </div>
                          <div className="col-12 mb-2">
                            <TextareaBox
                              label="Description"
                              name={`lecturesSection.items[${idx}].description`}
                              placeholder="Short description of lecture"
                              value={lecture.description || ""}
                              handleChange={formik.handleChange}
                              handleBlur={formik.handleBlur}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              rows={2}
                            />
                          </div>   
                        </div>
                          </div>
                          <div className="col-6">
                            <ImageUploadBox
                              label={`Lecture ${lecture.number || idx + 1} Image`}
                              name={`lecturesSection.items[${idx}].image`}
                              value={lecture.image || ""}
                              onChange={(filename) => {
                                formik.setFieldValue(`lecturesSection.items[${idx}].image`, filename);
                              }}
                              hint="Landscape ratio recommended"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. SEO */}
                <div className="card mb-4 border shadow-none">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 font-weight-bold">7. SEO Metadata</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <InputBox
                        label="Meta Title"
                        name="seo.metaTitle"
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
                  <SubmitButton loading={loading} text="Save Home Page" className="py-2 px-4" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
