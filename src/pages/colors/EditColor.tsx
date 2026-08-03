import {
  CustomSelect,
  GoBackButton,
  InputBox,
  OverlayLoading,
  SubmitButton,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  colorSchema,
  ColorValues,
  colorInitialValues,
} from "../../validationSchemas/colorSchema";
import { useEffect, useState } from "react";
import { get, put, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addUrlToFile } from "../../utills/addUrlToFile";
import { API_URL } from "../../constants";

export function EditColor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updading, setUpdating] = useState<boolean>(false);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setValues,
    setFieldValue,
    setFieldTouched,
    setFieldError,
  } = useFormik({
    onSubmit: async function (
      values: ColorValues,
      helpers: FormikHelpers<ColorValues>
    ) {
      setUpdating(true);

      let dataForUpdate = {
        ...values,
        // categories: values?.categories?.map((item) => {
        //   return item.value;
        // }),
      };

      const apiResponse = await put(`/colors/${id}`, dataForUpdate);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: colorInitialValues,
    validationSchema: colorSchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        let url = `/colors/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          apiData.status = `${apiData.status}`;
          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;

          // if (apiData.categories?.length) {
          //   apiData.categories = apiData?.categories?.map((item: any) => {
          //     return {
          //       label: item.name,
          //       value: item._id,
          //     };
          //   });
          // }

          setValues(apiData);
        } else {
          toast.error(apiResponse?.message);
        }

        setLoading(false);
      }

      if (id) getData(id);
    },
    [id]
  );

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const mimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      setFieldTouched("image", true);
      setFieldError("image", "Image is required field");
      toast.error("Image is required field");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];
    if (!mimeTypes.includes(file.type)) {
      setFieldTouched("image", true);
      setFieldError("image", "Must select the valid image file");
      toast.error("Must select the valid image file");
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
        setFieldValue("image", "");
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
              <h4 className="font-weight-bold mb-0">Edit Color</h4>
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
      {loading ? <OverlayLoading /> : null}

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <form className="forms-sample" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Color Name"
                      name="name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter name"
                      value={values.name}
                      required={true}
                      touched={touched.name}
                      error={errors.name}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Color Code"
                      name="code"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter code"
                      value={values.code}
                      required={false}
                      touched={touched.code}
                      error={errors.code}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Color Code 2"
                      name="anotherCode"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter Code"
                      value={values.anotherCode}
                      required={false}
                      touched={touched.anotherCode}
                      error={errors.anotherCode}
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

                  <div className="mb-3 col-md-6 d-flex justify-content-center flex-column form-group">
                    <label htmlFor="">Color Image (200X200 PX)</label>
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="imageFile"
                        onChange={(evt) => {
                          handleUploadFile(evt);
                        }}
                      />
                      {/* <label className="input-group-text" htmlFor="imageFile">
                        Upload
                      </label> */}
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

                <SubmitButton loading={updading} text="Update Color" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
