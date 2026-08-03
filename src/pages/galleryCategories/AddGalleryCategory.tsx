import {
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  categorySchema,
  CategoryValues,
  categoryInitialValues,
} from "../../validationSchemas/blogCategorySchema";

import { useState } from "react";
import { generateSlug, post } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

export function AddGalleryCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    onSubmit: async function (
      values: CategoryValues,
      helpers: FormikHelpers<CategoryValues>
    ) {
      setLoading(true);

      const newValue = { ...values };

      const apiResponse = await post("/galleryCategories", newValue, true);

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

  function handleTitleChange(evt: React.ChangeEvent<HTMLInputElement>) {
    // let value = validateTextNumber(evt.target.value);
    let value = evt.target.value;
    let name = evt.target.name;

    setFieldValue(name, value);

    let slug = generateSlug(value);
    setFieldValue("slug", slug);
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Add Gallery Category</h4>
            </div>
            {/* <div>
              <button
                type="button"
                className="btn btn-primary btn-icon-text btn-rounded"
              >
                <i className="ti-clipboard btn-icon-prepend"></i>Report
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 ">
          <form className="forms-sample" onSubmit={handleSubmit}>
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Category Name"
                      name="name"
                      handleBlur={handleBlur}
                      handleChange={handleTitleChange}
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
                    <label htmlFor="">Status</label>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          id="true"
                          value={"true"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "true"}
                        />
                        <label htmlFor="true" className="mt-2">
                          Active
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="radio"
                          name="status"
                          id="false"
                          value={"false"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "false"}
                        />
                        <label htmlFor="false" className="mt-2">
                          Disabled
                        </label>
                      </div>
                    </div>
                    {errors.status && touched.status ? (
                      <p className="custom-form-error text-danger">
                        {errors.status}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* META Details */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-2">META Details</h5>
                  </div>
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

                  <div className="">
                    <SubmitButton loading={false} text="Add Category" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
