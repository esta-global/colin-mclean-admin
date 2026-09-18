import {
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { ImageUploadBox } from "../../components/ui/ImageUploadBox";
import { FormikHelpers, useFormik } from "formik";
import {
  categorySchema,
  CategoryValues,
  categoryInitialValues,
} from "../../validationSchemas/blogCategorySchema";
import { useEffect, useState } from "react";
import { get, put, validateTextNumber } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export function EditBlogCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setValues,
    setFieldValue,
  } = useFormik({
    onSubmit: async function (
      values: CategoryValues,
      helpers: FormikHelpers<CategoryValues>
    ) {
      setLoading(true);

      const apiResponse = await put(`/blogCategories/${id}`, values);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: categoryInitialValues,
    validationSchema: categorySchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        let url = `/blogCategories/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          apiData.status = `${apiData.status}`;
          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;
          setValues(apiData);
        } else {
          toast.error(apiResponse?.message);
        }
      }

      if (id) getData(id);
    },
    [id]
  );

  return (
    <div className="content-wrapper blog-category-form-page">
      <div className="blog-category-form-header">
        <div className="blog-category-form-header__content">
          <div className="blog-category-form-header__actions">
            <GoBackButton />
            <span className="blog-category-form-eyebrow">Blog settings</span>
          </div>
          <h1>Edit Blog Category</h1>
          <p>
            Update the category details, publishing status, and SEO metadata
            used across blog posts.
          </p>
        </div>
        <div className="blog-category-form-header__meta">
          <span className="blog-category-form-pill">Editing category</span>
          <span className="blog-category-form-note">
            {values.status == "true" ? "Currently active" : "Currently hidden"}
          </span>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <form
            className="forms-sample blog-category-form"
            onSubmit={handleSubmit}
          >
            <div className="blog-category-form-layout">
              <main className="blog-category-form-main">
                <div className="card blog-category-form-card">
                  <div className="card-body">
                    <div className="blog-category-form-section-heading">
                      <div>
                        <span>Details</span>
                        <h2>Category information</h2>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-6">
                    <InputBox
                      label="Category Name"
                      name="name"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "name",
                          validateTextNumber(evt.target.value)
                        );
                      }}
                      type="text"
                      placeholder="Enter category name"
                      value={values.name}
                      required={true}
                      touched={touched.name}
                      error={errors.name}
                    />
                      </div>

                      <div className="form-group col-md-6">
                    <InputBox
                      label="Category Slug"
                      name="slug"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter category slug"
                      value={values.slug}
                      required={true}
                      touched={touched.slug}
                      error={errors.slug}
                    />
                      </div>

                      <div className="form-group col-md-12">
                    <InputBox
                      label="Short Description"
                      name="shortDescription"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter description"
                      value={values.shortDescription}
                      touched={touched.shortDescription}
                      error={errors.shortDescription}
                    />
                      </div>

                      <div className="form-group col-md-6">
                    <InputBox
                      label="Priority"
                      name="priority"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="number"
                      placeholder="Enter priority"
                      value={values.priority}
                      touched={touched.priority}
                      error={errors.priority}
                      required={true}
                    />
                      </div>

                      <div className="form-group col-md-6">
                    <label className="blog-category-field-label">Status</label>
                    <div className="blog-category-status-options">
                      <label className="blog-category-status-option" title="Visible for posts">
                        <input
                          type="radio"
                          name="status"
                          id="blog-category-status-active"
                          value={"true"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "true"}
                        />
                        <span>
                          <strong>Active</strong>
                        </span>
                      </label>
                      <label className="blog-category-status-option" title="Hide from selection">
                        <input
                          type="radio"
                          name="status"
                          id="blog-category-status-disabled"
                          value={"false"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "false"}
                        />
                        <span>
                          <strong>Disabled</strong>
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
                        <label className="blog-category-field-label">Website Visibility</label>
                        <div className="d-flex align-items-center gap-4 mt-2">
                          <label className="d-flex align-items-center gap-2 cursor-pointer mb-0">
                            <input
                              type="checkbox"
                              name="showInNavbar"
                              checked={values.showInNavbar !== false}
                              onChange={(e) => setFieldValue("showInNavbar", e.target.checked)}
                            />
                            <span className="small text-dark font-weight-bold">Show in Navbar</span>
                          </label>

                          <label className="d-flex align-items-center gap-2 cursor-pointer mb-0">
                            <input
                              type="checkbox"
                              name="showInFooter"
                              checked={values.showInFooter !== false}
                              onChange={(e) => setFieldValue("showInFooter", e.target.checked)}
                            />
                            <span className="small text-dark font-weight-bold">Show in Footer</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card blog-category-form-card">
                  <div className="card-body">
                    <div className="blog-category-form-section-heading">
                      <div>
                        <span>Hero & Content</span>
                        <h2>Category Page Hero & Media</h2>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-6">
                        <InputBox
                          label="Eyebrow Tag"
                          name="eyebrow"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          type="text"
                          placeholder="e.g. Finance & Economics"
                          value={values.eyebrow || ""}
                          touched={touched.eyebrow}
                          error={errors.eyebrow}
                        />
                      </div>

                      <div className="form-group col-md-6">
                        <InputBox
                          label="Hero Heading"
                          name="heading"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          type="text"
                          placeholder="e.g. Industry Trends Reshaping the Market"
                          value={values.heading || ""}
                          touched={touched.heading}
                          error={errors.heading}
                        />
                      </div>

                      <div className="form-group col-md-12">
                        <TextareaBox
                          label="Hero Subheading"
                          name="subheading"
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          placeholder="e.g. Key shifts in markets, consumer demand, competition..."
                          value={values.subheading || ""}
                          touched={touched.subheading}
                          error={errors.subheading}
                        />
                      </div>

                      <div className="form-group col-md-12 mb-0">
                        <ImageUploadBox
                          label="Category Banner / Card Image"
                          name="image"
                          value={values.image || ""}
                          onChange={(filename) => setFieldValue("image", filename)}
                          hint="Featured image used in the category hero background and topic cards."
                          minHeight={200}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card blog-category-form-card">
                  <div className="card-body">
                    <div className="blog-category-form-section-heading">
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

                      <div className="form-group col-md-12 mb-0">
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
              </main>

              <aside className="blog-category-form-side">
                <div className="card blog-category-form-card blog-category-preview-card">
                  <div className="card-body">
                    <span className="blog-category-form-side-kicker">
                      Preview
                    </span>
                    <h2>{values.name || "Category name"}</h2>
                    <p>
                      {values.shortDescription ||
                        "Short description will appear here as you type."}
                    </p>
                    <div className="blog-category-preview-meta">
                      <span>{values.slug || "category-slug"}</span>
                      <strong>
                        {values.status == "true" ? "Active" : "Disabled"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="card blog-category-form-card">
                  <div className="card-body">
                    <span className="blog-category-form-side-kicker">
                      Checklist
                    </span>
                    <ul className="blog-category-check-list">
                      <li>
                        <i className="fa fa-check"></i>
                        Clear category name
                      </li>
                      <li>
                        <i className="fa fa-check"></i>
                        Search-friendly slug
                      </li>
                      <li>
                        <i className="fa fa-check"></i>
                        Priority for ordering
                      </li>
                      <li>
                        <i className="fa fa-check"></i>
                        SEO meta details
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>

            <div className="blog-category-sticky-actions">
              <div>
                <strong>Edit Blog Category</strong>
                <span>Update changes for posts using this category.</span>
              </div>
              <SubmitButton loading={loading} text="Update Category" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
