import {
  CustomSelect,
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  postSchema,
  PostValues,
  postInitialValues,
  ContentType,
  BlogSection,
} from "../../validationSchemas/postSchema";
import { useEffect, useState } from "react";
import { get, post, put, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const contentFormLabels: Record<ContentType, {
  singular: string;
  eyebrow: string;
  description: string;
  library: string;
}> = {
  blog: {
    singular: "Blog",
    eyebrow: "Content",
    description: "Update blog publishing details, cover media, body content, and SEO metadata.",
    library: "blog library",
  },
  essay: {
    singular: "Essay",
    eyebrow: "Essays",
    description: "Update essay publishing details, cover media, body content, and SEO metadata.",
    library: "essay library",
  },
};

export function EditPost({ defaultType = "blog" }: { defaultType?: ContentType }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const labels = contentFormLabels[defaultType];
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState([]);
  const [contentEditor, setContentEditor] = useState<any>(null);
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setValues,
    setFieldError,
    setFieldTouched,
    setFieldValue,
  } = useFormik({
    onSubmit: async function (
      values: PostValues,
      helpers: FormikHelpers<PostValues>,
    ) {
      setLoading(true);
      const { blogSections, ...payloadValues } = values;

      const rawContent = blogSections.length
        ? sectionsToHtml(blogSections)
        : normalizeImageLayoutHtml(values.content);

      // Clean encoded entities so HTML tags are stored as actual HTML
      let cleanContent = rawContent || "";
      if (/&lt;\/?[a-z][a-z0-9]*\b[^&gt;]*&gt;/i.test(cleanContent)) {
        cleanContent = cleanContent
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/<p>\s*<p>/gi, "<p>")
          .replace(/<\/p>\s*<\/p>/gi, "</p>");
      }

      // Strip any HTML tags from excerpt so only plain text is saved
      const cleanExcerpt = values.excerpt
        ? values.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
        : "";

      const newValue = {
        ...payloadValues,
        excerpt: cleanExcerpt,
        content: cleanContent,
        date: values.date || "",
        schemaData: blogSections.length
          ? JSON.stringify({ blogSections })
          : values.schemaData || "",
        category: values.category?.value,
      };

      const apiResponse = await put(`/blogs/${id}`, newValue);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: postInitialValues,
    validationSchema: postSchema,
  });

  function normalizeImageLayoutHtml(content: string) {
    if (!content || typeof DOMParser === "undefined") return content;

    const layoutClasses = [
      "image-style-align-left",
      "image-style-align-right",
      "image-style-side",
      "image-style-half",
      "image-style-third",
    ];
    const doc = new DOMParser().parseFromString(content, "text/html");

    doc.querySelectorAll("figure.image, img").forEach((element) => {
      const hasLayoutClass = layoutClasses.some((className) =>
        element.classList.contains(className),
      );
      if (!hasLayoutClass) return;

      element.removeAttribute("style");
      element.removeAttribute("width");
      element.removeAttribute("height");
      element.querySelectorAll?.("img").forEach((image) => {
        image.removeAttribute("style");
        image.removeAttribute("width");
        image.removeAttribute("height");
      });
    });

    return doc.body.innerHTML;
  }

  function parseBlogSections(schemaData?: string): BlogSection[] {
    try {
      const parsed = schemaData ? JSON.parse(schemaData) : {};
      return Array.isArray(parsed.blogSections) ? parsed.blogSections : [];
    } catch {
      return [];
    }
  }

  function createBlogSection(type: BlogSection["type"]): BlogSection {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      heading: "",
      text: "",
      image: "",
      imageTitle: "",
      columns: type === "imageGrid" ? "2" : "2",
      images: type === "imageGrid"
        ? [
            { image: "", title: "" },
            { image: "", title: "" },
          ]
        : [],
    };
  }

  function updateBlogSection(index: number, patch: Partial<BlogSection>) {
    setFieldValue(
      "blogSections",
      values.blogSections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    );
  }

  function updateSectionImage(sectionIndex: number, imageIndex: number, patch: { image?: string; title?: string }) {
    const nextSections = values.blogSections.map((section, index) => {
      if (index !== sectionIndex) return section;
      const images = section.images.map((image, itemIndex) =>
        itemIndex === imageIndex ? { ...image, ...patch } : image,
      );
      return { ...section, images };
    });
    setFieldValue("blogSections", nextSections);
  }

  function addBlogSection(type: BlogSection["type"]) {
    setFieldValue("blogSections", [...values.blogSections, createBlogSection(type)]);
  }

  function addImageGridSection(columns: "2" | "3") {
    const section = createBlogSection("imageGrid");
    const count = Number(columns);
    setFieldValue("blogSections", [
      ...values.blogSections,
      {
        ...section,
        columns,
        images: Array.from({ length: count }, () => ({ image: "", title: "" })),
      },
    ]);
  }

  function removeBlogSection(index: number) {
    setFieldValue(
      "blogSections",
      values.blogSections.filter((_, sectionIndex) => sectionIndex !== index),
    );
  }

  function moveBlogSection(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= values.blogSections.length) return;
    const nextSections = [...values.blogSections];
    [nextSections[index], nextSections[nextIndex]] = [nextSections[nextIndex], nextSections[index]];
    setFieldValue("blogSections", nextSections);
  }

  function syncGridColumns(sectionIndex: number, columns: "2" | "3") {
    const count = Number(columns);
    const section = values.blogSections[sectionIndex];
    const images = [...section.images];
    while (images.length < count) images.push({ image: "", title: "" });
    updateBlogSection(sectionIndex, { columns, images: images.slice(0, count) });
  }

  function sectionTypeLabel(type: BlogSection["type"]) {
    if (type === "imageTextLeft") return "Image Left + Text";
    if (type === "imageTextRight") return "Text Left + Image";
    if (type === "fullImage") return "Full Image";
    if (type === "imageGrid") return "Image Grid";
    if (type === "text") return "Rich Text";
    return "Heading";
  }

  function sectionsToHtml(sections: BlogSection[]) {
    return sections
      .map((section) => {
        if (section.type === "heading") return section.heading ? `<h2>${section.heading}</h2>` : "";
        if (section.type === "text") return section.text || "";
        if (section.type === "fullImage" && section.image) {
          return `<figure><img src="${addUrlToFile(section.image)}" alt="${section.imageTitle || ""}" />${section.imageTitle ? `<figcaption>${section.imageTitle}</figcaption>` : ""}</figure>`;
        }
        if ((section.type === "imageTextLeft" || section.type === "imageTextRight") && (section.image || section.text)) {
          const image = section.image
            ? `<figure><img src="${addUrlToFile(section.image)}" alt="${section.imageTitle || ""}" />${section.imageTitle ? `<figcaption>${section.imageTitle}</figcaption>` : ""}</figure>`
            : "";
          const text = section.text ? `<div>${section.text}</div>` : "";
          return `<div class="${section.type}">${section.type === "imageTextLeft" ? `${image}${text}` : `${text}${image}`}</div>`;
        }
        if (section.type === "imageGrid") {
          const items = section.images
            .filter((item) => item.image)
            .map((item) => `<figure><img src="${addUrlToFile(item.image)}" alt="${item.title || ""}" />${item.title ? `<figcaption>${item.title}</figcaption>` : ""}</figure>`)
            .join("");
          return items ? `<div>${items}</div>` : "";
        }
        return "";
      })
      .filter(Boolean)
      .join("");
  }

  function formatToInputDate(dateStr?: string): string {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  }

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        let url = `/blogs/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          apiData.status = `${apiData.status}`;
          apiData.type = apiData.type || defaultType;
          apiData.featured = Boolean(apiData.featured);
          apiData.date = formatToInputDate(apiData.date || apiData.createdAt);

          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;
          delete apiData.__v;

          if (apiData.category) {
            apiData.category = {
              label: apiData?.category?.name,
              value: apiData.category?._id,
            };
          }
          apiData.blogSections = parseBlogSections(apiData.schemaData);

          setValues(apiData);
        } else {
          toast.error(apiResponse?.message);
        }
      }

      if (id) getData(id);
    },
    [id],
  );

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/blogCategories?limit=0", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setCategories(modifiedValue);
      }
    }
    getData();
  }, []);

  // handleUploadFile
  async function handleUploadFile(
    event: React.ChangeEvent<HTMLInputElement>,
    source?: "COVER_IMAGE" | "LISTING_IMAGE",
  ) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      if (source == "COVER_IMAGE") {
        setFieldTouched("coverImage", true);
        setFieldError("coverImage", "Image is required field");
        toast.error("Image is required field");
        return;
      } else {
        setFieldTouched("listingImage", true);
        return;
      }
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      if (source == "COVER_IMAGE") {
        setFieldTouched("coverImage", true);
        setFieldError("coverImage", "Must select the valid coverImage file");
        toast.error("Must select the valid coverImage file");
        return;
      } else {
        setFieldTouched("listingImage", true);
        setFieldError("listingImage", "Must select the valid coverImage file");
        toast.error("Must select the valid coverImage file");
        return;
      }
    }

    const formData = new FormData();

    formData.append("files", file);

    try {
      let url = `${API_URL}/fileUploads`;
      const apiResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const apiData = await apiResponse.json();

      if (apiData.status == 200) {
        if (source == "COVER_IMAGE") {
          setFieldTouched("coverImage", false);
          setFieldError("coverImage", "");
          setFieldValue("coverImage", apiData.body[0].filename);
        } else {
          setFieldTouched("listingImage", false);
          setFieldError("listingImage", "");
          setFieldValue("listingImage", apiData.body[0].filename);
        }
      } else {
        if (source == "COVER_IMAGE") {
          setFieldTouched("coverImage", false);
          setFieldError("coverImage", apiData.message);
        } else {
          setFieldTouched("listingImage", false);
          setFieldError("listingImage", apiData.message);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  async function uploadSectionImageFile(file: File) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!mimeTypes.includes(file.type)) {
      toast.error("Must select the valid image file");
      return "";
    }

    const formData = new FormData();
    formData.append("files", file);

    try {
      const apiResponse = await fetch(`${API_URL}/fileUploads`, {
        method: "POST",
        body: formData,
      });
      const apiData = await apiResponse.json();
      if (apiData.status == 200) return apiData.body[0].filename as string;
      toast.error(apiData.message || "Unable to upload image");
      return "";
    } catch (error: any) {
      toast.error(error?.message);
      return "";
    }
  }

  function getPastedImageFile(clipboardData?: DataTransfer | null) {
    return Array.from(clipboardData?.files || []).find((file) =>
      file.type.startsWith("image/"),
    );
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    source?: "COVER_IMAGE" | "LISTING_IMAGE",
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        if (source == "COVER_IMAGE") {
          setFieldError("coverImage", "");
          setFieldValue("coverImage", "");
        } else {
          setFieldError("listingImage", "");
          setFieldValue("listingImage", "");
        }
      } else {
        if (source == "COVER_IMAGE") {
          setFieldError("coverImage", "");
          setFieldValue("coverImage", "");
        } else {
          setFieldError("listingImage", "");
          setFieldValue("listingImage", "");
        }
        toast.error(apiResponse?.message);
      }

      if (source == "COVER_IMAGE") {
        const fileInput = document.getElementById(
          `imageFile`,
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
          setFieldValue("coverImage", "");
        }
      } else {
        const fileInput = document.getElementById(
          `listingImageFile`,
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = ""; // Clear the input field
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  const customUploadAdapter = (loader: any) => {
    return {
      upload: async () => {
        const file = await loader.file;
        const data = new FormData();
        data.append("files", file);

        try {
          let url = `${API_URL}/fileUploads`;
          const apiResponse = await fetch(url, {
            method: "POST",
            body: data,
          });

          const result = await apiResponse.json();

          return {
            default: addUrlToFile(result.body[0].filename),
          };
        } catch (error: any) {
          toast.error(`"Image upload failed:", ${error.message}`);
        }
      },
    };
  };

  function uploadPlugin(editor: any) {
    editor.plugins.get("FileRepository").createUploadAdapter = (
      loader: any,
    ) => {
      return customUploadAdapter(loader);
    };
  }

  function applyImageLayout(
    layout: "block" | "alignLeft" | "alignRight" | "side" | "half" | "third",
    withCaption = false,
  ) {
    if (!contentEditor) {
      toast.info("Editor is loading. Please try again.");
      return;
    }

    const imageStyleCommand = contentEditor.commands.get("imageStyle");
    if (!imageStyleCommand?.isEnabled) {
      toast.info("Pehle editor me image par click karke select karein.");
      return;
    }

    contentEditor.execute("imageStyle", { value: layout });
    const captionCommand = contentEditor.commands.get("toggleImageCaption");
    if (withCaption && captionCommand?.isEnabled && !captionCommand.value) {
      contentEditor.execute("toggleImageCaption");
    }
    contentEditor.editing.view.focus();
    setFieldValue("content", contentEditor.getData());
  }

  useEffect(
    function () {
      document.body.classList.toggle("post-editor-expanded-open", isEditorExpanded);
      return () => document.body.classList.remove("post-editor-expanded-open");
    },
    [isEditorExpanded],
  );

  return (
    <div className="content-wrapper post-form-page">
      <div className="post-form-header">
        <div>
          <div className="post-form-header__actions">
            <GoBackButton />
            <span className="post-page-eyebrow">{labels.eyebrow}</span>
          </div>
          <h1>Edit {labels.singular}</h1>
          <p>{labels.description}</p>
        </div>
        <div className="post-form-header__meta">
          <span className="post-form-pill">Existing post</span>
          <span className="post-form-note">Changes update live data</span>
        </div>
      </div>

      <form className="forms-sample post-form" onSubmit={handleSubmit}>
        <div className="post-form-layout">
          <main className="post-form-main">
            <div className="card post-form-card">
              <div className="card-body">
                <div className="post-form-section-heading">
                  <div>
                    <span>Post details</span>
                    <h2>Content setup</h2>
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label={`${labels.singular} Title`}
                      name="title"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter title"
                      value={values.title}
                      required={true}
                      touched={touched.title}
                      error={errors.title}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label={`${labels.singular} Slug`}
                      name="slug"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter slug"
                      value={values.slug}
                      required={true}
                      touched={touched.slug}
                      error={errors.slug}
                    />
                  </div>
                  {/* Select Category */}
                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Select Category"
                      placeholder="Select Category"
                      name="category"
                      required={true}
                      options={categories}
                      value={values.category}
                      error={errors.category}
                      touched={touched.category}
                      isMulti={false}
                      handleChange={(value) => {
                        setFieldValue("category", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("category", true);
                      }}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Date (Publish Date)"
                      name="date"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="date"
                      placeholder="Select publish date"
                      value={values.date}
                      touched={touched.date}
                      error={errors.date}
                    />
                  </div>

                  <div className="form-group col-md-12">
                    <InputBox
                      label="Excerpt"
                      name="excerpt"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter description"
                      value={values.excerpt}
                      touched={touched.excerpt}
                      error={errors.excerpt}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label className="post-form-field-label">Status</label>
                    <div className="post-form-status-options">
                      <label className="post-form-status-option" title="Visible on the website">
                        <input
                          type="radio"
                          name="status"
                          id="true"
                          value={"true"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "true"}
                        />
                        <span>
                          <strong>Publish</strong>
                        </span>
                      </label>
                      <label className="post-form-status-option" title="Keep hidden for now">
                        <input
                          type="radio"
                          name="status"
                          id="false"
                          value={"false"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "false"}
                        />
                        <span>
                          <strong>Draft</strong>
                        </span>
                      </label>
                    </div>
                    {errors.status && touched.status ? (
                      <p className="custom-form-error text-danger">
                        {errors.status}
                      </p>
                    ) : null}
                  </div>
                  <div className="form-group col-md-6">
                    <label className="post-form-field-label">Featured</label>
                    <label className="post-form-status-option" title="Show in featured content sections">
                      <input
                        checked={Boolean(values.featured)}
                        name="featured"
                        onChange={(event) => setFieldValue("featured", event.target.checked)}
                        type="checkbox"
                      />
                      <span>
                        <strong>Feature this {labels.singular.toLowerCase()}</strong>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="card post-form-card">
              <div className="card-body">
                <div className="post-form-section-heading">
                  <div>
                    <span>Structured content</span>
                    <h2>Blog sections</h2>
                  </div>
                </div>
                <div className="blog-section-builder">
                  <div className="blog-section-builder__actions">
                    <button type="button" onClick={() => addBlogSection("heading")}>Add Heading</button>
                    <button type="button" onClick={() => addBlogSection("text")}>Add Rich Text</button>
                    <button type="button" onClick={() => addBlogSection("fullImage")}>Add Full Image</button>
                    <button type="button" onClick={() => addBlogSection("imageTextLeft")}>Image Left + Text</button>
                    <button type="button" onClick={() => addBlogSection("imageTextRight")}>Text Left + Image</button>
                    <button type="button" onClick={() => addImageGridSection("2")}>Add 2 Images</button>
                    <button type="button" onClick={() => addImageGridSection("3")}>Add 3 Images</button>
                  </div>

                  {values.blogSections.length ? (
                    values.blogSections.map((section, sectionIndex) => (
                      <div className="blog-section-card" key={section.id}>
                        <div className="blog-section-card__head">
                          <strong>{sectionIndex + 1}. {sectionTypeLabel(section.type)}</strong>
                          <div>
                            <button type="button" onClick={() => moveBlogSection(sectionIndex, -1)}>Up</button>
                            <button type="button" onClick={() => moveBlogSection(sectionIndex, 1)}>Down</button>
                            <button type="button" onClick={() => removeBlogSection(sectionIndex)}>Remove</button>
                          </div>
                        </div>

                        {section.type === "heading" ? (
                          <input className="form-control" onChange={(event) => updateBlogSection(sectionIndex, { heading: event.target.value })} placeholder="Section heading" value={section.heading} />
                        ) : null}

                        {section.type === "text" ? (
                          <div className="blog-section-rich-text">
                            <CKEditor
                              editor={ClassicEditor as any}
                              config={{ extraPlugins: [uploadPlugin] }}
                              data={section.text}
                              onChange={(__, editor) => {
                                updateBlogSection(sectionIndex, { text: editor.getData() });
                              }}
                              id={`blog-section-text-${section.id}`}
                            />
                          </div>
                        ) : null}

                        {section.type === "text" ? (
                          <small className="blog-section-help">Use this as many times as needed for paragraphs, bullets, links, and inline formatting.</small>
                        ) : null}

                        {section.type === "fullImage" ? (
                          <div
                            className="blog-section-image-row"
                            onPaste={async (event) => {
                              const pastedImage = getPastedImageFile(event.clipboardData);
                              if (!pastedImage) return;
                              event.preventDefault();
                              const filename = await uploadSectionImageFile(pastedImage);
                              if (filename) updateBlogSection(sectionIndex, { image: filename });
                            }}
                          >
                            <label>
                              <span>Image</span>
                              <input accept="image/jpeg,image/png,image/webp" className="form-control" onChange={async (event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                const filename = await uploadSectionImageFile(file);
                                if (filename) updateBlogSection(sectionIndex, { image: filename });
                                event.target.value = "";
                              }} type="file" />
                            </label>
                            {section.image ? <img src={addUrlToFile(section.image)} alt="" /> : null}
                            <input className="form-control" onChange={(event) => updateBlogSection(sectionIndex, { imageTitle: event.target.value })} placeholder="Image title/caption" value={section.imageTitle} />
                          </div>
                        ) : null}

                        {section.type === "imageTextLeft" || section.type === "imageTextRight" ? (
                          <div className={`blog-section-split-editor ${section.type === "imageTextRight" ? "is-image-right" : "is-image-left"}`}>
                            <div
                              className="blog-section-split-editor__image"
                              onPaste={async (event) => {
                                const pastedImage = getPastedImageFile(event.clipboardData);
                                if (!pastedImage) return;
                                event.preventDefault();
                                const filename = await uploadSectionImageFile(pastedImage);
                                if (filename) updateBlogSection(sectionIndex, { image: filename });
                              }}
                              tabIndex={0}
                            >
                              {section.image ? <img src={addUrlToFile(section.image)} alt="" /> : <span>No image</span>}
                              <input accept="image/jpeg,image/png,image/webp" className="form-control" onChange={async (event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                const filename = await uploadSectionImageFile(file);
                                if (filename) updateBlogSection(sectionIndex, { image: filename });
                                event.target.value = "";
                              }} type="file" />
                              <input className="form-control" onChange={(event) => updateBlogSection(sectionIndex, { imageTitle: event.target.value })} placeholder="Image title/caption" value={section.imageTitle} />
                              <small>Upload or paste image here</small>
                            </div>
                            <div className="blog-section-rich-text">
                              <CKEditor
                                editor={ClassicEditor as any}
                                config={{ extraPlugins: [uploadPlugin] }}
                                data={section.text}
                                onChange={(__, editor) => {
                                  updateBlogSection(sectionIndex, { text: editor.getData() });
                                }}
                                id={`blog-section-split-text-${section.id}`}
                              />
                            </div>
                          </div>
                        ) : null}

                        {section.type === "imageGrid" ? (
                          <div className={`blog-section-grid-editor is-${section.columns === "3" ? "three" : "two"}`}>
                            <select className="form-control" onChange={(event) => syncGridColumns(sectionIndex, event.target.value as "2" | "3")} value={section.columns}>
                              <option value="2">2 images</option>
                              <option value="3">3 images</option>
                            </select>
                            <div className="blog-section-grid-editor__items">
                              {section.images.map((item, imageIndex) => (
                                <div
                                  className="blog-section-grid-editor__item"
                                  key={`${section.id}-${imageIndex}`}
                                  onPaste={async (event) => {
                                    const pastedImage = getPastedImageFile(event.clipboardData);
                                    if (!pastedImage) return;
                                    event.preventDefault();
                                    const filename = await uploadSectionImageFile(pastedImage);
                                    if (filename) updateSectionImage(sectionIndex, imageIndex, { image: filename });
                                  }}
                                >
                                  {item.image ? <img src={addUrlToFile(item.image)} alt="" /> : <span>No image</span>}
                                  <input accept="image/jpeg,image/png,image/webp" className="form-control" onChange={async (event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    const filename = await uploadSectionImageFile(file);
                                    if (filename) updateSectionImage(sectionIndex, imageIndex, { image: filename });
                                    event.target.value = "";
                                  }} type="file" />
                                  <input className="form-control" onChange={(event) => updateSectionImage(sectionIndex, imageIndex, { title: event.target.value })} placeholder="Image title" value={item.title} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="blog-section-empty">Add sections here for stable frontend layout. Rich text above remains as fallback.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card post-form-card">
              <div className="card-body">
                <div className="post-form-section-heading">
                  <div>
                    <span>Media</span>
                    <h2>Cover image</h2>
                  </div>
                  <span className="post-form-chip">1200 x 628 px</span>
                </div>
                <div className={values.coverImage ? "post-cover-grid has-cover-image" : "post-cover-grid"}>
                  <label htmlFor="imageFile" className="post-cover-uploader">
                    <span className="post-cover-uploader__icon">
                      <i className="fa fa-cloud-arrow-up"></i>
                    </span>
                    <strong>Upload cover image</strong>
                    <p>JPG, PNG, or WEBP landscape image.</p>
                    <span className="post-cover-uploader__button">Choose file</span>
                      <input
                        type="file"
                        className="d-none"
                        id="imageFile"
                        onChange={(evt) => {
                          handleUploadFile(evt, "COVER_IMAGE");
                        }}
                      />
                  </label>
                  <div className="post-cover-preview">
                    {values.coverImage ? (
                      <>
                        <Link
                          to={addUrlToFile(values.coverImage)}
                          target="_blank"
                          className="post-cover-preview__image"
                        >
                          <img src={addUrlToFile(values.coverImage)} alt="Cover" />
                        </Link>
                        <button
                          type="button"
                          className="post-cover-remove"
                          aria-label="Remove cover image"
                          onClick={(evt) => {
                            handleDeleteFile(
                              evt,
                              values.coverImage,
                              "COVER_IMAGE",
                            );
                          }}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </>
                    ) : (
                      <div className="post-cover-empty">
                        <i className="fa fa-image"></i>
                        <span>No cover selected</span>
                      </div>
                    )}
                    {touched.coverImage && errors.coverImage ? (
                      <p className="custom-form-error text-danger">
                        {errors.coverImage}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="card post-form-card">
              <div className="card-body">
                <div className="post-form-section-heading">
                  <div>
                    <span>Editor</span>
                    <h2>{labels.singular} content</h2>
                  </div>
                </div>

                <div
                  className={
                    isEditorExpanded
                      ? "post-editor-shell post-editor-shell--expanded"
                      : "post-editor-shell"
                  }
                  id="blog-editor"
                >
                    <div className="post-image-layout-panel">
                      <div>
                        <strong>Image Layout</strong>
                        <span>Select images, then use 50% for two columns or 33% for three columns.</span>
                      </div>
                      <div className="post-image-layout-actions">
                        <button type="button" onClick={() => applyImageLayout("block")}>Full</button>
                        <button type="button" onClick={() => applyImageLayout("alignLeft")}>Image Left + Text</button>
                        <button type="button" onClick={() => applyImageLayout("alignRight")}>Image Right + Text</button>
                        <button type="button" onClick={() => applyImageLayout("side")}>Text Wrap</button>
                        <button type="button" onClick={() => applyImageLayout("half")}>50%</button>
                        <button type="button" onClick={() => applyImageLayout("third")}>33%</button>
                        <button type="button" onClick={() => applyImageLayout("half", true)}>2 Img + Text</button>
                        <button type="button" onClick={() => applyImageLayout("third", true)}>3 Img + Text</button>
                        <button
                          className="post-editor-expand-button"
                          type="button"
                          onClick={() => setIsEditorExpanded((expanded) => !expanded)}
                        >
                          <i className={isEditorExpanded ? "fa fa-compress" : "fa fa-expand"}></i>
                          {isEditorExpanded ? "Close" : "Expand"}
                        </button>
                      </div>
                    </div>
                    <CKEditor
                      editor={ClassicEditor as any}
                      config={{
                        extraPlugins: [uploadPlugin],
                        image: {
                          styles: {
                            options: [
                              "block",
                              "side",
                              {
                                name: "alignLeft",
                                title: "Left",
                                icon: "left",
                                className: "image-style-align-left",
                                modelElements: ["imageBlock", "imageInline"],
                              },
                              {
                                name: "alignRight",
                                title: "Right",
                                icon: "right",
                                className: "image-style-align-right",
                                modelElements: ["imageBlock", "imageInline"],
                              },
                              {
                                name: "half",
                                title: "50%",
                                icon: "left",
                                className: "image-style-half",
                                modelElements: ["imageBlock", "imageInline"],
                              },
                              {
                                name: "third",
                                title: "33%",
                                icon: "right",
                                className: "image-style-third",
                                modelElements: ["imageBlock", "imageInline"],
                              },
                            ],
                          },
                          toolbar: [
                            "imageStyle:block",
                            "imageStyle:alignLeft",
                            "imageStyle:alignRight",
                            "imageStyle:side",
                            "imageStyle:half",
                            "imageStyle:third",
                            "|",
                            "toggleImageCaption",
                            "imageTextAlternative",
                          ],
                        },
                      }}
                      data={values?.content}
                      onReady={(editor) => {
                        setContentEditor(editor);
                      }}
                      onChange={(__, editor) => {
                        const data = editor.getData();
                        setFieldValue("content", data);
                      }}
                      onBlur={() => {
                        setFieldTouched("content", true);
                      }}
                      onFocus={() => {}}
                      id={"content"}
                    />
                </div>
                    {errors.content && touched.content ? (
                      <p className="custom-form-error text-danger">
                        {errors.content}
                      </p>
                    ) : null}
              </div>
            </div>

            <div className="card post-form-card">
              <div className="card-body">
                <div className="post-form-section-heading">
                  <div>
                    <span>SEO</span>
                    <h2>Meta details</h2>
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-md-12">
                    <InputBox
                      label="Meta Title"
                      name="metaTitle"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter meta title"
                      value={values.metaTitle}
                      touched={touched.metaTitle}
                      error={errors.metaTitle}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Meta Description"
                      name="metaDescription"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Enter meta description"
                      value={values.metaDescription}
                      touched={touched.metaDescription}
                      error={errors.metaDescription}
                    />
                  </div>

                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Meta Keywords"
                      name="metaKeywords"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Enter meta keywords (comma saparated values)"
                      value={values.metaKeywords}
                      touched={touched.metaKeywords}
                      error={errors.metaKeywords}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="post-form-sticky-actions">
              <div>
                <strong>Edit {labels.singular}</strong>
                <span>Update this item in your {labels.library}.</span>
              </div>
              <SubmitButton loading={loading} text={`Update ${labels.singular}`} />
            </div>
          </main>

          <aside className="post-form-side">
            <div className="card post-form-card post-form-preview-card">
              <div className="card-body">
                <span className="post-form-side-kicker">Preview</span>
                <div className="post-form-preview-photo">
                  {values.coverImage ? (
                    <img src={addUrlToFile(values.coverImage)} alt="" />
                  ) : (
                    <i className="fa fa-image"></i>
                  )}
                </div>
                <h2>{values.title || `${labels.singular} title`}</h2>
                <p>{values.excerpt || `${labels.singular} excerpt preview will appear here.`}</p>
                <div className="post-form-preview-meta">
                  <span>{values.category?.label || "Category"}</span>
                  {values.date ? <span>{values.date}</span> : null}
                  <strong>{values.status == "true" ? "Published" : "Draft"}</strong>
                </div>
              </div>
            </div>

            <div className="card post-form-card">
              <div className="card-body">
                <span className="post-form-side-kicker">Checklist</span>
                <ul className="post-form-check-list">
                  <li>
                    <i className="fa fa-check"></i>
                    Title and slug
                  </li>
                  <li>
                    <i className="fa fa-check"></i>
                    Category selection
                  </li>
                  <li>
                    <i className="fa fa-check"></i>
                    Cover image
                  </li>
                  <li>
                    <i className="fa fa-check"></i>
                    SEO metadata
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
