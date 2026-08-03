import { GoBackButton, OverlayLoading } from "../../components";

import { useEffect, useState } from "react";
import { get } from "../../utills";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

export function GetDelhiveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [delhiveryDetails, setDelhiveryDetails] = useState<any>(null);

  // get order details
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const apiResponse = await get(`/delhivery/${id}`, true);
        if (apiResponse?.status == 200) {
          setDelhiveryDetails(apiResponse?.body);
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
              <h4 className="font-weight-bold mb-0">Delhivery Details</h4>
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
                        <h5>Waybill : {delhiveryDetails?.AWB}</h5>
                        <p className="d-flex gap-2 align-items-center my-3">
                          <i className="ti-calendar"></i>
                          <span>
                            Pickup Date :{" "}
                            {moment(delhiveryDetails?.PickUpDate).format(
                              "DD-MMM-YYYY, hh:mm A"
                            )}
                          </span>
                        </p>
                      </div>
                      {/* <div className="col-md-6 text-end">
                              <button
                                className="btn btn-info text-white"
                                onClick={() => toPDF()}
                              >
                                <i className="ti-printer"></i> Print Invoice
                              </button>
                              <div className="d-flex flex-column gap-1 mt-3">
                                <p className="m-0 p-0">
                                  Status : {orderDetails?.orderStatus}
                                </p>
                                <p className="m-0 p-0">
                                  Payment Method : {orderDetails?.paymentMethod}
                                </p>
                                <p className="m-0 p-0">
                                  <span>Payment Status : </span>
                                  <b
                                    className={` badge rounded ${
                                      orderDetails.paymentStatus === "pending"
                                        ? "text-light bg-warning"
                                        : orderDetails.paymentStatus === "paid"
                                        ? "bg-success"
                                        : orderDetails.paymentStatus === "unpaid"
                                        ? "bg-danger"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {orderDetails.paymentStatus}
                                  </b>
                                </p>
                              </div>
                            </div> */}
                    </div>

                    <div className="mt-5">
                      {/* <table className="table table-borderless">
                        <thead>
                          <tr>
                            <th className="bg-light">SL</th>
                            <th className="bg-light">Item Details</th>
                            <th className="bg-light">Qty</th>
                            <th className="bg-light">Tax</th>
                            <th className="bg-light">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                                {orderProducts?.map((product, index) => {
                                  let price =
                                    product.salePrice != 0 && product.mrp
                                      ? product?.salePrice
                                      : product?.mrp;
      
                                  return (
                                    <tr>
                                      <td>{++index}</td>
                                      <td>
                                        <div className="d-flex gap-2 align-items-center">
                                          <img
                                            style={{
                                              height: "70px",
                                              width: "70px",
                                              borderRadius: "5px",
                                            }}
                                            src={`${FILE_URL}/${product.image}`}
                                            alt=""
                                          />
                                          <div className="">
                                            <h6>{product.name}</h6>
                                            <p className="m-0">
                                              <strong>Price : </strong>₹{price}
                                            </p>
                                            <p className="m-0">
                                              <strong>Size : </strong>
                                              {product?.size?.title}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td>{product?.qty}</td>
                                      <td>{product?.tax}</td>
                                      <td>₹{product?.qty * price}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                        <tfoot>
                                <tr>
                                  <td className="text-end" colSpan={3}>
                                    Shipping
                                  </td>
                                  <td></td>
                                  <td>{orderDetails?.shippingCharges}</td>
                                </tr>
                                <tr>
                                  <td className="text-end" colSpan={3}>
                                    Coupon discount
                                    <p className="p-0 m-0 text-success">
                                      {orderDetails?.couponCode}
                                    </p>
                                  </td>
                                  <td></td>
                                  <td colSpan={2}>
                                    {orderDetails?.couponDiscountAmount
                                      ? `- ₹${orderDetails?.couponDiscountAmount}`
                                      : 0}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="text-end" colSpan={3}>
                                    Total
                                  </td>
                                  <td></td>
                                  <td colSpan={2}>₹{orderDetails?.totalAmount}</td>
                                </tr>
                              </tfoot>
                      </table> */}
                      <ul>
                        {delhiveryDetails?.Scans?.map((item: any) => {
                          return (
                            <li>
                              <h6>{item?.ScanDetail?.Instructions}</h6>
                              <p>{item?.ScanDetail?.ScannedLocation}</p>
                              <p>
                                {moment(item?.ScanDetail?.ScanDateTime).format(
                                  "DD-MMM-YYYY, hh:mm A"
                                )}
                              </p>
                              <p>
                                Status Code : {item?.ScanDetail?.StatusCode}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="col-md-3">
                {/* Delivery Status */}
                <div className="card rounded-2 ">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="d-flex gap-2 align-items-center">
                          {/* <i
                                  className="ti-user"
                                  style={{ fontSize: "20px" }}
                                ></i> */}
                          <span>Delivery Status</span>
                        </h5>

                        <div className="mt-2">
                          <h6 className="d-flex gap-2 align-items-center">
                            {delhiveryDetails?.Status?.Instructions}
                          </h6>
                          <p>
                            Location :{" "}
                            {delhiveryDetails?.Status?.StatusLocation}
                          </p>{" "}
                          <p>
                            Date :
                            {moment(
                              delhiveryDetails?.Status?.StatusDateTime
                            ).format("DD-MMM-YYYY, hh:mm A")}
                          </p>
                          <p className="d-flex gap-2 align-items-center">
                            Status : {delhiveryDetails?.Status?.Status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consignee Details */}
                <div className="card rounded-2 mt-3">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="d-flex gap-2 align-items-center">
                          {/* <i
                                  className="ti-user"
                                  style={{ fontSize: "20px" }}
                                ></i> */}
                          <span>Consignee Details</span>
                        </h5>

                        <div className="mt-2">
                          <p className="d-flex gap-2 align-items-center">
                            <i className="ti-user"></i>
                            {delhiveryDetails?.Consignee?.Name}
                          </p>
                          {/* <p className="">
                                  <a
                                    href={`tel:${delhiveryDetails?.Consignee?.Name}`}
                                    className="nav-link d-flex gap-2 align-items-center"
                                  >
                                    <i className="ti-mobile"></i>
                                    {delhiveryDetails?.Consignee?.Name}
                                  </a>
                                </p> */}

                          <p className="d-flex gap-2 align-items-center">
                            <i className="ti-location-pin"></i>
                            {delhiveryDetails?.Consignee?.Address1
                              ? `${delhiveryDetails?.Consignee?.Address1}`
                              : null}

                            {delhiveryDetails?.Consignee?.Address2
                              ? `, ${delhiveryDetails?.Consignee?.Address2}`
                              : null}
                            {delhiveryDetails?.Consignee?.Address3
                              ? `, ${delhiveryDetails?.Consignee?.Address3} `
                              : null}

                            {`${delhiveryDetails?.Consignee?.City}, ${delhiveryDetails?.Consignee?.State} - ${delhiveryDetails?.Consignee?.PinCode} (${delhiveryDetails?.Consignee?.Country})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AWB */}
                <div className="card rounded-2 mt-3">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-12">
                        <h5 className="d-flex gap-2 align-items-center">
                          {/* <i
                                  className="ti-user"
                                  style={{ fontSize: "20px" }}
                                ></i> */}
                          <span>AWB</span>
                        </h5>

                        <div className="mt-2">
                          <p className="d-flex gap-2 align-items-center">
                            Waybill : {delhiveryDetails?.AWB}
                            {/* Upload Wbn : {orderDetails?.uploadWbn} */}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
