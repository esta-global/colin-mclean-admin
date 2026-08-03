import {
  CustomSelect,
  GoBackButton,
  InputBox,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import { useEffect, useState } from "react";
import { post, get } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { addUrlToFile } from "../../utills/addUrlToFile";
import React from "react";
import {
  notifyMeInitialValues,
  notifyMeSchema,
  NotifyMeValues,
} from "../../validationSchemas/notifyMeSchema";

export function AddNotifyMe() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);

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
      values: NotifyMeValues,
      helpers: FormikHelpers<NotifyMeValues>,
    ) {
      setLoading(true);

      const newValues = {
        ...values,
        product: values.product?.value,
      };

      const apiResponse = await post("/notifyMe", newValues, true);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setLoading(false);
    },
    initialValues: notifyMeInitialValues,
    validationSchema: notifyMeSchema,
  });

  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/products?limit=1000&status=ALL", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
            image: value.image ? addUrlToFile(value.image) : "",
          };
        });
        setProducts(modifiedValue);
      }
    }
    getData();
  }, []);

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Add Notify Me</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <form className="forms-sample" onSubmit={handleSubmit}>
            <div className="card rounded-2 mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-6">
                    <InputBox
                      label="Name"
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

                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Product"
                      placeholder="Select Product"
                      name="product"
                      required={true}
                      options={products}
                      value={values.product}
                      error={errors.product}
                      touched={touched.product}
                      isMulti={false}
                      handleChange={(value) => {
                        setFieldValue("product", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("product", true);
                      }}
                    />
                  </div>

                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Message"
                      name="message"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Enter message"
                      value={values.message}
                      touched={touched.message}
                      error={errors.message}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <SubmitButton loading={loading} text="Add Notify Me" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
