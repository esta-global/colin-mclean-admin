import {
  CustomSelect,
  GoBackButton,
  InputBox,
  SubmitButton,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import { useEffect, useState } from "react";
import { get, post, validateTextNumber } from "../../utills";
import { toast } from "react-toastify";
import { default as ReactSelect, components } from "react-select";
import { useNavigate } from "react-router-dom";
import {
  sizeFinishInitialValues,
  sizeFinishSchema,
  SizeFinishValues,
} from "../../validationSchemas/sizeFinishSchema";

export function AddSizeFinish() {
  const navigate = useNavigate();
  const [sizes, setSizes] = useState([]);
  const [finishes, setFinishes] = useState([]);
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
  } = useFormik({
    onSubmit: async function (
      values: SizeFinishValues,
      helpers: FormikHelpers<SizeFinishValues>
    ) {
      setLoading(true);

      let newValues = {
        ...values,
        size: values?.size?.value,
        finishes: values?.finishes?.map((item) => {
          return item.value;
        }),
      };

      const apiResponse = await post("/sizeFinishes", newValues, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: sizeFinishInitialValues,
    validationSchema: sizeFinishSchema,
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

  // get Size
  useEffect(function () {
    async function getData() {
      let url = `/sizes`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.title,
            value: value._id,
          };
        });
        setSizes(modifiedValue);
      }
    }
    getData();
  }, []);

  // get Finishes
  useEffect(function () {
    async function getData() {
      let url = `/finishes`;
      const apiResponse = await get(url, true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.shortName,
            value: value._id,
          };
        });
        setFinishes(modifiedValue);
      }
    }
    getData();
  }, []);

  const Option = (props: any) => {
    return (
      <div style={{ background: "white" }}>
        <components.Option {...props}>
          <input
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
            style={{ marginTop: "4px" }}
          />{" "}
          <label>{props.label}</label>
        </components.Option>
      </div>
    );
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Add Size & Finish</h4>
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
                  {/* Select Size */}
                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Select Size"
                      placeholder="Select size"
                      name="size"
                      required={true}
                      options={sizes}
                      value={values.size}
                      error={errors.size}
                      touched={touched.size}
                      handleChange={(value) => {
                        setFieldValue("size", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("size", true);
                      }}
                    />
                  </div>

                  {/* Select Finishes */}
                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Select Finishes"
                      placeholder="Select finishes"
                      name="finishes"
                      required={true}
                      options={finishes}
                      value={values.finishes}
                      error={errors.finishes}
                      touched={touched.finishes}
                      handleChange={(value) => {
                        setFieldValue("finishes", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("finishes", true);
                      }}
                      components={{
                        Option,
                      }}
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      isMulti={true}
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

                <SubmitButton loading={false} text="Add Size & Finish" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
