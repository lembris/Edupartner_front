import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import ReactLoading from "react-loading";
import ReactPaginate from "react-paginate";
import { fetchData } from "../../utils/GlobalQueries";
import showToast from "../../helpers/ToastHelper";
import Select from "react-select";
import "animate.css";

const PaginatedTable = ({
  fetchPath,
  title,
  columns,
  buttons,
  onSelect,
  isRefresh,
  filters = [],
  filterSelected = ["ALL"],
  filterGroups = [],
  isFullPath = false,
  additionalFilters = {},
  fixedActions = false,
  actions = [],
  user = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [rowRecords, setRowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const pageSizeData = [10, 25, 50, 100];
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchDebounceRef = useRef(null);
  const [selectedFilters, setSelectedFilters] = useState(filterSelected);
  const [selectedFilterGroups, setSelectedFilterGroups] = useState(() =>
    filterGroups.reduce((acc, group) => {
      acc[group.group] = group.selected || [];
      return acc;
    }, {})
  );
  
  const isMounted = useRef(true);
  const lastFetchParams = useRef("");
  const doFetchRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const doFetch = useCallback(async (page, size, search, selFilters, selFilterGroups) => {
    const paramsKey = JSON.stringify({ page, size, search, selFilters, selFilterGroups });
    if (paramsKey === lastFetchParams.current) return;
    lastFetchParams.current = paramsKey;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const formattedFilterGroups = Object.entries(selFilterGroups)
        .filter(([_, values]) => values.length > 0)
        .reduce((acc, [group, values]) => {
          acc[group] = values.join(",");
          return acc;
        }, {});

      const result = await fetchData({
        url: fetchPath,
        isFullPath: isFullPath,
        filter: {
          page: page,
          page_size: size,
          paginated: true,
          search: search,
          filters: selFilters.join(","),
          ...formattedFilterGroups,
          ...additionalFilters,
        },
        signal: abortControllerRef.current.signal,
      });

      if (!isMounted.current) return;

      if (result.status === 200 || result.status === 8000 || result.status === "success") {
        setRowRecords(result.data || []);
        setError(false);
        const total = result.pagination?.total ?? (result.data ? result.data.length : 0);
        setTotalCount(total);
        
        if (debouncedSearchQuery && (!result.data || result.data.length === 0)) {
          showToast("No Records Found", "info", "Search completed");
        }
      } else {
        setRowRecords([]);
        setTotalCount(0);
        setError(true);
        showToast("Failed to fetch records", "warning", "Fetch completed");
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      
      if (!isMounted.current) return;
      console.error("Error fetching data:", err);
      setError(true);
      showToast("Unable to Fetch Records", "warning", "Failed");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [fetchPath, isFullPath, additionalFilters, debouncedSearchQuery]);

  useEffect(() => {
    doFetchRef.current = doFetch;
  }, [doFetch]);

  useEffect(() => {
    doFetch(currentPage, pageSize, debouncedSearchQuery, selectedFilters, selectedFilterGroups);
  }, [currentPage, pageSize, selectedFilters, selectedFilterGroups, doFetch, debouncedSearchQuery]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      if (isMounted.current) {
        lastFetchParams.current = "";
        setCurrentPage(1);
        setDebouncedSearchQuery(searchQuery);
      }
    }, 400);
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    if (isRefresh > 0) {
      lastFetchParams.current = "";
      doFetch(currentPage, pageSize, debouncedSearchQuery, selectedFilters, selectedFilterGroups);
    }
  }, [isRefresh]);

  useEffect(() => {
    return () => { 
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGroupFilterChange = (group, selected) => {
    const values = selected ? selected.map((opt) => opt.value) : [];
    const newGroups = { ...selectedFilterGroups, [group]: values };
    setSelectedFilterGroups(newGroups);
    setCurrentPage(1);
    lastFetchParams.current = "";
    doFetch(1, pageSize, searchQuery, selectedFilters, newGroups);
  };

  const resetAllFilters = () => {
    const cleared = {};
    filterGroups.forEach((g) => (cleared[g.group] = []));
    setSelectedFilterGroups(cleared);
    lastFetchParams.current = "";
    doFetch(1, pageSize, searchQuery, selectedFilters, cleared);
  };

  const getCellContent = (col, row, rowIndex, page, size) => {
    if (col.render) {
      const content = col.render(row, rowIndex, page, size);
      if (col.key === "SN") {
        return page * size - size + rowIndex + 1;
      }
      return content !== undefined && content !== null ? content : "N/A";
    }
    return row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : "N/A";
  };

  return (
    <div className="card">
      <div className="d-flex justify-content-between align-items-center card-header mb-1">
        <h5 className="mb-0">{title || "Presentation Table"}</h5>
        <div key="action_button_div" className="d-flex align-items-center">
          {buttons &&
            buttons.length > 0 &&
            buttons.map((button, index) =>
              button.render ? (
                <React.Fragment key={`action_button_${index}`}>
                  {button.render()}
                </React.Fragment>
              ) : (
                <button
                  key={"action_button_" + index}
                  className={`btn btn-sm ${button.className || "btn-primary"} me-2`}
                  onClick={button.onClick}
                >
                  {button.label}
                </button>
              )
            )}
        </div>
      </div>
      <div className="card-body">
        <div className="row d-flex justify-content-between align-items-center mb-2">
          {filterGroups.length > 0 && (
            <div className="row g-2 mb-2">
              {filterGroups.map((group) => (
                <div key={group.group} className="col-auto">
                  <div className="input-group">
                    <span className="input-group-text text-info">{group.label}</span>
                    <Select
                      isMulti
                      options={group.options}
                      value={group.options.filter((opt) =>
                        selectedFilterGroups[group.group]?.includes(opt.value)
                      )}
                      onChange={(selected) => handleGroupFilterChange(group.group, selected)}
                      placeholder={group.placeholder || `Select ${group.label}`}
                      classNamePrefix="react-select"
                      styles={{
                        menu: (base) => ({
                          ...base,
                          zIndex: 99999,
                          borderColor: "#17a2b8",
                        }),
                        control: (base) => ({
                          ...base,
                          minHeight: "32px",
                        }),
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="col-auto d-flex align-items-center">
                <button
                  className="btn btn-outline-info me-2"
                  onClick={resetAllFilters}
                  title="Reset All Filters"
                >
                  <i className="tf-icons bx bx-refresh"></i> Reset All
                </button>
              </div>
            </div>
          )}
            
          <div className="d-flex align-items-center col-md-8 col-sm-6 mt-2">
            <Select
              options={pageSizeData.map((size) => ({ value: size, label: `${size}` }))}
              value={{ value: pageSize, label: `${pageSize}` }}
              onChange={(selected) => {
                setPageSize(Number(selected.value));
                setCurrentPage(1);
              }}
              className="me-2"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "32px",
                  width: "95px",
                }),
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 99999,
                }),
              }}
              menuPortalTarget={document.body}
            />

            {filters.length > 0 && (
              <div className="input-group" style={{ minWidth: "250px" }}>
                <span className="input-group-text text-info">
                  <i className="tf-icons bx bx-filter-alt"></i>
                </span>
                <Select
                  isMulti
                  options={filters}
                  value={filters.filter((f) => selectedFilters?.includes(f.value))}
                  onChange={(selected) => {
                    let values = selected ? selected.map((opt) => opt.value) : [];
                    if (values.includes("ALL")) {
                      values = ["ALL"];
                      selected = filters.filter((f) => f.value === "ALL");
                    } else {
                      values = values.filter((v) => v !== "ALL");
                    }
                    setSelectedFilters(values);
                    setCurrentPage(1);
                  }}
                  placeholder="Select Filters"
                  classNamePrefix="react-select"
                  styles={{
                    menu: (base) => ({
                      ...base,
                      position: "absolute",
                      zIndex: 99999,
                      minHeight: "32px",
                      borderColor: "#17a2b8",
                    }),
                  }}
                />
              </div>
            )}           
          </div>

          <div className="col-md-4 col-sm-6 animate__animated animate__fadeInRight animate__fast">
            <form className="d-flex">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="tf-icons bx bx-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>

        <div className="table-wrapper" style={{ overflowX: 'auto', overflowY: 'visible', position: 'relative' }}>
          <table className="table table-hover table-bordered mb-0" style={{ tableLayout: 'auto', minWidth: '100%' }}>
            <thead style={{ backgroundColor: "#f1f1f1", position: 'sticky', top: 0, zIndex: 11 }}>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key || col.label || idx}
                    className={col.className || ""}
                    style={{ 
                      ...col.style, 
                      padding: '0.75rem',
                      backgroundColor: '#f1f1f1',
                      position: 'relative',
                      zIndex: 9
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th 
                    className="text-center" 
                    style={{ 
                      width: `${Math.max(actions.length * 45, 120)}px`, 
                      minWidth: `${Math.max(actions.length * 45, 120)}px`,
                      padding: '0.75rem', 
                      backgroundColor: '#f1f1f1',
                      ...(fixedActions ? {
                        position: 'sticky',
                        right: 0,
                        zIndex: 10,
                        borderLeft: '1px solid #dee2e6'
                      } : {})
                    }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="100%">
                    <div className="text-center p-4">
                      <ReactLoading type={"cylon"} color={"#696cff"} height={"30px"} width={"50px"} />
                      <p className="mt-2 text-muted">Fetching Records...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="100%">
                    <div className="alert alert-danger m-3">
                      <div className="text-center">
                        <p className="mb-0">Unable to fetch Records. Please try again later.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : rowRecords.length === 0 ? (
                <tr>
                  <td colSpan="100%">
                    <div className="text-center py-4">
                      <i className="bx bx-search-alt fs-1 text-info"></i>
                      <p className="mt-2 fw-semibold">No Records Found</p>
                      <small className="text-muted">
                        {debouncedSearchQuery || (selectedFilters?.length > 1)
                          ? "Try adjusting your search or filters"
                          : "No data available. Create a new record to get started."}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                rowRecords.map((row, rowIndex) => (
                   <tr key={row.id || rowIndex} onClick={() => onSelect && onSelect(row)}>
                     {columns.map((col, colIdx) => (
                       <td key={`${col.key || colIdx}-${rowIndex}`} className={col.className} style={{ 
                         ...col.style, 
                         padding: '0.75rem',
                         backgroundColor: 'white',
                         position: 'relative',
                         zIndex: 1
                       }}>
                         {getCellContent(col, row, rowIndex, currentPage, pageSize)}
                       </td>
                     ))}
                    {actions && actions.length > 0 && (
                      <td 
                        className="text-center" 
                        style={{ 
                          width: `${Math.max(actions.length * 45, 120)}px`,
                          minWidth: `${Math.max(actions.length * 45, 120)}px`,
                          padding: '0.5rem',
                          ...(fixedActions ? {
                            position: 'sticky',
                            right: 0,
                            zIndex: 5,
                            backgroundColor: 'white',
                            borderLeft: '1px solid #dee2e6'
                          } : {})
                        }}
                      >
                        <div className="btn-group">
                          {actions.map((action, actionIdx) => {
                            const showAction = action.condition ? action.condition(row, user) : true;
                            if (!showAction) return null;
                            return (
                              <button
                                key={actionIdx}
                                className={`btn btn-sm border-0 ${action.className || 'btn-outline-secondary'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick && action.onClick(row);
                                }}
                                title={action.label}
                              >
                                <i className={`bx ${action.icon}`}></i>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            {totalCount > 0
              ? `Showing ${currentPage * pageSize - pageSize + 1} to ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} records`
              : "No records to show"}
          </div>
          <ReactPaginate
            previousLabel={<i className="tf-icons bx bx-chevrons-left"></i>}
            nextLabel={<i className="tf-icons bx bx-chevrons-right"></i>}
            breakLabel="..."
            pageCount={Math.ceil((totalCount || 0) / (pageSize || 1))}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName="pagination justify-content-center"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            activeClassName="active"
          />
        </div>
      </div>
    </div>
  );
};

PaginatedTable.propTypes = {
  title: PropTypes.string.isRequired,
  fetchPath: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
      className: PropTypes.string,
      style: PropTypes.object,
      render: PropTypes.func,
    })
  ).isRequired,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      className: PropTypes.string,
      render: PropTypes.func,
    })
  ),
  onSelect: PropTypes.func,
  isRefresh: PropTypes.number,
  isFullPath: PropTypes.bool,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  filterSelected: PropTypes.arrayOf(PropTypes.string.isRequired),
  filterGroups: PropTypes.arrayOf(
    PropTypes.shape({
      group: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ).isRequired,
      selected: PropTypes.arrayOf(PropTypes.string),
      placeholder: PropTypes.string,
    })
  ),
  additionalFilters: PropTypes.object,
  fixedActions: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
      onClick: PropTypes.func.isRequired,
      condition: PropTypes.func,
      className: PropTypes.string,
    })
  ),
  user: PropTypes.object,
};

export default PaginatedTable;
