import React, { useRef, useEffect, useState } from 'react';
import UdiTable from './UdiTable';

/**
 * UdiTable API 使用示例
 * 展示如何獲取表格的所有狀態信息
 */
const UdiTableApiExample = () => {
  const tableRef = useRef(null);
  const [tableState, setTableState] = useState(null);
  const [updateInterval, setUpdateInterval] = useState(null);

  // 模擬數據
  const columns = [
    { dataField: 'id', title: 'ID', width: '80px' },
    { dataField: 'name', title: '姓名', width: '120px' },
    { dataField: 'email', title: '電子郵件', width: '200px' },
    { dataField: 'department', title: '部門', width: '150px' },
    { dataField: 'position', title: '職位', width: '120px' },
    { dataField: 'phone', title: '電話', width: '120px' },
    { dataField: 'address', title: '地址', width: '300px' }
  ];

  // 模擬數據請求
  const handleDataRequest = async (params) => {
    console.log('📊 數據請求參數:', params);
    
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成模擬數據
    const mockData = Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      name: `員工${index + 1}`,
      email: `employee${index + 1}@company.com`,
      department: ['技術部', '業務部', '人事部', '財務部'][index % 4],
      position: ['工程師', '主管', '專員', '經理'][index % 4],
      phone: `09${Math.random().toString().substr(2, 8)}`,
      address: `台北市信義區信義路${index + 1}號`
    }));

    return {
      data: mockData.slice(
        (params.page - 1) * params.pageSize,
        params.page * params.pageSize
      ),
      totalCount: mockData.length
    };
  };

  // 獲取完整狀態
  const getFullState = () => {
    if (tableRef.current) {
      const state = tableRef.current.getState();
      setTableState(state);
      console.log('🔍 完整表格狀態:', state);
    }
  };

  // 獲取核心狀態
  const getCoreState = () => {
    if (tableRef.current) {
      const coreState = tableRef.current.getCoreState();
      console.log('⭐ 核心狀態:', coreState);
    }
  };

  // 獲取滾動狀態
  const getScrollState = () => {
    if (tableRef.current) {
      const scrollState = tableRef.current.getScrollState();
      console.log('📜 滾動狀態:', scrollState);
    }
  };

  // 獲取分頁狀態
  const getPaginationState = () => {
    if (tableRef.current) {
      const paginationState = tableRef.current.getPaginationState();
      console.log('📄 分頁狀態:', paginationState);
    }
  };

  // 獲取篩選狀態
  const getFilterState = () => {
    if (tableRef.current) {
      const filterState = tableRef.current.getFilterState();
      console.log('🔍 篩選狀態:', filterState);
    }
  };

  // 獲取排序狀態
  const getSortState = () => {
    if (tableRef.current) {
      const sortState = tableRef.current.getSortState();
      console.log('🔄 排序狀態:', sortState);
    }
  };

  // 開始/停止自動更新狀態
  const toggleAutoUpdate = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      setUpdateInterval(null);
      console.log('⏹️ 停止自動更新狀態');
    } else {
      const interval = setInterval(() => {
        getFullState();
      }, 2000);
      setUpdateInterval(interval);
      console.log('▶️ 開始自動更新狀態 (每2秒)');
    }
  };

  // 清理定時器
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [updateInterval]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>UdiTable API 使用示例</h2>
      
      {/* API 控制按鈕 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={getFullState} style={buttonStyle}>
          📊 獲取完整狀態
        </button>
        <button onClick={getCoreState} style={buttonStyle}>
          ⭐ 獲取核心狀態
        </button>
        <button onClick={getScrollState} style={buttonStyle}>
          📜 獲取滾動狀態
        </button>
        <button onClick={getPaginationState} style={buttonStyle}>
          📄 獲取分頁狀態
        </button>
        <button onClick={getFilterState} style={buttonStyle}>
          🔍 獲取篩選狀態
        </button>
        <button onClick={getSortState} style={buttonStyle}>
          🔄 獲取排序狀態
        </button>
        <button 
          onClick={toggleAutoUpdate} 
          style={{
            ...buttonStyle,
            backgroundColor: updateInterval ? '#dc3545' : '#28a745'
          }}
        >
          {updateInterval ? '⏹️ 停止自動更新' : '▶️ 開始自動更新'}
        </button>
      </div>

      {/* 狀態顯示區域 */}
      {tableState && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          border: '1px solid #dee2e6'
        }}>
          <h4>即時狀態資訊</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            <div>
              <strong>分頁狀態：</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>當前頁: {tableState.pagination.currentPage}</li>
                <li>總頁數: {tableState.pagination.totalPages}</li>
                <li>每頁筆數: {tableState.pagination.pageSize}</li>
                <li>總筆數: {tableState.totalCount}</li>
                <li>顯示範圍: {tableState.pagination.startIndex}-{tableState.pagination.endIndex}</li>
              </ul>
            </div>
            
            <div>
              <strong>滾動狀態：</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>垂直滾動: {tableState.scroll.position.verticalPercent}%</li>
                <li>水平滾動: {tableState.scroll.position.horizontalPercent}%</li>
                <li>可垂直滾動: {tableState.scroll.canScrollVertically ? '是' : '否'}</li>
                <li>可水平滾動: {tableState.scroll.canScrollHorizontally ? '是' : '否'}</li>
                <li>在頂部: {tableState.scroll.isAtTop ? '是' : '否'}</li>
                <li>在底部: {tableState.scroll.isAtBottom ? '是' : '否'}</li>
              </ul>
            </div>

            <div>
              <strong>篩選狀態：</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>篩選文字: "{tableState.filter.filterText}"</li>
                <li>篩選欄位: {tableState.filter.filterColumn}</li>
                <li>啟用進階篩選: {tableState.filter.showAdvancedFilter ? '是' : '否'}</li>
                <li>有任何篩選: {tableState.filter.hasAnyFilter ? '是' : '否'}</li>
                <li>啟用篩選數: {tableState.filter.activeFiltersCount}</li>
              </ul>
            </div>

            <div>
              <strong>響應式狀態：</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>裝置類型: {tableState.responsive.isMobile ? '手機' : tableState.responsive.isTablet ? '平板' : '桌面'}</li>
                <li>螢幕尺寸: {tableState.responsive.screenWidth}x{tableState.responsive.screenHeight}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 表格組件 */}
      <UdiTable
        ref={tableRef}
        columns={columns}
        onDataRequest={handleDataRequest}
        pageSize={10}
        sortable={true}
        filterable={true}
        isDev={true}
      />

      {/* 使用說明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
        <h3>API 使用說明</h3>
        <p>此示例展示了 UdiTable 組件提供的各種狀態 API：</p>
        <ul>
          <li><code>getState()</code> - 獲取完整的表格狀態，包含所有詳細信息</li>
          <li><code>getCoreState()</code> - 獲取核心狀態信息</li>
          <li><code>getScrollState()</code> - 獲取滾動相關狀態</li>
          <li><code>getPaginationState()</code> - 獲取分頁相關狀態</li>
          <li><code>getFilterState()</code> - 獲取篩選相關狀態</li>
          <li><code>getSortState()</code> - 獲取排序相關狀態</li>
        </ul>
        <p>點擊按鈕並查看瀏覽器控制台以查看詳細的狀態信息。</p>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

export default UdiTableApiExample;
