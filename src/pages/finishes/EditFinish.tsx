import {
  GoBackButton,
  InputBox,
  OverlayLoading,
  SubmitButton,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  finishSchema,
  FinishValues,
  finishInitialValues,
} from "../../validationSchemas/finishSchema";
import { useEffect, useState } from "react";
import { get, put } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export function EditFinish() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  } = useFormik({
    onSubmit: async function (
      values: FinishValues,
      helpers: FormikHelpers<FinishValues>
    ) {
      setUpdating(true);

      const apiResponse = await put(`/finishes/${id}`, values);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: finishInitialValues,
    validationSchema: finishSchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        let url = `/finishes/${id}`;
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

        setLoading(false);
      }

      if (id) getData(id);
    },
    [id]
  );

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Edit Finish</h4>
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
                      label="Short Name"
                      name="shortName"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter short name"
                      value={values.shortName}
                      required={true}
                      touched={touched.shortName}
                      error={errors.shortName}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Full Name"
                      name="fullName"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="text"
                      placeholder="Enter full name"
                      value={values.fullName}
                      required={true}
                      touched={touched.fullName}
                      error={errors.fullName}
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

                <SubmitButton loading={updading} text="Update Finish" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
