

export const handleDataRequest = async (params) => {

    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        // 修正路徑 - 從 dist 目錄提供的靜態文件
        const response = await fetch('/mockData.json');
        const jsonData = await response.json();        
        // 處理 JSON 數據格式
        const employees = jsonData.employees || [];
        
        // 根據參數篩選和排序
        let filteredData = employees;
        if (params.search) {
          filteredData = employees.filter(item =>
            Object.values(item).some(value =>
              value.toString().toLowerCase().includes(params.search.toLowerCase())
            )
          );
        }
        
        // 排序
        if (params.sortBy) {
          filteredData.sort((a, b) => {
            const aValue = a[params.sortBy];
            const bValue = b[params.sortBy];
            
            if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
        }
        
        // 分頁
        const startIndex = ((params.page || 1) - 1) * (params.pageSize || 10);
        const paginatedData = filteredData.slice(startIndex, startIndex + (params.pageSize || 10));
        
        const result = {
          data: paginatedData,
          totalCount: filteredData.length
        };
        return result;
    } catch (error) {
      console.error('❌ Callback 執行失敗:', error);
      throw error;
    }
  };