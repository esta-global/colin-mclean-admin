import type { Key, ReactNode } from "react";

type TablePropBag = {
  key?: Key;
  [key: string]: unknown;
};

type DataTableColumn = {
  getHeaderProps: (props?: TablePropBag) => TablePropBag;
  getSortByToggleProps: () => TablePropBag;
  render: (section: string) => ReactNode;
  disableSortBy?: boolean;
  isSorted?: boolean;
  isSortedDesc?: boolean;
};

type DataTableHeaderGroup = {
  getHeaderGroupProps: () => TablePropBag;
  headers: DataTableColumn[];
};

type DataTableCell = {
  getCellProps: () => TablePropBag;
  render: (section: string) => ReactNode;
};

type DataTableRow = {
  getRowProps: () => TablePropBag;
  cells: DataTableCell[];
};

type DataTableProps = {
  headerGroups: DataTableHeaderGroup[];
  getTableProps: () => TablePropBag;
  rows: DataTableRow[];
  getTableBodyProps: () => TablePropBag;
  prepareRow: (row: DataTableRow) => void;
};

export function DataTable(props: DataTableProps) {
  const { headerGroups, getTableProps, rows, getTableBodyProps, prepareRow } =
    props;

  function splitKey(tableProps: TablePropBag) {
    const { key, ...restProps } = tableProps;
    return { key, restProps };
  }

  function getSortIndicator(column: DataTableColumn) {
    if (column.disableSortBy) return null;

    return (
      <span
        className={`ss-sort-indicator ${
          column.isSorted ? "is-sorted" : "is-unsorted"
        } ${column.isSortedDesc ? "is-desc" : "is-asc"}`}
        aria-hidden="true"
      >
        <span className="ss-sort-indicator__up" />
        <span className="ss-sort-indicator__down" />
      </span>
    );
  }

  return (
    <table id="table-to-xls" {...getTableProps()} className="table my-0">
      <thead>
        {headerGroups.map((headerGroup) => {
          const headerGroupProps = splitKey(headerGroup.getHeaderGroupProps());
          return (
            <tr key={headerGroupProps.key} {...headerGroupProps.restProps}>
              {headerGroup.headers.map((column) => {
                const headerProps = splitKey(
                  column.getHeaderProps(column.getSortByToggleProps()),
                );

                return (
                  <th key={headerProps.key} {...headerProps.restProps}>
                    <span className="ss-table-header-label">
                      {column.render("Header")}
                      {getSortIndicator(column)}
                    </span>
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          const rowProps = splitKey(row.getRowProps());

          return (
            <tr key={rowProps.key} {...rowProps.restProps}>
              {row.cells.map((cell) => {
                const cellProps = splitKey(cell.getCellProps());
                return (
                  <td key={cellProps.key} {...cellProps.restProps}>
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
