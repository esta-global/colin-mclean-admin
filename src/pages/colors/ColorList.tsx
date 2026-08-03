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
import { deleteConfirmation, get, put, remove } from "../../utills";
import { toast } from "react-toastify";
import { FILE_URL } from "../../constants";

export function ColorList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<boolean | string>("");
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
        let url = `/colors?page=${pagination.page}&limit=${pagination.limit}`;
        if (searchQuery) url += `&searchQuery=${searchQuery}`;
        if (status) url += `&status=${status}`;

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
    [pagination.page, pagination.limit, searchQuery, needReload, status]
  );

  async function handleUpdateStatus(id: string, value: boolean) {
    let url = `/colors/${id}`;

    const apiResponse = await put(url, { status: value });
    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => {
        return !old;
      });
    } else {
      toast.error(apiResponse?.message);
    }
  }

  type Record = {
    name: string;
    code: any;
    createdAt: string;
    status: any;
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
        Header: "",
        accessor: "code",
        disableSortBy: true,
        Cell: ({ value }: any) => {
          if (value.image) {
            return (
              <div
                className=""
                style={{
                  border: "1px solid#5a5a5a",
                  borderRadius: "5px",
                  height: "45px",
                  width: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  style={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%",
                    background: `linear-gradient(to bottom, ${value.code} 50%, ${value.anotherCode} 50%)`,
                  }}
                  src={`${FILE_URL}/${value.image}`}
                />
              </div>
            );
          }

          if (value.anotherCode) {
            return (
              <div
                className=""
                style={{
                  border: "1px solid#5a5a5a",
                  borderRadius: "5px",
                  height: "45px",
                  width: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%",
                    background: `linear-gradient(to bottom, ${value.code} 50%, ${value.anotherCode} 50%)`,
                  }}
                ></div>
              </div>
            );
          } else {
            return (
              <div
                className=""
                style={{
                  border: "1px solid #5a5a5a",
                  borderRadius: "5px",
                  height: "45px",
                  width: "45px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    height: "40px",
                    width: "40px",
                    background: value.code,
                    borderRadius: "20px",
                  }}
                ></div>
              </div>
            );
          }
        },
      },

      {
        Header: "NAME",
        accessor: "name",
      },

      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => {
          return moment(new Date(value)).format("DD-MM-YYYY");
        },
      },
      {
        Header: "STATUS",
        accessor: "status",
        Cell: ({ value }: any) => {
          return (
            <div className="form-check form-switch ms-5">
              <input
                className="form-check-input custom-switch"
                type="checkbox"
                role="switch"
                id="customSwitch"
                checked={value?.status === true ? true : false}
                style={{ width: "3rem", height: "1.5rem" }}
                onChange={(evt) => {
                  handleUpdateStatus(value?._id, evt.target.checked);
                }}
              />
            </div>
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
                  pathname: `/colors/edit/${value}`,
                }}
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

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
    []
  );

  const data = React.useMemo(() => {
    return records.map((data) => {
      return {
        name: data.name,
        code: data,
        createdAt: data.createdAt,
        status: data,
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
      useRowSelect
    ) as TableInstanceWithRowSelect<Record>;

  // handleDeleteData
  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();

    if (!isConfirmed) {
      return;
    }

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/colors`, recordId);
    } else {
      apiResponse = await remove(`/colors/${recordId}`);
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
    setStatus(evt.target.value);
  }

  // listening for shortcut
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if the Shift key and "A" key are pressed
      if (event.altKey && event.key === "=") {
        navigate("/colors/add");
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <GoBackButton />
              <h4 className="font-weight-bold mb-0">Color List</h4>
            </div>
            <div>
              <Link
                title="Alt + '+'"
                to={"/colors/add"}
                type="button"
                className="btn btn-primary text-light"
              >
                <i className="ti-plus"></i>
                Add Color
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
                <div className="col-8">
                  <input
                    placeholder="Serach..."
                    className="form-control py-2"
                    type="serach"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  />
                </div>
                <div className="col-4 d-flex gap-2 justify-content-end">
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
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="all">All</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="active"
                          value={"true"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="active">Active</label>
                      </li>
                      <li className="d-flex px-3 gap-2">
                        <input
                          type="radio"
                          id="disabled"
                          value={"false"}
                          name="status"
                          onChange={handleSetStatus}
                        />
                        <label htmlFor="disabled">Disabled</label>
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
