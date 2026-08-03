import { GoBackButton, InputBox, SubmitButton } from "../../components";
import { FormikHelpers, useFormik } from "formik";
import { useEffect, useState } from "react";
import { post } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  promotionTextInitialValues,
  promotionTextSchema,
  PromotionTextValues,
} from "../../validationSchemas/promotionTextSchema";

export function AddPromotionText() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      onSubmit: async function (
        values: PromotionTextValues,
        helpers: FormikHelpers<PromotionTextValues>
      ) {
        setLoading(true);

        const apiResponse = await post("/promotionTexts", values, true);

        if (apiResponse?.status == 200) {
          toast.success(apiResponse?.message);
          navigate(-1);
        } else {
          helpers.setErrors(apiResponse?.errors);
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      },
      initialValues: promotionTextInitialValues,
      validationSchema: promotionTextSchema,
    });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if the Alt key and Backspace key are pressed
      if (event.altKey && event.key === "Backspace") {
        console.log("Alt + Backspace was pressed!");
        // You can trigger any action here
        navigate(-1);
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Add Prmotion Text</h4>
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
          <div className="card rounded-2">
            <div className="card-body">
              <form className="forms-sample" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Promotion Title"
                      name="title"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter promotion title"
                      value={values.title}
                      required={true}
                      touched={touched.title}
                      error={errors.title}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Link"
                      name="link"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter link"
                      value={values.link}
                      required={false}
                      touched={touched.link}
                      error={errors.link}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label>
                      Promotion Text Location{" "}
                      <span className="text-danger"> *</span>
                    </label>
                    <select
                      name="location"
                      id="location"
                      className="form-control"
                      style={{ height: "45px" }}
                      value={values.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Select Location</option>
                      <option value="header">header</option>
                      <option value="cart">cart</option>
                    </select>
                    {errors.location && touched.location ? (
                      <p className="custom-form-error text-danger">
                        {errors.location}
                      </p>
                    ) : null}
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Priority"
                      name="priority"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter priority"
                      value={values.priority}
                      required={false}
                      touched={touched.priority}
                      error={errors.priority}
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

                <SubmitButton loading={false} text="Add Promotion Text" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
