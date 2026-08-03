import { DataTable, GoBackButton, Pagination } from "../../components";
import {
  Column,
  HeaderProps,
  Row,
  TableInstance,
  useFilters,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { deleteConfirmation, get, remove } from "../../utills";
import { toast } from "react-toastify";
import { CouponStatusTypes } from "../../constants";

export function CouponList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [couponStatus, setCouponStatus] = useState<boolean | string>("");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  // Get Data From Database
  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/coupons?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (couponStatus) url += `&couponStatus=${couponStatus}`;

        const apiResponse = await get(url, true);

        if (apiResponse?.status == 200) {
          setRecords(apiResponse.body);
          setPagination({
            ...pagination,
            page: apiResponse?.page as number,
            totalPages: apiResponse?.totalPages as number,
            totalRecords: apiResponse?.totalRecords as number,
          });
        } else {
          setRecords([]);
          toast.error(apiResponse?.message);
        }
        setLoading(false);
      }

      getData();
    },
    [pagination.page, pagination.limit, searchQuery, needReload, couponStatus],
  );

  type Record = {
    couponCode: string;
    createdAt: string;
    couponStatus: CouponStatusTypes;
    validity: string;
    id: string;
  };

  // Extend the TableInstance type
  type TableInstanceWithRowSelect<Record extends object> =
    TableInstance<Record> & {
      selectedFlatRows: Row<Record>[];
    };

  const columns: Column<Record>[] = React.useMemo(
    () => [
      {
        id: "selection",
        disableSortBy: true,
        Header: ({ getToggleAllRowsSelectedProps }: any) => (
          <div>
            <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        Cell: ({ row }: any) => (
          <div>
            <input type="checkbox" {...row.getToggleRowSelectedProps()} />
          </div>
        ),
      },

      {
        Header: "COUPON CODE",
        accessor: "couponCode",
      },

      {
        Header: "VALIDITY",
        accessor: "validity",
      },

      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => {
          return moment(new Date(value)).format("DD-MM-YYYY");
        },
      },
      {
        Header: "COUPON STATUS",
        accessor: "couponStatus",
        Cell: ({ value }: any) => {
          const couponStatus: CouponStatusTypes = value;
          return (
            <>
              {couponStatus === "ACTIVE" ? (
                <span className="badge bg-success">Active</span>
              ) : couponStatus === "EXPIRED" ? (
                <span className="badge bg-danger">Expired</span>
              ) : couponStatus === "HOLD" ? (
                <span className="badge bg-warning">Hold</span>
              ) : couponStatus === "PENDING" ? (
                <span className="badge bg-info">Pending</span>
              ) : null}
            </>
          );
        },
      },
      {
        Header: "ACTION",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          return (
            <div className="d-flex gap-1">
              <Link
                className="p-2 bg-light"
                to={{
                  pathname: `/coupons/edit/${value}`,
                }}
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              {/* <Link
                className="p-2 bg-light"
                to={{
                  pathname: `/coupons/details/${value}`,
                }}
              >
                <span className="fas fa-eye" aria-hidden="true"></span>
              </Link> */}

              <button
                type="button"
                className="btn p-2 bg-light"
                data-toggle="modal"
                data-target="#deleteModal"
                onClick={() => {
                  handleDeleteData(value);
                }}
              >
                <span
                  className="fas fa-trash-alt text-danger"
                  aria-hidden="true"
                ></span>
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const data = React.useMemo(() => {
    return records.map((data) => {
      return {
        couponCode: data.couponCode,
        createdAt: data.createdAt,
        couponStatus: data.couponStatus,
        validity: `${moment(data.startDate).format("DD-MMM-YYYY")} to ${moment(
          data.expiryDate,
        ).format("DD-MMM-YYYY")}`,
        id: data._id,
      };
    });
  }, [records]);

  const { getTableProps, headerGroups, rows, prepareRow, selectedFlatRows } =
    useTable(
      { columns, data },
      useFilters,
      useSortBy,
      usePagination,
      useRowSelect,
    ) as TableInstanceWithRowSelect<Record>;

  // handleDeleteData
  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/coupons`, recordId);
    } else {
      apiResponse = await remove(`/coupons/${recordId}`);
    }

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  function handleSelectedRows(): string[] {
    const selectedData = selectedFlatRows.map((row: any) => row?.original?.id);
    return selectedData;
  }

  // handleSetStatus
  function handleSetStatus(evt: React.ChangeEvent<HTMLInputElement>) {
    setCouponStatus(evt.target.value);
  }

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Coupons</h4>
            </div>
            <div>
              <Link
                to={"/coupons/add"}
                type="button"
                className="btn btn-primary text-light"
              >
                Add Coupon
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card rounded-2">
            <div className="card-body shadow-none">
              <div className="row mb-2 gy-2">
                <div className="col-md-8">
                  <input
                    placeholder="Serach..."
                    className="form-control py-2"
                    type="serach"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  />
                </div>
                <div className="col-md-4 d-flex gap-2 justify-content-md-end">
                  {/* <button className="btn p-2 bg-light border">
                    <i className="ti-search"></i>
                  </button> */}
                  {selectedFlatRows.length ? (
                    <button
                      className="btn p-2 bg-light border"
                      onClick={() => {
                        handleDeleteData(handleSelectedRows());
                      }}
                    >
                      <i className="fas fa-trash-alt text-danger"></i>
                    </button>
                  ) : null}

                  <div className="dropdown">
                    <a
                      className="btn p-2 bg-light border"
                      href="#"
                      role="button"
                      id="dropdownMenuLink"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ti-filter"></i>
                    </a>

                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuLink"
                    >
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="all"
                          value={"ALL"}
                          name="couponStatus"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="all">All</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="active"
                          value={"ACTIVE"}
                          name="couponStatus"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="active">Active</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="expired"
                          value={"EXPIRED"}
                          name="couponStatus"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="expired">Expired</label>
                      </li>

                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="hold"
                          value={"HOLD"}
                          name="couponStatus"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="hold">Hold</label>
                      </li>

                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="pending"
                          value={"PENDING"}
                          name="couponStatus"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="pending">Pending</label>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                {/* Data Table */}
                <DataTable
                  getTableBodyProps={getTableProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
                {/* Pagination */}
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={"coupons"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
