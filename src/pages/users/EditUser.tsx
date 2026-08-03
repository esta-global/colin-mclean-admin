import { GoBackButton, InputBox, SubmitButton } from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  userSchema,
  UserValues,
  userInitialValues,
} from "../../validationSchemas/userSchema";
import { useEffect, useState } from "react";
import { get, put } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export function EditUser() {
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
  } = useFormik({
    onSubmit: async function (
      values: UserValues,
      helpers: FormikHelpers<UserValues>
    ) {
      setLoading(true);

      const apiResponse = await put(`/users/${id}`, values);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: userInitialValues,
    validationSchema: userSchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        let url = `/users/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          let value = {
            name: apiData.name,
            email: apiData.email,
            mobile: apiData.mobile,
            status: `${apiData.status}`,
          };

          setValues(value);
        } else {
          toast.error(apiResponse?.message);
        }

        setLoading(false);
      }

      if (id) getData(id);
    },
    [id]
  );

  return (
    <div className="content-wrapper user-form-page">
      <div className="row user-page-header">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2 align-items-center">
              <GoBackButton />
              <div>
                <h4 className="font-weight-bold mb-1">Update User</h4>
                <p className="user-page-subtitle mb-0">
                  Manage user contact details and account status.
                </p>
              </div>
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
            {/* Personal Details */}
            <div className="card user-panel">
              <div className="card-body">
                <div className="user-section-title">
                  <div>
                    <h5 className="mb-1">Personal Details</h5>
                    <p className="mb-0">
                      Keep this information accurate for orders and support.
                    </p>
                  </div>
                </div>

                <div className="row user-form-grid">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="User Name"
                      name="name"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter user name"
                      value={values.name}
                      required={true}
                      touched={touched.name}
                      error={errors.name}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label htmlFor="">
                      Status <span className="text-danger">*</span>{" "}
                    </label>
                    <div className="user-status-options">
                      <label
                        className={`user-status-option ${
                          values.status == "true" ? "active" : ""
                        }`}
                        htmlFor="true"
                      >
                        <input
                          type="radio"
                          name="status"
                          id="true"
                          value={"true"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "true"}
                        />
                        <span className="status-dot"></span>
                        <span>Active</span>
                      </label>
                      <label
                        className={`user-status-option ${
                          values.status == "false" ? "active" : ""
                        }`}
                        htmlFor="disabled"
                      >
                        <input
                          type="radio"
                          name="status"
                          id="disabled"
                          value={"false"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.status == "false"}
                        />
                        <span className="status-dot disabled"></span>
                        <span>Disabled</span>
                      </label>
                    </div>
                    {errors.status ? (
                      <p className="custom-form-error text-danger">
                        {errors.status}
                      </p>
                    ) : null}
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Email"
                      name="email"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="email"
                      placeholder="Enter email"
                      value={values.email}
                      required={true}
                      touched={touched.email}
                      error={errors.email}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Mobile"
                      name="mobile"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter mobile"
                      value={values.mobile}
                      required={true}
                      touched={touched.mobile}
                      error={errors.mobile}
                    />
                  </div>

                  <div className="col-md-12 user-form-actions">
                    <SubmitButton loading={loading} text="Update User" />
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
