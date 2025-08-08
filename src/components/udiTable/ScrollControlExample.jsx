import React, { useRef } from 'react';
import UdiTable from './UdiTable';

/**
 * UdiTable 滾動控制示例
 * 展示如何使用 X 軸滾動到底部的功能
 */
const ScrollControlExample = () => {
  const tableRef = useRef(null);

  // 模擬寬表格數據
  const columns = [
    { dataField: 'id', title: 'ID', width: '80px' },
    { dataField: 'name', title: '姓名', width: '150px' },
    { dataField: 'email', title: '電子郵件', width: '250px' },
    { dataField: 'department', title: '部門', width: '150px' },
    { dataField: 'position', title: '職位', width: '150px' },
    { dataField: 'phone', title: '電話', width: '150px' },
    { dataField: 'address', title: '詳細地址', width: '300px' },
    { dataField: 'birthDate', title: '出生日期', width: '120px' },
    { dataField: 'hireDate', title: '入職日期', width: '120px' },
    { dataField: 'salary', title: '薪資', width: '120px' },
    { dataField: 'manager', title: '主管', width: '150px' },
    { dataField: 'project', title: '專案', width: '200px' },
    { dataField: 'skills', title: '技能', width: '300px' },
    { dataField: 'notes', title: '備註', width: '250px' }
  ];

  // 模擬數據請求
  const handleDataRequest = async (params) => {
    console.log('📊 數據請求參數:', params);
    
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 生成模擬數據
    const mockData = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      name: `員工${index + 1}`,
      email: `employee${index + 1}@company.com`,
      department: ['技術部', '業務部', '人事部', '財務部', '行銷部'][index % 5],
      position: ['工程師', '主管', '專員', '經理', '總監'][index % 5],
      phone: `09${Math.random().toString().substr(2, 8)}`,
      address: `台北市信義區信義路${index + 1}號${Math.floor(index / 10) + 1}樓`,
      birthDate: `19${80 + (index % 20)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`,
      hireDate: `20${10 + (index % 13)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`,
      salary: `${30000 + (index * 1000)}`,
      manager: `主管${Math.floor(index / 5) + 1}`,
      project: `專案${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][index % 5]}`,
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C#'].slice(0, (index % 4) + 2).join(', '),
      notes: `員工${index + 1}的備註信息，表現良好，工作積極。`
    }));

    return {
      data: mockData.slice(
        (params.page - 1) * params.pageSize,
        params.page * params.pageSize
      ),
      totalCount: mockData.length
    };
  };

  // 使用 API 控制滾動
  const scrollToEnd = () => {
    if (tableRef.current) {
      tableRef.current.scrollToHorizontalEnd();
      console.log('📱 通過 API 滾動到 X 軸底部');
    }
  };

  const scrollToStart = () => {
    if (tableRef.current) {
      tableRef.current.scrollToHorizontalStart();
      console.log('📱 通過 API 滾動到 X 軸起始位置');
    }
  };

  const getScrollInfo = () => {
    if (tableRef.current) {
      const scrollState = tableRef.current.getScrollState();
      console.log('📊 當前滾動狀態:', scrollState);
      alert(`水平滾動: ${scrollState.horizontalPercent}%\n垂直滾動: ${scrollState.verticalPercent}%`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>UdiTable 滾動控制示例</h2>
      <p>這個表格有很多欄位，會產生水平滾動條。您可以：</p>
      <ul>
        <li>使用表格右上角的 <strong>⏭️ 按鈕</strong> 快速滾動到 X 軸底部（最右邊）</li>
        <li>使用表格右上角的其他按鈕控制滾動</li>
        <li>使用下方的 API 按鈕進行程式化控制</li>
      </ul>
      
      {/* API 控制按鈕 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={scrollToEnd} 
          style={{
            ...buttonStyle,
            backgroundColor: '#28a745',
            fontWeight: 'bold'
          }}
        >
          ⏭️ API: 滾動到 X 軸底部
        </button>
        <button onClick={scrollToStart} style={buttonStyle}>
          ⏮️ API: 滾動到 X 軸起始
        </button>
        <button onClick={getScrollInfo} style={{ ...buttonStyle, backgroundColor: '#17a2b8' }}>
          📊 獲取滾動狀態
        </button>
      </div>

      {/* 說明區域 */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '5px',
        border: '1px solid #bee5eb'
      }}>
        <h4>💡 使用提示</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>⏭️ 綠色閃爍按鈕</strong>：快速滾動到表格最右邊（X軸底部）</li>
          <li><strong>⏮️ 藍色按鈕</strong>：快速滾動到表格最左邊（X軸起始）</li>
          <li><strong>⏫⏬ 垂直按鈕</strong>：控制垂直滾動到頂部或底部</li>
          <li>按鈕只在需要滾動時才會顯示</li>
          <li>所有滾動都使用平滑動畫效果</li>
        </ul>
      </div>

      {/* 表格組件 */}
      <UdiTable
        ref={tableRef}
        columns={columns}
        onDataRequest={handleDataRequest}
        pageSize={20}
        sortable={true}
        filterable={true}
        isDev={true}
      />

      {/* 功能說明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>功能特點</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4>🎯 智能顯示</h4>
            <p>滾動控制按鈕只在表格確實需要滾動時才會顯示，避免界面雜亂。</p>
          </div>
          <div>
            <h4>📱 響應式設計</h4>
            <p>按鈕大小和位置會根據螢幕尺寸自動調整，在手機和桌面都有良好體驗。</p>
          </div>
          <div>
            <h4>✨ 視覺效果</h4>
            <p>X軸底部按鈕有特殊的閃爍動畫效果，讓用戶更容易找到這個重要功能。</p>
          </div>
          <div>
            <h4>🔧 API 支援</h4>
            <p>除了 UI 按鈕，還提供程式化 API 讓開發者可以在代碼中控制滾動。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '10px 16px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

export default ScrollControlExample;
