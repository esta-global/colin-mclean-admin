import {
  DataTable,
  GoBackButton,
  OverlayLoading,
  Pagination,
} from "../../components";
import {
  Column,
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
import { Link } from "react-router-dom";
import { deleteConfirmation, get, put, remove } from "../../utills";
import { toast } from "react-toastify";

export function MarketplaceList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [status, setStatus] = useState<boolean | string>("All");
  const [needReload, setNeedReload] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  type TableInstanceWithRowSelect<T extends object> = TableInstance<T> & {
    selectedFlatRows: Row<T>[];
  };

  useEffect(
    function () {
      async function getData() {
        setLoading(true);
        let url = `/marketplaces?page=${pagination.page}&limit=${pagination.limit}`;
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
    [pagination.page, pagination.limit, searchQuery, needReload, status],
  );

  type Record = {
    title: string;
    slug: string;
    createdAt: string;
    status: any;
    id: string;
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
        Header: "MARKETPLACE",
        accessor: "title",
        Cell: ({ row, value }: any) => {
          return (
            <div className="marketplace-name-cell">
              <strong>{value}</strong>
              <span>{row.original.slug}</span>
            </div>
          );
        },
      },
      {
        Header: "CREATED AT",
        accessor: "createdAt",
        Cell: ({ value }: any) => moment(new Date(value)).format("DD-MM-YYYY"),
      },
      {
        Header: "STATUS",
        accessor: "status",
        Cell: ({ value }: any) => {
          return (
            <div className="marketplace-status-cell">
              <span
                className={`marketplace-status-pill ${
                  value?.status ? "is-active" : "is-disabled"
                }`}
              >
                {value?.status ? "Active" : "Disabled"}
              </span>
              <input
                className="form-check-input custom-switch marketplace-status-switch"
                type="checkbox"
                role="switch"
                id="customSwitch"
                checked={value?.status === true ? true : false}
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
            <div className="marketplace-action-cell">
              <Link
                className="marketplace-icon-action"
                to={{ pathname: `/marketplaces/edit/${value}` }}
                title="Edit marketplace"
              >
                <span className="fas fa-pencil-alt" aria-hidden="true"></span>
              </Link>

              <button
                type="button"
                className="btn marketplace-icon-action marketplace-icon-action--danger"
                data-toggle="modal"
                data-target="#deleteModal"
                title="Delete marketplace"
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
        title: data.title,
        slug: data.slug,
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
      useRowSelect,
    ) as TableInstanceWithRowSelect<Record>;

  async function handleDeleteData(recordId: string | string[]) {
    const { isConfirmed } = await deleteConfirmation();
    if (!isConfirmed) return;

    let apiResponse = null;
    if (Array.isArray(recordId)) {
      apiResponse = await remove(`/marketplaces`, recordId);
    } else {
      apiResponse = await remove(`/marketplaces/${recordId}`);
    }

    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => !old);
    } else {
      toast.error(apiResponse?.message);
    }
  }

  function handleSelectedRows(): string[] {
    return selectedFlatRows.map((row: any) => row?.original?.id);
  }

  function handleSetStatus(
    evt: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setStatus(evt.target.value);
  }

  async function handleUpdateStatus(id: string, value: boolean) {
    const apiResponse = await put(`/marketplaces/${id}`, { status: value });
    if (apiResponse?.status == 200) {
      toast.success(apiResponse?.message);
      setNeedReload((old) => !old);
    } else {
      toast.error(apiResponse?.message);
    }
  }

  return (
    <div className="content-wrapper marketplace-admin-page">
      {loading ? <OverlayLoading /> : null}

      <div className="marketplace-page-header">
        <div>
          <div className="marketplace-page-header__actions">
              <GoBackButton />
            <span className="marketplace-page-eyebrow">
              IFMA Workspace
            </span>
          </div>
          <h1>Marketplaces</h1>
          <p>Manage connected selling channels and storefront availability.</p>
        </div>
        <Link
          to={"/marketplaces/add"}
          type="button"
          className="btn btn-primary marketplace-primary-action"
        >
          Add Marketplace
        </Link>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card ">
          <div className="card marketplace-table-card">
            <div className="marketplace-toolbar">
              <div className="marketplace-search-wrap">
                <i className="ti-search"></i>
                  <input
                  placeholder="Search marketplaces, slugs"
                  className="form-control"
                    type="search"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(evt.target.value)
                    }
                  />
              </div>
              <div className="marketplace-toolbar-actions">
                  {selectedFlatRows.length ? (
                    <button
                    type="button"
                    className="marketplace-bulk-delete"
                    title="Delete selected"
                      onClick={() => {
                        handleDeleteData(handleSelectedRows());
                      }}
                    >
                      <i className="fas fa-trash-alt text-danger"></i>
                    </button>
                  ) : null}

                <select
                  className="form-control marketplace-status-select"
                  value={String(status)}
                  onChange={handleSetStatus}
                  aria-label="Filter marketplaces by status"
                >
                  <option value="All">All status</option>
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
            <div className="card-body shadow-none">
              <div className="table-responsive marketplace-table-wrap">
                <DataTable
                  getTableBodyProps={getTableProps}
                  getTableProps={getTableProps}
                  headerGroups={headerGroups}
                  rows={rows}
                  prepareRow={prepareRow}
                />
              </div>
              <div className="marketplace-pagination-wrap">
                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  tableName={"table-to-xls"}
                  csvFileName={"marketplaces"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
