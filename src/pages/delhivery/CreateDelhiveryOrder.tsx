import {
  CustomSelect,
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";

import {
  delhiverySchema,
  DelhiveryValues,
  deliveryInitialValues,
} from "../../validationSchemas/delhiverySchema";
import { useEffect, useState } from "react";
import { get, post } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export function CreateDelhiveryOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    setFieldValue("id", id);
  }, [id]);

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
      values: DelhiveryValues,
      helpers: FormikHelpers<DelhiveryValues>
    ) {
      setLoading(true);

      const newValue = {
        ...values,
      };

      const apiResponse = await post("/delhivery", newValue, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: deliveryInitialValues,
    validationSchema: delhiverySchema,
  });

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Create New Order</h4>
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
                  {/* <div className="form-group col-md-6">
                    <CustomSelect
                      label="Select User"
                      placeholder="Select User"
                      name="user"
                      required={true}
                      options={users}
                      value={values.user}
                      error={errors.user}
                      touched={touched.user}
                      handleChange={(value) => {
                        setFieldValue("user", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("user", true);
                      }}
                      isMulti={false}
                    />
                  </div> */}

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Breadth"
                      name="breadth"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="number"
                      placeholder="Enter breadth"
                      value={values.breadth}
                      required={true}
                      touched={touched.breadth}
                      error={errors.breadth}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Width"
                      name="width"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="number"
                      placeholder="Enter width"
                      value={values.width}
                      required={true}
                      touched={touched.width}
                      error={errors.width}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Height"
                      name="height"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="number"
                      placeholder="Enter height"
                      value={values.height}
                      required={true}
                      touched={touched.height}
                      error={errors.height}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Weight"
                      name="weight"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="number"
                      placeholder="Enter weight"
                      value={values.weight}
                      required={true}
                      touched={touched.weight}
                      error={errors.weight}
                    />
                  </div>
                </div>

                <SubmitButton loading={false} text="Create Order" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
