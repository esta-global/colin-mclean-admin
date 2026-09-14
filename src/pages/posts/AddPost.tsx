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
} from "../../validationSchemas/postSchema";

import { useEffect, useState } from "react";
import {
  generateSlug,
  get,
  post,
  remove,
  validateTextNumber,
} from "../../utills";

import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const contentFormLabels: Record<ContentType, {
  plural: string;
  singular: string;
  eyebrow: string;
  description: string;
  addPath: string;
  library: string;
}> = {
  blog: {
    plural: "Blogs",
    singular: "Blog",
    eyebrow: "Content",
    description: "Create a blog post with publishing details, cover media, and SEO metadata.",
    addPath: "/posts",
    library: "blog library",
  },
  trivia: {
    plural: "Trivia",
    singular: "Trivia",
    eyebrow: "Content",
    description: "Create a trivia story with publishing details, cover media, and SEO metadata.",
    addPath: "/trivia-posts",
    library: "trivia library",
  },
};

export function AddPost({ defaultType = "blog" }: { defaultType?: ContentType }) {
  const navigate = useNavigate();
  const labels = contentFormLabels[defaultType];
  const [loading, setLoading] = useState<boolean>(false);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contentEditor, setContentEditor] = useState<any>(null);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
  } = useFormik({
    onSubmit: async function (
      values: PostValues,
      helpers: FormikHelpers<PostValues>,
    ) {
      setLoading(true);

      const newValue = {
        ...values,
        category: values.category?.value,
        author: values.author?.value,
      };

      const apiResponse = await post("/blogs", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: { ...postInitialValues, type: defaultType },
    validationSchema: postSchema,
  });

  function handleTitleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    let value = validateTextNumber(evt.target.value);
    let name = evt.target.name;

    setFieldValue(name, value);

    let slug = generateSlug(value);
    setFieldValue("slug", slug);
  }

  async function uploadPostImageFile(
    file: File,
    source?: "COVER_IMAGE" | "LISTING_IMAGE",
  ) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    if (!mimeTypes.includes(file.type)) {
      if (source == "COVER_IMAGE") {
        setFieldTouched("coverImage", true);
        setFieldError("coverImage", "Must select the valid coverImage file");
        toast.error("Must select the valid coverImage file");
        return;
      }

      setFieldTouched("listingImage", true);
      setFieldError("listingImage", "Must select the valid coverImage file");
      toast.error("Must select the valid coverImage file");
      return;
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
      } else if (source == "COVER_IMAGE") {
        setFieldTouched("coverImage", false);
        setFieldError("coverImage", apiData.message);
      } else {
        setFieldTouched("listingImage", false);
        setFieldError("listingImage", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  function getPastedImageFile(clipboardData?: DataTransfer | null) {
    return Array.from(clipboardData?.files || []).find((file) =>
      file.type.startsWith("image/"),
    );
  }

  // handleUploadFile
  async function handleUploadFile(
    event: React.ChangeEvent<HTMLInputElement>,
    source?: "COVER_IMAGE" | "LISTING_IMAGE",
  ) {
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

    await uploadPostImageFile(files[0], source);
    event.target.value = "";
  }

  async function handlePasteCoverImage(
    event: React.ClipboardEvent<HTMLElement>,
  ) {
    const pastedImage = getPastedImageFile(event.clipboardData);

    if (!pastedImage) return;

    event.preventDefault();
    await uploadPostImageFile(pastedImage, "COVER_IMAGE");
  }

  useEffect(function () {
    function handleWindowPaste(event: ClipboardEvent) {
      if (event.defaultPrevented) return;

      const target = event.target as HTMLElement | null;
      const isTypingArea = target?.closest(
        "input, textarea, .ck-editor, [contenteditable='true']",
      );
      const isCoverArea = target?.closest(".post-cover-grid");

      if (isTypingArea && !isCoverArea) return;

      const pastedImage = getPastedImageFile(event.clipboardData);
      if (!pastedImage) return;

      event.preventDefault();
      void uploadPostImageFile(pastedImage, "COVER_IMAGE");
    }

    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, []);

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

  // get author
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/authors?limit=0", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
          };
        });
        setAuthors(modifiedValue);
      }
    }
    getData();
  }, []);

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

  function applyImageLayout(layout: "block" | "alignLeft" | "alignRight" | "side") {
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
    contentEditor.editing.view.focus();
    setFieldValue("content", contentEditor.getData());
  }

  return (
    <div className="content-wrapper post-form-page">
      <div className="post-form-header">
        <div>
          <div className="post-form-header__actions">
            <GoBackButton />
            <span className="post-page-eyebrow">{labels.eyebrow}</span>
          </div>
          <h1>Add {labels.singular}</h1>
          <p>{labels.description}</p>
        </div>
        <div className="post-form-header__meta">
          <span className="post-form-pill">New post</span>
          <span className="post-form-note">Cover required</span>
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
                      handleChange={handleTitleChange}
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

                  {/* Select Author */}
                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Select Author"
                      placeholder="Select Author"
                      name="author"
                      required={true}
                      options={authors}
                      value={values.author}
                      error={errors.author}
                      touched={touched.author}
                      isMulti={false}
                      handleChange={(value) => {
                        setFieldValue("author", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("author", true);
                      }}
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
                        checked={values.featured}
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
                    <span>Media</span>
                    <h2>Cover image</h2>
                  </div>
                  <span className="post-form-chip">1200 x 628 px</span>
                </div>
                <div className="post-cover-grid" onPaste={handlePasteCoverImage} tabIndex={0}>
                  <label htmlFor="imageFile" className="post-cover-uploader">
                    <span className="post-cover-uploader__icon">
                      <i className="fa fa-cloud-arrow-up"></i>
                    </span>
                    <strong>Upload cover image</strong>
                    <p>JPG, PNG, or WEBP landscape image. Paste image also works.</p>
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

                <div className="post-editor-shell" id="blog-editor">
                    <div className="post-image-layout-panel">
                      <div>
                        <strong>Image Layout</strong>
                        <span>Image select karke layout choose karein</span>
                      </div>
                      <div className="post-image-layout-actions">
                        <button type="button" onClick={() => applyImageLayout("block")}>Full</button>
                        <button type="button" onClick={() => applyImageLayout("alignLeft")}>Left</button>
                        <button type="button" onClick={() => applyImageLayout("alignRight")}>Right</button>
                        <button type="button" onClick={() => applyImageLayout("side")}>Text Wrap</button>
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
                            ],
                          },
                          toolbar: [
                            "imageStyle:block",
                            "imageStyle:alignLeft",
                            "imageStyle:alignRight",
                            "imageStyle:side",
                            "|",
                            "toggleImageCaption",
                            "imageTextAlternative",
                          ],
                        },
                      }}
                      data=""
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
                <strong>Add {labels.singular}</strong>
                <span>Save this item to your {labels.library}.</span>
              </div>
              <SubmitButton loading={loading} text={`Add ${labels.singular}`} />
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
                    Category and author
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
