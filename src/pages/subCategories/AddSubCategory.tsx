import {
  CustomSelect,
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
} from "../../validationSchemas/subCategorySchema";
import { useEffect, useState } from "react";
import { generateSlug, get, post, remove } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function AddSubCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
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
      values: CategoryValues,
      helpers: FormikHelpers<CategoryValues>
    ) {
      setLoading(true);

      const newValue = {
        ...values,
        category: values.category?.value,
      };

      const apiResponse = await post("/subCategories", newValue, true);

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

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/categories", true);
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

  // to upload file this function will be used
  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("image", true);
      setFieldError("image", "Image is required field");
      toast.error("Image is required field");
      setTimeout(() => {
        setFieldError("image", "Image is required field");
      }, 100);
      return;
    }

    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldError("image", "Must select the valid image file");
      setFieldTouched("image", true);
      toast.error("Must select the valid image file");
      setTimeout(() => {
        setFieldError("image", "Must select a valid image file");
      }, 100);
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
        setFieldTouched("image", false);
        setFieldError("image", "");
        setFieldValue("image", apiData.body[0].filename);
      } else {
        setFieldTouched("image", false);
        setFieldError("image", apiData.message);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        setFieldError("image", "");
        setFieldValue("image", "");
      } else {
        setFieldError("image", "");
        setFieldValue("image", "");
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        `imageFile`
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear the input field
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Add Sub Category</h4>
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

      <form className="forms-sample" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card rounded-2">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Sub Category Name"
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
                      label="Sub Category Slug"
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
                      handleChange={(value) => {
                        setFieldValue("category", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("category", true);
                      }}
                      isMulti={false}
                    />
                  </div>

                  <div className="form-group col-md-6">
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
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            {/* Category Image */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="mb-2">SubCategory Image (1080X1080 PX)</h5>
                  </div>

                  <div className="mb-3 col-md-6 d-flex justify-content-center flex-column">
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="imageFile"
                        onChange={(evt) => {
                          handleUploadFile(evt);
                        }}
                      />
                      <label className="input-group-text" htmlFor="imageFile">
                        Upload
                      </label>
                    </div>

                    {touched.image && errors.image ? (
                      <p className="custom-form-error text-danger">
                        {errors.image}
                      </p>
                    ) : null}
                  </div>

                  <div className="col-md-6 text-center">
                    {values.image ? (
                      <Link to={`${values.image}`} target="_blank">
                        <img
                          className="img img-fluid rounded bordered"
                          // height={200}
                          width={200}
                          src={addUrlToFile(values.image)}
                        />
                      </Link>
                    ) : null}
                    {values.image ? (
                      <button
                        type="button"
                        className="btn p-1"
                        onClick={(evt) => {
                          handleDeleteFile(evt, values.image);
                        }}
                      >
                        <i className="fa fa-trash text-danger"></i>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            {/* meta */}
            <div className="card rounded-2 mt-4">
              <div className="card-body">
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
          </div>
        </div>

        <SubmitButton loading={false} text="Add Category" />
      </form>
    </div>
  );
}
