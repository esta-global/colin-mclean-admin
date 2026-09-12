import { GoBackButton, InputBox, SubmitButton } from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  carouselSchema,
  CarouselValues,
  carouselInitialValues,
} from "../../validationSchemas/carouselSchema";
import { useState } from "react";
import { post, remove } from "../../utills";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import { addUrlToFile } from "../../utills/addUrlToFile";

export function AddCarousel() {
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
    setFieldTouched,
    setFieldError,
  } = useFormik({
    onSubmit: async function (
      values: CarouselValues,
      helpers: FormikHelpers<CarouselValues>,
    ) {
      setLoading(true);

      if (values.mediaType == "VIDEO" && values.video == "") {
        toast.error("Must upload Video");
        setLoading(false);
        return;
      }

      if (values.mediaType != "VIDEO" && values.image == "") {
        toast.error("Must upload Image");
        setLoading(false);
        return;
      }

      const payload = {
        ...values,
        image: values.mediaType == "VIDEO" ? "" : values.image,
        video: values.mediaType == "VIDEO" ? values.video : "",
      };

      const apiResponse = await post("/carousels", payload, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: carouselInitialValues,
    validationSchema: carouselSchema,
  });

  // handleUploadFile
  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const imageMimeTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/webp",
    ];
    const videoMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

    const files = event.target.files;

    if (!files || files.length === 0) {
      toast.error("Must select at least one file");
      return;
    }

    // Validate MIME type and append valid files to FormData
    // Check if the file's MIME type is in the allowed list
    let file = files[0];

    if (event.target.name == "image") {
      if (!imageMimeTypes.includes(file.type)) {
        setFieldTouched("image", true);
        setFieldError("image", "Must select the valid image file");
        toast.error("Must select the valid image file");
        return;
      }
    } else if (event.target.name == "video") {
      if (!videoMimeTypes.includes(file.type)) {
        setFieldTouched("video", true);
        setFieldError("video", "Must select the valid video file");
        toast.error("Must select the valid video file");
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
        if (event.target.name == "image") {
          setFieldTouched("image", false);
          setFieldError("image", "");
          setFieldValue("image", apiData.body[0].filename);
        } else if (event.target.name == "video") {
          setFieldTouched("video", false);
          setFieldError("video", "");
          setFieldValue("video", apiData.body[0].filename);
        }
      } else {
        if (event.target.name == "image") {
          setFieldTouched("image", false);
          setFieldError("image", apiData.message);
        } else if (event.target.name == "video") {
          setFieldTouched("video", false);
          setFieldError("video", apiData.message);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }

  function handleMediaTypeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const mediaType = event.target.value as CarouselValues["mediaType"];
    setFieldValue("mediaType", mediaType);
    setFieldError("image", "");
    setFieldError("video", "");

    if (mediaType == "VIDEO") {
      setFieldValue("image", "");
    } else {
      setFieldValue("video", "");
    }
  }

  // handleDeleteFile
  async function handleDeleteFile(
    event: React.MouseEvent<HTMLButtonElement>,
    fileName: string,
    fileFor: string,
  ) {
    event.preventDefault();

    try {
      const apiResponse = await remove(`/fileUploads/${fileName}`);
      if (apiResponse?.status == 200) {
        if (fileFor == "image") {
          setFieldError("image", "");
          setFieldValue("image", "");
        } else if (fileFor == "video") {
          setFieldError("video", "");
          setFieldValue("video", "");
        }
      } else {
        if (fileFor == "image") {
          setFieldError("image", "");
          setFieldValue("image", "");
        } else if (fileFor == "video") {
          setFieldError("video", "");
          setFieldValue("video", "");
        }
        toast.error(apiResponse?.message);
      }

      const fileInput = document.getElementById(
        fileFor == "image" ? `imageFile` : `videoFile`,
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
              <h4 className="font-weight-bold mb-0">Add Carousel</h4>
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
        <div className="col-md-12 grid-margin stretch-card">
          <form className="forms-sample" onSubmit={handleSubmit}>
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Carousel Title"
                      name="title"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter title"
                      value={values.title}
                      required={false}
                      touched={touched.title}
                      error={errors.title}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="">Target Device</label>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="targetDevice"
                          id="mobile"
                          value={"MOBILE"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.targetDevice == "MOBILE"}
                        />
                        <label htmlFor="mobile" className="mt-2">
                          MOBILE
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <input
                          type="radio"
                          name="targetDevice"
                          id="desktop"
                          value={"DESKTOP"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.targetDevice == "DESKTOP"}
                        />
                        <label htmlFor="desktop" className="mt-2">
                          DESKTOP
                        </label>
                      </div>
                    </div>
                    {errors.status && touched.status ? (
                      <p className="custom-form-error text-danger">
                        {errors.status}
                      </p>
                    ) : null}
                  </div>

                  <div className="form-group col-md-12">
                    <InputBox
                      label="Sub Title"
                      name="subTitle"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter sub title"
                      value={values.subTitle}
                      required={false}
                      touched={touched.subTitle}
                      error={errors.subTitle}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="">Carousel Media</label>
                    <div className="d-flex gap-3 flex-wrap">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="mediaType"
                          id="mediaImage"
                          value={"IMAGE"}
                          onChange={handleMediaTypeChange}
                          onBlur={handleBlur}
                          checked={values.mediaType == "IMAGE"}
                        />
                        <label htmlFor="mediaImage" className="mt-2">
                          Image
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="mediaType"
                          id="mediaVideo"
                          value={"VIDEO"}
                          onChange={handleMediaTypeChange}
                          onBlur={handleBlur}
                          checked={values.mediaType == "VIDEO"}
                        />
                        <label htmlFor="mediaVideo" className="mt-2">
                          Video
                        </label>
                      </div>
                    </div>
                    {errors.mediaType && touched.mediaType ? (
                      <p className="custom-form-error text-danger">
                        {errors.mediaType}
                      </p>
                    ) : null}
                  </div>

                  {values.mediaType != "VIDEO" ? (
                    <div className="form-group col-md-8">
                      <label htmlFor={"imageFile"}>
                        {values.targetDevice == "MOBILE"
                          ? "Carousel Image (Mobile : 800X1200)"
                          : "Carousel Image (Desktop : 1940X854)"}
                        <span className="text-danger"> *</span>
                      </label>
                    <div className="d-flex gap-2">
                      <input
                        type="file"
                        name="image"
                        id="imageFile"
                        accept="image/png,image/jpg,image/jpeg,image/webp"
                        onChange={(evt) => {
                          handleUploadFile(evt);
                        }}
                        className="form-control"
                      />
                      {values.image ? (
                        <Link to={addUrlToFile(values.image)} target="_blank">
                          <img
                            className="img"
                            height={43}
                            width={43}
                            src={addUrlToFile(values.image)}
                          />
                        </Link>
                      ) : null}
                      {values.image ? (
                        <button
                          type="button"
                          className="btn p-1"
                          onClick={(evt) => {
                            handleDeleteFile(evt, values.image, "image");
                          }}
                        >
                          <i className="fa fa-trash text-danger"></i>
                        </button>
                      ) : null}
                    </div>
                    {touched.image && errors.image ? (
                      <p className="custom-form-error text-danger">
                        {errors.image}
                      </p>
                    ) : null}
                    </div>
                  ) : null}

                  {values.mediaType == "VIDEO" ? (
                    <div className="form-group col-md-8">
                    <label htmlFor={"videoFile"}>
                      {values.targetDevice == "MOBILE"
                        ? "Carousel Video (Mobile : 1080:1920)"
                        : "Carousel Video (Desktop : 1920:1080)"}

                      <span className="text-danger"> *</span>
                    </label>
                    <div className="d-flex gap-2">
                      <input
                        type="file"
                        name="video"
                        id="videoFile"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={(evt) => {
                          handleUploadFile(evt);
                        }}
                        className="form-control"
                      />
                      {values.video ? (
                        <Link
                          to={addUrlToFile(values.video)}
                          target="_blank"
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            background: "#cacacaff",
                            height: "50px",
                            width: "55px",
                            borderRadius: "40px",
                          }}
                        >
                          <i className="fa fa-play"></i>
                        </Link>
                      ) : null}
                      {values.video ? (
                        <button
                          type="button"
                          className="btn p-1"
                          onClick={(evt) => {
                            handleDeleteFile(evt, values.video, "video");
                          }}
                        >
                          <i className="fa fa-trash text-danger"></i>
                        </button>
                      ) : null}
                    </div>
                    {touched.video && errors.video ? (
                      <p className="custom-form-error text-danger">
                        {errors.video}
                      </p>
                    ) : null}
                    </div>
                  ) : null}

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Button Text"
                      name="buttonText"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Button Text"
                      value={values.buttonText}
                      touched={touched.buttonText}
                      error={errors.buttonText}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Button Link"
                      name="buttonLink"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Button Link"
                      value={values.buttonLink}
                      touched={touched.buttonLink}
                      error={errors.buttonLink}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Display Order"
                      name="displayOrder"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="number"
                      placeholder="1"
                      value={values.displayOrder}
                      touched={touched.displayOrder}
                      error={errors.displayOrder}
                    />
                  </div>

                  {/* <div className="form-group col-md-12">
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
                  </div> */}

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

                  <div className="">
                    <SubmitButton loading={false} text="Add Carousel" />
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
