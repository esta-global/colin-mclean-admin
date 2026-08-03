import {
  CustomSelect,
  GoBackButton,
  InputBox,
  OverlayLoading,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import { useEffect, useState } from "react";
import { get, put } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { addUrlToFile } from "../../utills/addUrlToFile";
import React from "react";
import {
  notifyMeInitialValues,
  notifyMeSchema,
  NotifyMeValues,
} from "../../validationSchemas/notifyMeSchema";

type NotifyMeEditValues = NotifyMeValues & {
  notifyStatus: string;
};

const notifyMeEditInitialValues: NotifyMeEditValues = {
  ...notifyMeInitialValues,
  notifyStatus: "PENDING",
};

export function EditNotifyMe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);

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
  } = useFormik({
    onSubmit: async function (
      values: NotifyMeEditValues,
      helpers: FormikHelpers<NotifyMeEditValues>,
    ) {
      setUpdating(true);

      const newValues = {
        ...values,
        product: values.product?.value,
      };

      const apiResponse = await put(`/notifyMe/${id}`, newValues);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: notifyMeEditInitialValues,
    validationSchema: notifyMeSchema,
  });

  useEffect(function () {
    async function getProducts() {
      const apiResponse = await get("/products?limit=0", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => ({
          label: value.name,
          value: value._id,
          image: value.image ? addUrlToFile(value.image) : "",
        }));
        setProducts(modifiedValue);
      }
    }
    getProducts();
  }, []);

  useEffect(
    function () {
      async function getData(productId: string) {
        setLoading(true);
        const apiResponse = await get(`/notifyMe/${productId}`, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;

          if (apiData.product) {
            apiData.product = {
              label: apiData.product.name,
              value: apiData.product._id,
              image: apiData.product.image
                ? addUrlToFile(apiData.product.image)
                : "",
            };
          }

          setValues(apiData);
        } else {
          toast.error(apiResponse?.message);
        }

        setLoading(false);
      }

      if (id) getData(id);
    },
    [id, setValues],
  );

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Edit Notify Me</h4>
            </div>
          </div>
        </div>
      </div>

      {loading ? <OverlayLoading /> : null}

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

                  <div className="form-group col-md-6">
                    <label htmlFor="">Notify Status</label>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="notifyStatus"
                          id="pending"
                          value={"PENDING"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.notifyStatus == "PENDING"}
                        />
                        <label htmlFor="pending" className="mt-2">
                          Pending
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="notifyStatus"
                          id="notified"
                          value={"NOTIFIED"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.notifyStatus == "NOTIFIED"}
                        />
                        <label htmlFor="notified" className="mt-2">
                          Notified
                        </label>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="notifyStatus"
                          id="completed"
                          value={"COMPLETED"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          checked={values.notifyStatus == "COMPLETED"}
                        />
                        <label htmlFor="completed" className="mt-2">
                          Completed
                        </label>
                      </div>
                    </div>
                    {errors.notifyStatus && touched.notifyStatus ? (
                      <p className="custom-form-error text-danger">
                        {errors.notifyStatus}
                      </p>
                    ) : null}
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
              <SubmitButton loading={updating} text="Update Notify Me" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
