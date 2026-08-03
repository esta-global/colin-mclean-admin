import {
  CustomSelect,
  GoBackButton,
  InputBox,
  OverlayLoading,
  SubmitButton,
  TextareaBox,
} from "../../components";
import { FormikHelpers, useFormik } from "formik";
import {
  couponSchema,
  CouponValues,
  couponInitialValues,
} from "../../validationSchemas/couponSchema";
import { useEffect, useState } from "react";
import { get, put, validateNumber, validateTextNumber } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  couponStatusOption,
  applyForOption,
  discountTypeOption,
  COUPON_STATUS,
  COUPON_USERS,
  COUPON_DISCOUNT,
} from "../../constants";
import moment from "moment";

export function EditCoupon() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [updading, setUpdating] = useState<boolean>(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

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
      values: CouponValues,
      helpers: FormikHelpers<CouponValues>,
    ) {
      setUpdating(true);

      const updatedValue = {
        ...values,
        couponStatus: values.couponStatus?.value,
        applyFor: values.applyFor?.value,
        discountType: values.discountType?.value,
      };

      const apiResponse = await put(`/coupons/${id}`, updatedValue);

      if (apiResponse?.status == 200) {
        toast.success(apiResponse?.message);
        navigate(-1);
      } else {
        helpers.setErrors(apiResponse?.errors);
        toast.error(apiResponse?.message);
      }
      setUpdating(false);
    },
    initialValues: couponInitialValues,
    validationSchema: couponSchema,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const url = `/coupons/${id}`;
        const apiResponse = await get(url, true);
        if (apiResponse?.status == 200) {
          const apiData = apiResponse.body;
          delete apiData.isDeleted;
          delete apiData.createdAt;
          delete apiData.updatedAt;
          delete apiData._id;

          apiData.startDate = moment(apiData.startDate).format("YYYY-MM-DD");
          apiData.expiryDate = moment(apiData.expiryDate).format("YYYY-MM-DD");
          apiData.couponStatus = {
            label:
              COUPON_STATUS[apiData.couponStatus as keyof typeof COUPON_STATUS],
            value: apiData.couponStatus,
          };

          apiData.applyFor = {
            label: COUPON_USERS[apiData.applyFor as keyof typeof COUPON_USERS],
            value: apiData.applyFor,
          };

          apiData.discountType = {
            label:
              COUPON_DISCOUNT[
              apiData.discountType as keyof typeof COUPON_DISCOUNT
              ],
            value: apiData.discountType,
          };

          // setValues(apiData);
          setValues({
            ...couponInitialValues,
            ...apiData,
          });
        } else {
          toast.error(apiResponse?.message);
        }

        setLoading(false);
      }

      if (id) getData(id);
    },
    [id],
  );

  // get category
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/categories?limit=0&status=true", true);
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

  // get products
  useEffect(function () {
    async function getData() {
      const apiResponse = await get("/products?limit=0&status=true", true);
      if (apiResponse?.status == 200) {
        const modifiedValue = apiResponse?.body?.map((value: any) => {
          return {
            label: value.name,
            value: value._id,
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
              <h4 className="font-weight-bold mb-0">Edit Coupon</h4>
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
                      label="Coupon Code"
                      name="couponCode"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "couponCode",
                          validateTextNumber(evt.target.value),
                        );
                      }}
                      type="text"
                      placeholder="Enter coupon code"
                      value={values?.couponCode}
                      required={true}
                      touched={touched?.couponCode}
                      error={errors?.couponCode}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Coupon Apply For"
                      placeholder="Select user"
                      name="applyFor"
                      required={true}
                      options={applyForOption}
                      value={values?.applyFor}
                      error={errors?.applyFor}
                      touched={touched?.applyFor}
                      handleChange={(value) => {
                        setFieldValue("applyFor", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("applyFor", true);
                      }}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Discount Type"
                      placeholder="Select discount type"
                      name="discountType"
                      required={true}
                      options={discountTypeOption}
                      value={values?.discountType}
                      error={errors?.discountType}
                      touched={touched?.discountType}
                      handleChange={(value) => {
                        setFieldValue("discountType", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("discountType", true);
                      }}
                    />
                  </div>

                  <div
                    className={`form-group col-md-${values.discountType?.value == "PERCENTAGE" ? 3 : 6
                      }`}
                  >
                    <InputBox
                      label="Discount"
                      name="discount"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "discount",
                          validateNumber(evt.target.value),
                        );
                      }}
                      type="number"
                      placeholder="Enter discount"
                      value={values?.discount}
                      required={true}
                      touched={touched?.discount}
                      error={errors?.discount}
                    />
                  </div>

                  {values.discountType?.value == "PERCENTAGE" ? (
                    <div className="form-group col-md-3">
                      <InputBox
                        label="Discount Upto"
                        name="discountUpto"
                        handleBlur={handleBlur}
                        handleChange={(evt) => {
                          setFieldValue(
                            "discountUpto",
                            validateNumber(evt.target.value),
                          );
                        }}
                        type="number"
                        placeholder="Enter discount upto"
                        value={values?.discountUpto}
                        required={false}
                        touched={touched?.discountUpto}
                        error={errors?.discountUpto}
                      />
                    </div>
                  ) : null}

                  <div className="form-group col-md-12">
                    <TextareaBox
                      label="Description"
                      name="description"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      placeholder="Coupon description"
                      value={values?.description}
                      touched={touched?.description}
                      error={errors?.description}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Mininum Amount"
                      name="minimumAmount"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "minimumAmount",
                          validateNumber(evt.target.value),
                        );
                      }}
                      type="number"
                      placeholder="Enter amount"
                      value={values?.minimumAmount}
                      required={true}
                      touched={touched?.minimumAmount}
                      error={errors?.minimumAmount}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="No of Uses Times"
                      name="numberOfUsesTimes"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "numberOfUsesTimes",
                          validateNumber(evt.target.value),
                        );
                      }}
                      type="number"
                      placeholder="Enter amount"
                      value={values?.numberOfUsesTimes}
                      required={true}
                      touched={touched?.numberOfUsesTimes}
                      error={errors?.numberOfUsesTimes}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Coupon Activition Date"
                      name="startDate"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="date"
                      placeholder=""
                      value={values?.startDate}
                      required={true}
                      touched={touched?.startDate}
                      error={errors?.startDate}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Coupon Expiry Date"
                      name="expiryDate"
                      handleBlur={handleBlur}
                      handleChange={handleChange}
                      type="date"
                      placeholder=""
                      value={values?.expiryDate}
                      required={true}
                      touched={touched?.expiryDate}
                      error={errors?.expiryDate}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <InputBox
                      label="Max Uses"
                      name="maxUses"
                      handleBlur={handleBlur}
                      handleChange={(evt) => {
                        setFieldValue(
                          "maxUses",
                          validateNumber(evt.target.value),
                        );
                      }}
                      type="number"
                      placeholder="Enter max uses"
                      value={values?.maxUses}
                      required={true}
                      touched={touched?.maxUses}
                      error={errors?.maxUses}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <CustomSelect
                      label="Coupon Status"
                      placeholder="Select coupon status"
                      name="couponStatus"
                      required={true}
                      options={couponStatusOption}
                      value={values?.couponStatus}
                      error={errors?.couponStatus}
                      touched={touched?.couponStatus}
                      handleChange={(value) => {
                        setFieldValue("couponStatus", value);
                      }}
                      handleBlur={() => {
                        setFieldTouched("couponStatus", true);
                      }}
                    />
                  </div>
                </div>

                <SubmitButton loading={updading} text="Update Coupon" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
