import React, { useState, useMemo, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import './UdiTable.css';

const UdiTable = forwardRef(({ 
  onDataRequest = null, // 外部傳入的 callback 函數
  columns = [], 
  pageSize = 10, 
  sortable = true, 
  filterable = true,
  className = '',
  isDev = false,
  syncTableControl=false,
  currentTableRef={currentTableRef},
  name = null,
  setTablePage
}, ref) => {
  // 內部狀態管理
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [scrollPosition, setScrollPosition] = useState({ top: 0, left: 0, verticalPercent: 0, horizontalPercent: 0 });
  const [scrollbarInfo, setScrollbarInfo] = useState({ hasHorizontal: false, hasVertical: false, maxScrollLeft: 0, maxScrollTop: 0 });
  const tableWrapperRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // 內部執行外部 callback 的函數
  const executeDataRequest = useCallback(async (params) => {
    if (!onDataRequest || hasFetchedData) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onDataRequest(params);
      const data = Array.isArray(result.data) ? result.data : [];
      if (isInfiniteScroll) {
        setData((prevData) => [...prevData, ...data]);
      } else {
        setData(data);
      }

      setTotalCount(result.totalCount || 0);
      setHasFetchedData(true);
    } catch (err) {
      console.error('❌ Callback Error:', err);
      setError(err.message);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [onDataRequest, isInfiniteScroll, hasFetchedData]);

  // 防抖的請求執行
  const debouncedDataRequest = useMemo(() => {
    let timeoutId;
    return (params) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        executeDataRequest(params);
      }, 300);
    };
  }, [executeDataRequest]);

  useEffect(() => {
    setTablePage((prev) => {
      return { ...prev, [`${name}Page`]: currentPage ,[`${name}PageSize`]: currentPageSize };
    });
  }, [currentPageSize, currentPage]);

  // 暴露給外部的方法
  useImperativeHandle(ref, () => ({
    // 執行數據請求的函數 - 這是外部會調用的主要函數
    executeRequest: (customParams = {}) => {
      const params = {
        page: currentPage,
        pageSize: currentPageSize,
        search: filterText,
        searchColumn: filterColumn,
        advancedFilters: advancedFilters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...customParams
      };
      executeDataRequest(params);
    },
    // 重新載入（使用當前參數）
    reload: () => {
      const params = {
        page: currentPage,
        pageSize: currentPageSize,
        search: filterText,
        searchColumn: filterColumn,
        advancedFilters: advancedFilters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      executeDataRequest(params);
    },
    // 重置篩選並執行請求
    resetFilters: () => {
      setFilterText('');
      setFilterColumn('all');
      setAdvancedFilters({});
      setCurrentPage(1);
      setSortConfig({ key: null, direction: 'asc' });
      
      // 重置後立即執行請求
      const params = {
        page: 1,
        pageSize: currentPageSize,
        search: '',
        searchColumn: 'all',
        advancedFilters: {},
        sortBy: null,
        sortOrder: 'asc'
      };
      executeDataRequest(params);
    },
    setPage: (page) => {
      setCurrentPage(page);

    },
    setPageSize: (size) => {
      setCurrentPageSize(size);
      setCurrentPage(1);
    },
    // 完整的狀態 API - 提供所有詳細信息
    getState: () => ({
      // 基本數據狀態
      data,
      loading,
      error,
      totalCount,
      tableWrapperRef: tableWrapperRef.current,
      tableName:name,
      
      // 分頁狀態
      pagination: {
        currentPage,
        pageSize: currentPageSize,
        totalPages: Math.ceil(totalCount / currentPageSize),
        hasNextPage: currentPage < Math.ceil(totalCount / currentPageSize),
        hasPreviousPage: currentPage > 1,
        startIndex: (currentPage - 1) * currentPageSize + 1,
        endIndex: Math.min(currentPage * currentPageSize, totalCount),
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === Math.ceil(totalCount / currentPageSize)
      },
      
      // 滾動狀態
      scroll: {
        position: scrollPosition,
        scrollbar: scrollbarInfo,
        isAtTop: scrollPosition.verticalPercent === 0,
        isAtBottom: scrollPosition.verticalPercent === 100,
        isAtLeft: scrollPosition.horizontalPercent === 0,
        isAtRight: scrollPosition.horizontalPercent === 100,
        canScrollVertically: scrollbarInfo.hasVertical,
        canScrollHorizontally: scrollbarInfo.hasHorizontal
      },
      
      // 排序狀態
      sort: {
        sortConfig,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        isSorted: sortConfig.key !== null
      },
      
      // 篩選狀態
      filter: {
        filterText,
        filterColumn,
        advancedFilters,
        showAdvancedFilter,
        hasBasicFilter: filterText !== '' || filterColumn !== 'all',
        hasAdvancedFilter: Object.keys(advancedFilters).length > 0,
        hasAnyFilter: filterText !== '' || filterColumn !== 'all' || Object.keys(advancedFilters).length > 0,
        activeFiltersCount: Object.keys(advancedFilters).filter(key => advancedFilters[key]).length + (filterText ? 1 : 0)
      },
      
      // 表格配置狀態
      config: {
        sortable,
        filterable,
        className,
        isDev,
        columnsCount: columns.length,
        columns: columns.map(col => ({
          dataField: col.dataField,
          title: col.title,
          width: col.width,
          sortable: sortable
        }))
      },
      
      // 響應式狀態
      responsive: {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      },
      
      // 元數據
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        componentName: 'UdiTable'
      },
      
      isHovered,
    }),

    // 簡化版狀態 API - 只返回核心信息
    getCoreState: () => ({
      currentPage,
      totalPages: Math.ceil(totalCount / currentPageSize),
      totalCount,
      pageSize: currentPageSize,
      loading,
      error,
      scrollPosition,
      hasData: data.length > 0
    }),
    
    // 滾動位置 API
    getScrollState: () => ({
      ...scrollPosition,
      ...scrollbarInfo,
      isAtTop: scrollPosition.verticalPercent === 0,
      isAtBottom: scrollPosition.verticalPercent === 100,
      isAtLeft: scrollPosition.horizontalPercent === 0,
      isAtRight: scrollPosition.horizontalPercent === 100
    }),
    
    // 分頁狀態 API
    getPaginationState: () => ({
      currentPage,
      totalPages: Math.ceil(totalCount / currentPageSize),
      pageSize: currentPageSize,
      totalCount,
      hasNextPage: currentPage < Math.ceil(totalCount / currentPageSize),
      hasPreviousPage: currentPage > 1,
      startIndex: (currentPage - 1) * currentPageSize + 1,
      endIndex: Math.min(currentPage * currentPageSize, totalCount)
    }),
    
    // 篩選狀態 API
    getFilterState: () => ({
      filterText,
      filterColumn,
      advancedFilters,
      showAdvancedFilter,
      hasAnyFilter: filterText !== '' || filterColumn !== 'all' || Object.keys(advancedFilters).length > 0
    }),
    
    // 排序狀態 API
    getSortState: () => ({
      ...sortConfig,
      isSorted: sortConfig.key !== null
    }),

    // 滾動控制 API
    scrollControl,
    tableWrapperRef: tableWrapperRef.current,
  }), [
    data, loading, totalCount, error, currentPage, currentPageSize,
    sortConfig, filterText, filterColumn, advancedFilters, showAdvancedFilter,
    scrollPosition, scrollbarInfo, isMobile, isTablet, sortable, filterable, className, isDev, columns,
    executeDataRequest
  ]);

  // 初始載入
  useEffect(() => {
    if (onDataRequest) {
      const params = {
        page: 1,
        pageSize: currentPageSize,
        search: '',
        searchColumn: 'all',
        advancedFilters: {},
        sortBy: null,
        sortOrder: 'asc'
      };
      executeDataRequest(params);
    }
  }, [onDataRequest, executeDataRequest]);

  // 監聽篩選和排序變化
  useEffect(() => {
    if (!onDataRequest) return;
    
    const params = {
      page: currentPage,
      pageSize: currentPageSize,
      search: filterText,
      searchColumn: filterColumn,
      advancedFilters: advancedFilters,
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction
    };
    
    debouncedDataRequest(params);
  }, [onDataRequest, currentPage, currentPageSize, filterText, filterColumn, advancedFilters, sortConfig, debouncedDataRequest]);

  // 計算總頁數
  const totalPages = Math.ceil(totalCount / currentPageSize);

  // 檢測螢幕尺寸
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 992);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 滾動事件處理（使用 throttle）
  useEffect(() => {
    const tableWrapper = tableWrapperRef.current;
    if (!tableWrapper) return;

    // 更新滾動條信息
    const updateScrollbarInfo = () => {
      const hasHorizontal = tableWrapper.scrollWidth > tableWrapper.clientWidth;
      const hasVertical = tableWrapper.scrollHeight > tableWrapper.clientHeight;
      const maxScrollLeft = Math.max(0, tableWrapper.scrollWidth - tableWrapper.clientWidth);
      const maxScrollTop = Math.max(0, tableWrapper.scrollHeight - tableWrapper.clientHeight);
      
      setScrollbarInfo({
        hasHorizontal,
        hasVertical,
        maxScrollLeft,
        maxScrollTop,
        scrollWidth: tableWrapper.scrollWidth,
        scrollHeight: tableWrapper.scrollHeight,
        clientWidth: tableWrapper.clientWidth,
        clientHeight: tableWrapper.clientHeight
      });
    };

    // 初始化滾動條信息
    updateScrollbarInfo();

    let isThrottled = false;
    const handleScroll = (event) => {
      if (isThrottled) return;
      
      isThrottled = true;
      requestAnimationFrame(() => { //browser api  > 每次滾动事件(rerender)使用 requestAnimationFrame
        const target = event.target;
        const scrollTop = target.scrollTop;
        const scrollLeft = target.scrollLeft;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;
        const scrollWidth = target.scrollWidth;
        const clientWidth = target.clientWidth;
        
        // 計算滾動百分比
        const verticalScrollPercent = scrollHeight > clientHeight 
          ? ((scrollTop / (scrollHeight - clientHeight)) * 100)
          : 0;
        
        const horizontalScrollPercent = scrollWidth > clientWidth
          ? ((scrollLeft / (scrollWidth - clientWidth)) * 100)
          : 0;

        setScrollPosition({
          top: scrollTop,
          left: scrollLeft,
          verticalPercent: parseFloat(verticalScrollPercent.toFixed(1)),
          horizontalPercent: parseFloat(horizontalScrollPercent.toFixed(1))
        });

        // 更新滾動條信息（以防表格尺寸發生變化）
        updateScrollbarInfo();

        isThrottled = false;
      });
    };

    // 監聽窗口大小變化
    const handleResize = () => {
      updateScrollbarInfo();
    };

    tableWrapper.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // 使用 ResizeObserver 監聽表格內容變化（如果支援的話）
    let resizeObserver;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateScrollbarInfo();
      });
      resizeObserver.observe(tableWrapper);
    }

    return () => {
      tableWrapper.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [data]); // 當數據變化時重新初始化



  // 排序處理
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    setSortConfig(prev => {
      let direction = 'asc';
      if (prev.key === key && prev.direction === 'asc') {
        direction = 'desc';
      }
      return { key, direction };
    });
    
    setCurrentPage(1);
  }, [sortable]);

  // 分頁處理
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // 重置篩選
  const resetFilter = useCallback(() => {
    setFilterText('');
    setFilterColumn('all');
    setAdvancedFilters({});
    setCurrentPage(1);
  }, []);

  // 處理進階篩選變更
  const handleAdvancedFilterChange = useCallback((columnKey, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1);
  }, []);

  // 清除進階篩選
  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({});
    setCurrentPage(1);
  }, []);

  // 切換進階篩選顯示
  const toggleAdvancedFilter = useCallback(() => {
    setShowAdvancedFilter(prev => !prev);
  }, []);
  

  // 處理每頁顯示數量變更
  const handlePageSizeChange = useCallback((newPageSize) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // 滾動控制函數
  const scrollControl = useCallback((axis, value) => {
    const tableWrapper = tableWrapperRef.current;
    if (!tableWrapper) return;

    const maxScrollTop = tableWrapper.scrollHeight - tableWrapper.clientHeight;
    const maxScrollLeft = tableWrapper.scrollWidth - tableWrapper.clientWidth;

    const scrollValue = axis === 'top' ? Math.min(value, maxScrollTop) : Math.min(value, maxScrollLeft);

    if (axis === 'top') {
      tableWrapper.scrollTop = scrollValue;
    } else {
      tableWrapper.scrollLeft = scrollValue;
    }
  }, []);

  // Add hover detection
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (syncTableControl && currentTableRef) {
      currentTableRef.current = tableWrapperRef.current;
    }
  };

  const handleMouseLeave = () => {
    if (!isDropdownOpen) {
      setIsHovered(false);
    }
  };

  // Handle infinite scroll toggle
  const toggleInfiniteScroll = useCallback(() => {
    setIsInfiniteScroll((prev) => !prev);
  }, []);

  const debouncedHandlePageChange = useMemo(() => {
    let timeoutId;
    return (newPage) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (newPage <= totalPages) {
          handlePageChange(newPage);
        }
      }, 300);
    };
  }, [handlePageChange, totalPages]);

  useEffect(() => {
    if (isInfiniteScroll) {
      const tableWrapper = tableWrapperRef.current;
      if (!tableWrapper) return;
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = tableWrapper;
        const verticalScrollPercent = scrollHeight > clientHeight 
          ? ((scrollTop / (scrollHeight - clientHeight)) * 100) 
          : 0;

        if (verticalScrollPercent >= 80 && currentPage < totalPages) {
          debouncedHandlePageChange(currentPage + 1);
        }
      };

      tableWrapper.addEventListener("scroll", handleScroll);

      return () => {
        tableWrapper.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isInfiniteScroll, currentPage, totalPages, debouncedHandlePageChange]);

  // Dropdown focus and blur handlers
  const handleDropdownFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownBlur = () => {
    setIsDropdownOpen(false);
  };

  return (
    <>
    {/* 表格名稱 */}
      {name && (
        <div className="udi-table-name">
          <h3>{name}</h3>
        </div>
      )}
    <div
      className={`udi-table-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 錯誤顯示 */}
      {error && (
        <div className="error-message">
          ❌ 載入失敗: {error}
        </div>
      )}
      

      {/* 搜尋篩選器 */}
      {filterable && (
        <div className="udi-table-filter">
          <div className="filter-section">
            <div className="basic-filter">
              <div className="filter-column-selector">
                <label htmlFor="filterColumn">搜尋欄位：</label>
                <select
                  id="filterColumn"
                  value={filterColumn}
                  onChange={(e) => {
                    setFilterColumn(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-column-select"
                >
                  <option value="all">全部欄位</option>
                  {columns.map((column) => (
                    <option key={column.dataField} value={column.dataField}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder={filterColumn === 'all' ? '搜尋所有欄位...' : `搜尋 ${columns.find(col => col.key === filterColumn)?.title || ''}...`}
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-input"
              />
              <button onClick={toggleAdvancedFilter} className="advanced-filter-toggle">
                {showAdvancedFilter ? '隱藏進階篩選' : '進階篩選'}
              </button>
              {(filterText || filterColumn !== 'all' || Object.keys(advancedFilters).length > 0) && (
                <button onClick={resetFilter} className="reset-button">
                  重置所有篩選
                </button>
              )}
            </div>
            
            {/* 進階篩選區域 */}
            {showAdvancedFilter && (
              <div className="advanced-filter">
                <div className="advanced-filter-header">
                  <h4>進階篩選 - 多欄位同時篩選</h4>
                  {Object.keys(advancedFilters).length > 0 && (
                    <button onClick={clearAdvancedFilters} className="clear-advanced-button">
                      清除進階篩選
                    </button>
                  )}
                </div>
                <div className="advanced-filter-grid">
                  {columns.map((column) => (
                    <div key={column.dataField} className="advanced-filter-item">
                      <label htmlFor={`advanced-${column.dataField}`}>{column.title}：</label>
                      <input
                        id={`advanced-${column.dataField}`}
                        type="text"
                        placeholder={`篩選 ${column.title}...`}
                        value={advancedFilters[column.dataField] || ''}
                        onChange={(e) => handleAdvancedFilterChange(column.dataField, e.target.value)}
                        className="advanced-filter-input"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 滾動位置顯示器 */}
      {isDev && (
        <div className="scroll-position-indicator">
          <div>滾動位置: 垂直 {scrollPosition.verticalPercent.toFixed(1)}% | 水平 {scrollPosition.horizontalPercent.toFixed(1)}%</div>
          <div>分頁: {currentPage}/{Math.ceil(totalCount / currentPageSize)} | 總筆數: {totalCount}</div>
          <div>滾動條: {scrollbarInfo.hasVertical ? '垂直✓' : '垂直✗'} | {scrollbarInfo.hasHorizontal ? '水平✓' : '水平✗'}</div>
          <div>螢幕: {isMobile ? '手機' : isTablet ? '平板' : '桌面'} ({window.innerWidth}x{window.innerHeight})</div>
        </div>
      )}

      {/* 表格 */}
      <div className="udi-table-wrapper-container" style={{ position: 'relative' }}>
        <div className="udi-table-wrapper" ref={tableWrapperRef}>
          <table className="udi-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.dataField}
                    onClick={() => handleSort(column.dataField)}
                    className={`
                      ${sortable ? 'sortable' : ''}
                      ${sortConfig.key === column.dataField ? 'sorted' : ''}
                      ${sortConfig.key === column.dataField ? sortConfig.direction : ''}
                    `}
                    style={{ width: column.width, minWidth: column.minWidth }}
                  >
                    <div className="th-content">
                      <span>
                        {column.title}
                      </span>
                      {sortable && (
                        <span className="sort-icon">
                          {sortConfig.key === column.dataField ? (
                            sortConfig.direction === 'asc' ? '↑' : '↓'
                          ) : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="loading-state">
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <span>loading...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, rowIndex) => {
                  return (
                    <tr key={`row-${rowIndex}-${row.id || ""}`}>
                      {columns.map((column, colIndex) => (
                        <td
                          key={`cell-${rowIndex}-${colIndex}-${column.dataField}`}
                          title={
                            row[column.dataField]
                          } // Add title attribute for tooltip
                        >
                          {column.render
                            ? column.render(
                                row[column.dataField],
                                row,
                                rowIndex,
                                column.dataField,
                                name
                              )
                            : row[column.dataField]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) 
              : (
                <tr>
                  <td colSpan={columns.length} className="no-data">
                    沒有資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* 分頁控制 */}
      <div className="udi-table-pagination">
        <div className="pagination-info">
          <div className="page-size-selector">
            <label htmlFor="pageSize">每頁顯示：</label>
            <div className="page-size-container" onMouseEnter={handleMouseEnter}>
              <select 
                id="pageSize"
                value={currentPageSize} 
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                onFocus={handleDropdownFocus}
                onBlur={handleDropdownBlur}
                className="page-size-select"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <span>筆</span>
          </div>
          <div className="pagination-summary">
            共 {totalCount} 筆資料{totalPages > 1 ? `，第 ${currentPage} / ${totalPages} 頁` : ''}
          </div>
        </div>
        
        {/* 分頁控制按鈕 */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            {/* 手機模式下只顯示上一頁、當前頁和下一頁 */}
            {isMobile ? (
              <>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  ‹
                </button>
                <span className="current-page-mobile">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  ›
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  首頁
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  上一頁
                </button>
                
                {/* 頁碼按鈕 */}
                {(() => {
                  const pages = [];
                  
                  // 計算要顯示的三個頁碼
                  let centerPage = currentPage;
                  let startPage = Math.max(1, centerPage - 1);
                  let endPage = Math.min(totalPages, startPage + 2);
                  
                  // 如果右邊不足3個，向左調整
                  if (endPage - startPage < 2) {
                    startPage = Math.max(1, endPage - 2);
                  }
                  
                  // 固定顯示3個按鈕
                  for (let i = 0; i < 3; i++) {
                    const pageNum = startPage + i;
                    const isValidPage = pageNum <= totalPages;
                    
                    pages.push(
                      <button
                        key={`page-btn-${i}`}
                        onClick={() => isValidPage ? handlePageChange(pageNum) : null}
                        disabled={!isValidPage}
                        className={`pagination-button ${
                          isValidPage && currentPage === pageNum ? 'active' : ''
                        } ${!isValidPage ? 'disabled' : ''}`}
                      >
                        {isValidPage ? pageNum : '-'}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  下一頁
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  末頁
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Infinite Scroll Toggle Button */}
      {isDev && (
        <button
          onClick={toggleInfiniteScroll}
          className="toggle-infinite-scroll-button"
        >
          {isInfiniteScroll ? "切換到手動分頁" : "切換到無限滾動"}
        </button>
      )}
    </div>
    </>
  );
});

UdiTable.displayName = 'UdiTable';

export default UdiTable;