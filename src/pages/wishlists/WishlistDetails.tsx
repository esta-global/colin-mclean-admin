import { GoBackButton, OverlayLoading } from "../../components";

import { useEffect, useState } from "react";
import { deleteConfirmation, get, post, put, remove } from "../../utills";
import { Link, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import { FILE_URL } from "../../constants";

export function WishlistDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [orderDetails, setOrderDetails] = useState<any>({});
  const [orderHistory, setOrderHistory] = useState<any>([]);
  const [moreProducts, setMoreProducts] = useState<any[]>([]);
  const [needReload, setNeedReload] = useState<boolean>(false);

  // get whishlist details
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const apiResponse = await get(`/wishlists/${id}`, true);
        if (apiResponse?.status == 200) {
          setOrderDetails(apiResponse?.body);
        }
        setLoading(false);
      }
      if (id) getData(id);
    },
    [id, needReload],
  );

  // get more products details
  useEffect(
    function () {
      async function getData(id: string) {
        setLoading(true);
        const apiResponse = await get(`/wishlists?user=${id}`, true);

        if (apiResponse?.status == 200) {
          setMoreProducts(apiResponse?.body);
        }
        setLoading(false);
      }
      if (orderDetails?.user) getData(orderDetails?.user?._id);
    },
    [orderDetails],
  );

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">
                Wishlist Product Details
              </h4>
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
              <div className="col-md-12">
                <div className="card rounded-2">
                  <div className="card-body table-responsive">
                    <div className="row">
                      <div className="col-md-6">
                        {/* <h5>Order Date : {orderDetails.orderId}</h5> */}
                        <p className="d-flex gap-2 align-items-center">
                          Last Update : <i className="ti-calendar"></i>
                          <span>
                            {moment(orderDetails?.updatedAt).format(
                              "DD-MMM-YYYY, hh:mm A",
                            )}
                          </span>
                        </p>
                        <p className="d-flex gap-2 align-items-center">
                          IP Address : <i className="ti-calendar"></i>
                          <span>{orderDetails?.ipAddress}</span>
                        </p>
                      </div>
                      <div className="col-md-6 text-end">
                        <p className="d-flex gap-2 align-items-center">
                          User : <i className="ti-user"></i>
                          <span>{orderDetails?.user?.name}</span>
                        </p>
                        <p className="d-flex gap-2 align-items-center">
                          Mobile : <i className="ti-mobile"></i>
                          <span>{orderDetails?.user?.mobile}</span>
                        </p>
                        <p className="d-flex gap-2 align-items-center">
                          Email : <i className="ti-email"></i>
                          <span>{orderDetails?.user?.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <table className="table table-borderless">
                        <thead>
                          <tr>
                            <th className="bg-light">SL</th>
                            <th className="bg-light">Product Details</th>
                            <th className="bg-light">Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>
                              <div className="d-flex gap-2 align-items-center">
                                <img
                                  style={{
                                    height: "40px",
                                    width: "40px",
                                    borderRadius: "5px",
                                  }}
                                  src={`${FILE_URL}/${orderDetails?.product?.image}`}
                                  alt=""
                                />
                                <div className="">
                                  <h6>{orderDetails?.product?.name}</h6>
                                </div>
                              </div>
                            </td>
                            <td>
                              {moment(orderDetails.createdAt).format(
                                "DD-MMM-YYYY",
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* More Products */}
              <div className="col-md-12">
                <div className="card rounded-2 mt-4">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12 d-flex justify-content-between align-items-center">
                        <h5
                          className="mb-2 cursor-hand"
                          data-bs-toggle="collapse"
                          data-bs-target="#moreProducts"
                          aria-expanded="false"
                          aria-controls="moreProducts"
                        >
                          More Products
                        </h5>
                        <button
                          className="btn btn-light p-2"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#moreProducts"
                          aria-expanded="false"
                          aria-controls="moreProducts"
                        >
                          <i className="fa fa-angle-down text-primary" />
                        </button>
                      </div>

                      <div className="collapse show mt-2" id="moreProducts">
                        <div className="shadow-none p-2 mb-3">
                          <div className="mt-1">
                            <table className="table table-borderless">
                              <thead>
                                <tr>
                                  <th className="bg-light">SL</th>
                                  <th className="bg-light">Product Details</th>
                                  <th className="bg-light">Created At</th>
                                </tr>
                              </thead>
                              <tbody>
                                {moreProducts?.map((item, index: number) => {
                                  if (
                                    item.product._id == orderDetails.product._id
                                  )
                                    return null;

                                  return (
                                    <tr>
                                      <td>{++index}</td>
                                      <td>
                                        <div className="d-flex gap-2 align-items-center">
                                          <img
                                            style={{
                                              height: "40px",
                                              width: "40px",
                                              borderRadius: "5px",
                                            }}
                                            src={`${FILE_URL}/${item?.product?.image}`}
                                            alt=""
                                          />
                                          <div className="">
                                            <h6>{item?.product?.name}</h6>
                                          </div>
                                        </div>
                                      </td>
                                      <td>
                                        {moment(item.createdAt).format(
                                          "DD-MMM-YYYY",
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
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
