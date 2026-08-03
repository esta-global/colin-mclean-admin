import { GoBackButton, OverlayLoading } from "../../components";

import { useEffect, useState } from "react";
import { deleteConfirmation, get, post, put, remove } from "../../utills";
import { Link, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { FILE_URL } from "../../constants";

export function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [orderDetails, setOrderDetails] = useState<any>({});
  const [orderHistory, setOrderHistory] = useState<any>([]);
  const [orderProducts, setOrderProducts] = useState<any[]>([]);
  const [needReload, setNeedReload] = useState<boolean>(false);

  // get order details
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const apiResponse = await get(`/orders/${id}`, true);
        if (apiResponse?.status == 200) {
          setOrderDetails(apiResponse?.body);
          if (
            apiResponse?.body?.products &&
            apiResponse?.body?.products?.length
          ) {
            setOrderProducts(apiResponse?.body?.products);
          }
        }
        setLoading(false);
      }
      if (id) getData(id);
    },
    [id, needReload]
  );

  // get order history
  useEffect(
    function () {
      async function getData(id: string) {
        const apiResponse = await get(`/orderHistories?order=${id}`, true);
        if (apiResponse?.status == 200) {
          setOrderHistory(apiResponse?.body);
        }
      }
      if (id) getData(id);
    },
    [id]
  );

  // handleUpdateOrder
  async function handleUpdateOrder(
    evt: React.ChangeEvent<HTMLSelectElement>,
    callFrom: "orderStatus" | "paymentStatus"
  ) {
    const { isConfirmed } = await deleteConfirmation(
      `Do you want to update the ${
        callFrom == "orderStatus" ? "order" : "payment"
      } status!`,
      "Yes, update it!"
    );

    if (!isConfirmed) {
      return;
    }

    let data: any = {};

    if (callFrom == "orderStatus") {
      data.orderStatus = evt.target.value;
    } else if (callFrom == "paymentStatus") {
      data.paymentStatus = evt.target.value;
    }

    const apiResponse = await put(`/orders/${id}`, data);

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Order Details</h4>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <OverlayLoading />
      ) : (
        <div className="row">
          <div className="col-md-12 ">
            {/* Products & Order Details */}
            <div className="row">
              {/* Products Details */}
              <div className="col-md-9">
                <div className="card rounded-2">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-6">
                        {/* <h5>Order Date : {orderDetails.orderId}</h5> */}
                        <p className="d-flex gap-2 align-items-center my-3">
                          Order Date : <i className="ti-calendar"></i>
                          <span>
                            {moment(orderDetails?.createdAt).format(
                              "DD-MMM-YYYY, hh:mm A"
                            )}
                          </span>
                        </p>
                      </div>
                      <div className="col-md-6 text-end">
                        {/* <button
                          className="btn btn-info text-white"
                          onClick={() => toPDF()}
                        >
                          <i className="ti-printer"></i> Download Invoice
                        </button> */}
                        <div className="d-flex flex-column gap-1 mt-3">
                          <p className="m-0 p-0">
                            Status : {orderDetails?.orderStatus}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <table className="table table-borderless">
                        <thead>
                          <tr>
                            <th className="bg-light">SL</th>
                            <th className="bg-light">Item Details</th>
                            <th className="bg-light">Category</th>
                            <th className="bg-light">Sub Category</th>
                            <th className="bg-light">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails?.products?.map(
                            (item: any, index: number) => {
                              return (
                                <tr>
                                  <td>{++index}</td>
                                  <td>
                                    <div className="d-flex gap-2 align-items-center">
                                      <img
                                        style={{
                                          height: "110px",
                                          width: "110px",
                                          borderRadius: "5px",
                                        }}
                                        src={`${FILE_URL}/${item?.image}`}
                                        alt=""
                                      />
                                      <div className="">
                                        <h6>{item?.name}</h6>

                                        <p className="m-0">
                                          <strong>Shape : </strong>
                                          {item?.shape?.name}
                                        </p>
                                        <p className="m-0">
                                          <strong>Size : </strong>
                                          {item?.size?.title}
                                        </p>
                                        <p className="m-0">
                                          <strong>Material : </strong>
                                          {item?.material?.name}
                                        </p>
                                        <p className="m-0">
                                          <strong>Color : </strong>
                                          {item?.color?.name}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{item?.category?.name}</td>
                                  <td>{item?.subCategory?.name}</td>
                                  <td>{item?.quantity}</td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Order History */}
                <div className="card rounded-2 mt-4 mb-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12 d-flex justify-content-between align-items-center">
                        <h5
                          className=" cursor-hand"
                          data-bs-toggle="collapse"
                          data-bs-target="#orderHistorySection"
                          aria-expanded="false"
                          aria-controls="orderHistorySection"
                        >
                          Order History
                        </h5>
                        <button
                          className="btn btn-light"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#orderHistorySection"
                          aria-expanded="false"
                          aria-controls="orderHistorySection"
                        >
                          <i className="fa fa-angle-down text-primary" />
                        </button>
                      </div>

                      <div className="collapse" id="orderHistorySection">
                        <div className="row">
                          <div className="col-md-12">
                            <ul className="timeline list-unstyled position-relative">
                              {orderHistory.map((event: any, index: number) => (
                                <li
                                  className="mb-5 ps-5 position-relative"
                                  key={index}
                                >
                                  <div className="dot bg-primary position-absolute top-0 start-0 translate-middle rounded-circle"></div>
                                  <h6 className="fw-bold mb-1">
                                    {moment(event.createdAt).format(
                                      "DD-MM-YYYY HH:mm A"
                                    )}
                                  </h6>
                                  <div className="text-muted mb-1">
                                    {event.createdBy}
                                  </div>
                                  <p className="mb-0">
                                    <span>{event.updateNotes}</span>
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="col-md-3">
                <div className="card rounded-2">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-12">
                        <h5>Order & Address Details</h5>

                        {/* Order Status */}
                        <div className="form-group mt-3">
                          <label htmlFor="">Order Status</label>
                          <select
                            className="form-select"
                            aria-label="Default select example"
                            onChange={(evt) => {
                              handleUpdateOrder(evt, "orderStatus");
                            }}
                          >
                            <option selected>Select Status</option>

                            <option
                              value="HOLD"
                              selected={orderDetails?.orderStatus == "HOLD"}
                            >
                              HOLD
                            </option>

                            <option
                              value="RESOLVED"
                              selected={orderDetails?.orderStatus == "RESOLVED"}
                            >
                              RESOLVED
                            </option>

                            <option
                              value="CANCELLED"
                              selected={
                                orderDetails?.orderStatus == "CANCELLED"
                              }
                            >
                              CANCELLED
                            </option>
                          </select>
                        </div>

                        {/* Payment Status */}
                        {orderDetails?.paymentMethod == "cod" ? (
                          <div className="form-group mt-3">
                            <label htmlFor="">Payment Status</label>
                            <select
                              className="form-select"
                              aria-label="Default select example"
                              onChange={(evt) => {
                                handleUpdateOrder(evt, "paymentStatus");
                              }}
                            >
                              <option selected>Select Status</option>
                              {/* <option
                                value="PENDING"
                                selected={
                                  orderDetails?.paymentStatus == "PENDING"
                                }
                              >
                                Unpaid
                              </option> */}
                              <option
                                value="paid"
                                selected={orderDetails?.paymentStatus == "paid"}
                              >
                                Paid
                              </option>
                            </select>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="card rounded-2 mt-3">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="d-flex gap-2 align-items-center">
                          {/* <i
                            className="ti-user"
                            style={{ fontSize: "20px" }}
                          ></i> */}
                          <span>User Information</span>
                        </h5>

                        <div className="mt-2">
                          <p className="d-flex gap-2 align-items-center">
                            <i className="ti-user"></i>
                            {orderDetails?.name}
                          </p>
                          <p className="">
                            <a
                              href={`tel:${orderDetails?.mobile}`}
                              className="nav-link d-flex gap-2 align-items-center"
                            >
                              <i className="ti-mobile"></i>
                              {orderDetails?.mobile}
                            </a>
                          </p>
                          <p className="">
                            <a
                              href={`mailto:${orderDetails?.email}`}
                              className="nav-link d-flex gap-2 align-items-center"
                            >
                              <i className="ti-email"></i>
                              {orderDetails?.email}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="card rounded-2 mt-3">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="d-flex gap-2 align-items-center">
                          {/* <i
                            className="ti-user"
                            style={{ fontSize: "20px" }}
                          ></i> */}
                          <span>Address</span>
                        </h5>

                        <div className="mt-2">
                          <p className="p-0 m-0">
                            {orderDetails?.addressLine1 || "N/A"}
                          </p>
                          <p className="p-0 m-0">
                            {orderDetails?.addressLine2}{" "}
                            {orderDetails?.addressLine3}
                          </p>
                          <p className="p-0 m-0">
                            {orderDetails?.city || "N/A"},{" "}
                            {orderDetails?.state || "N/A"},{" "}
                            {orderDetails?.country || "N/A"}
                            {orderDetails?.pincode || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Details */}
                {/* <div className="card rounded-2 mt-3">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="d-flex gap-2 align-items-center">
                          <span>Billing Address</span>
                        </h5>

                        <div className="mt-2">
                          <p className="d-flex gap-2 align-items-center">
                            <i className="ti-user"></i>
                            {orderDetails?.billingAddress?.name}
                          </p>
                          <p className="">
                            <a
                              href={`tel:${orderDetails?.billingAddress?.contact}`}
                              className="nav-link d-flex gap-2 align-items-center"
                            >
                              <i className="ti-mobile"></i>
                              {orderDetails?.billingAddress?.contact}
                            </a>
                          </p>

                          <p className="d-flex gap-2 align-items-center">
                            <i className="ti-location-pin"></i>
                            {orderDetails?.billingAddress?.line1
                              ? `${orderDetails?.billingAddress?.line1}, `
                              : null}

                            {orderDetails?.billingAddress?.line2
                              ? `${orderDetails?.billingAddress?.line2}, `
                              : null}
                            {orderDetails?.billingAddress?.line3
                              ? `${orderDetails?.billingAddress?.line3}, `
                              : null}
                            {orderDetails?.billingAddress?.line4
                              ? `${orderDetails?.billingAddress?.line4}, `
                              : null}

                            {`${orderDetails?.billingAddress?.city}, ${orderDetails?.billingAddress?.state} - ${orderDetails?.billingAddress?.zipcode} (${orderDetails?.billingAddress?.country})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
