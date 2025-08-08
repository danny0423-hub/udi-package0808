# UdiTable 狀態 API 說明

UdiTable 組件提供了豐富的 API 來獲取表格的各種狀態信息，包括滾動位置、分頁狀態、篩選狀態等。

## 基本使用

```jsx
import React, { useRef } from 'react';
import UdiTable from './UdiTable';

const MyComponent = () => {
  const tableRef = useRef(null);
  
  const getTableState = () => {
    const state = tableRef.current.getState();
    console.log('表格狀態:', state);
  };
  
  return (
    <div>
      <button onClick={getTableState}>獲取表格狀態</button>
      <UdiTable 
        ref={tableRef}
        columns={columns}
        onDataRequest={handleDataRequest}
      />
    </div>
  );
};
```

## 可用的 API 方法

### 1. `getState()` - 完整狀態 API

返回表格的完整狀態信息，包含以下結構：

```javascript
{
  // 基本數據狀態
  data: Array,              // 當前頁面的數據
  loading: Boolean,         // 是否正在載入
  error: String|null,       // 錯誤信息
  totalCount: Number,       // 總資料筆數
  
  // 分頁狀態
  pagination: {
    currentPage: Number,    // 當前頁碼
    pageSize: Number,       // 每頁顯示筆數
    totalPages: Number,     // 總頁數
    hasNextPage: Boolean,   // 是否有下一頁
    hasPreviousPage: Boolean, // 是否有上一頁
    startIndex: Number,     // 當前頁開始索引
    endIndex: Number,       // 當前頁結束索引
    isFirstPage: Boolean,   // 是否為第一頁
    isLastPage: Boolean     // 是否為最後一頁
  },
  
  // 滾動狀態
  scroll: {
    position: {
      top: Number,              // 垂直滾動位置 (px)
      left: Number,             // 水平滾動位置 (px)
      verticalPercent: Number,  // 垂直滾動百分比 (0-100)
      horizontalPercent: Number // 水平滾動百分比 (0-100)
    },
    scrollbar: {
      hasVertical: Boolean,     // 是否有垂直滾動條
      hasHorizontal: Boolean,   // 是否有水平滾動條
      maxScrollTop: Number,     // 最大垂直滾動距離
      maxScrollLeft: Number,    // 最大水平滾動距離
      scrollWidth: Number,      // 滾動區域總寬度
      scrollHeight: Number,     // 滾動區域總高度
      clientWidth: Number,      // 可視區域寬度
      clientHeight: Number      // 可視區域高度
    },
    isAtTop: Boolean,           // 是否滾動到頂部
    isAtBottom: Boolean,        // 是否滾動到底部
    isAtLeft: Boolean,          // 是否滾動到最左邊
    isAtRight: Boolean,         // 是否滾動到最右邊
    canScrollVertically: Boolean,   // 是否可以垂直滾動
    canScrollHorizontally: Boolean  // 是否可以水平滾動
  },
  
  // 排序狀態
  sort: {
    sortConfig: Object,     // 排序配置 {key, direction}
    sortBy: String|null,    // 排序欄位
    sortOrder: String,      // 排序方向 'asc'|'desc'
    isSorted: Boolean       // 是否有排序
  },
  
  // 篩選狀態
  filter: {
    filterText: String,         // 基本篩選文字
    filterColumn: String,       // 篩選欄位
    advancedFilters: Object,    // 進階篩選條件
    showAdvancedFilter: Boolean, // 是否顯示進階篩選
    hasBasicFilter: Boolean,    // 是否有基本篩選
    hasAdvancedFilter: Boolean, // 是否有進階篩選
    hasAnyFilter: Boolean,      // 是否有任何篩選
    activeFiltersCount: Number  // 啟用的篩選數量
  },
  
  // 表格配置狀態
  config: {
    sortable: Boolean,      // 是否可排序
    filterable: Boolean,    // 是否可篩選
    className: String,      // CSS 類名
    isDev: Boolean,         // 是否為開發模式
    columnsCount: Number,   // 欄位數量
    columns: Array          // 欄位配置
  },
  
  // 響應式狀態
  responsive: {
    isMobile: Boolean,      // 是否為手機
    isTablet: Boolean,      // 是否為平板
    isDesktop: Boolean,     // 是否為桌面
    screenWidth: Number,    // 螢幕寬度
    screenHeight: Number    // 螢幕高度
  },
  
  // 元數據
  meta: {
    timestamp: String,      // 時間戳
    version: String,        // 版本號
    componentName: String   // 組件名稱
  }
}
```

### 2. `getCoreState()` - 核心狀態 API

返回最常用的狀態信息：

```javascript
{
  currentPage: Number,
  totalPages: Number,
  totalCount: Number,
  pageSize: Number,
  loading: Boolean,
  error: String|null,
  scrollPosition: Object,
  hasData: Boolean
}
```

### 3. `getScrollState()` - 滾動狀態 API

返回滾動相關的狀態：

```javascript
{
  top: Number,              // 垂直滾動位置
  left: Number,             // 水平滾動位置
  verticalPercent: Number,  // 垂直滾動百分比
  horizontalPercent: Number, // 水平滾動百分比
  hasVertical: Boolean,     // 是否有垂直滾動條
  hasHorizontal: Boolean,   // 是否有水平滾動條
  maxScrollTop: Number,     // 最大垂直滾動距離
  maxScrollLeft: Number,    // 最大水平滾動距離
  isAtTop: Boolean,         // 是否在頂部
  isAtBottom: Boolean,      // 是否在底部
  isAtLeft: Boolean,        // 是否在最左邊
  isAtRight: Boolean        // 是否在最右邊
}
```

### 4. `getPaginationState()` - 分頁狀態 API

返回分頁相關的狀態：

```javascript
{
  currentPage: Number,      // 當前頁碼
  totalPages: Number,       // 總頁數
  pageSize: Number,         // 每頁筆數
  totalCount: Number,       // 總筆數
  hasNextPage: Boolean,     // 是否有下一頁
  hasPreviousPage: Boolean, // 是否有上一頁
  startIndex: Number,       // 開始索引
  endIndex: Number          // 結束索引
}
```

### 5. `getFilterState()` - 篩選狀態 API

返回篩選相關的狀態：

```javascript
{
  filterText: String,         // 篩選文字
  filterColumn: String,       // 篩選欄位
  advancedFilters: Object,    // 進階篩選
  showAdvancedFilter: Boolean, // 顯示進階篩選
  hasAnyFilter: Boolean       // 是否有任何篩選
}
```

### 6. `getSortState()` - 排序狀態 API

返回排序相關的狀態：

```javascript
{
  key: String|null,       // 排序欄位
  direction: String,      // 排序方向
  isSorted: Boolean       // 是否有排序
}
```

## 使用場景

### 1. 監控滾動位置

```javascript
const checkScrollPosition = () => {
  const scrollState = tableRef.current.getScrollState();
  
  if (scrollState.isAtBottom) {
    console.log('用戶滾動到底部，可以載入更多數據');
  }
  
  if (scrollState.horizontalPercent > 80) {
    console.log('用戶滾動到表格右側區域');
  }
};
```

### 2. 監控分頁狀態

```javascript
const checkPagination = () => {
  const paginationState = tableRef.current.getPaginationState();
  
  console.log(`用戶正在查看第 ${paginationState.currentPage} 頁，共 ${paginationState.totalPages} 頁`);
  console.log(`顯示第 ${paginationState.startIndex} 到 ${paginationState.endIndex} 筆資料`);
};
```

### 3. 監控篩選行為

```javascript
const checkFilters = () => {
  const filterState = tableRef.current.getFilterState();
  
  if (filterState.hasAnyFilter) {
    console.log('用戶正在使用篩選功能');
    console.log('篩選條件:', {
      text: filterState.filterText,
      column: filterState.filterColumn,
      advanced: filterState.advancedFilters
    });
  }
};
```

### 4. 自動狀態監控

```javascript
const [tableState, setTableState] = useState(null);

useEffect(() => {
  const interval = setInterval(() => {
    if (tableRef.current) {
      const state = tableRef.current.getState();
      setTableState(state);
      
      // 可以在這裡執行自動化邏輯
      if (state.scroll.isAtBottom && state.pagination.hasNextPage) {
        // 自動載入下一頁
        console.log('自動載入下一頁');
      }
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

## 注意事項

1. **效能考量**: `getState()` 會返回完整的狀態物件，如果只需要特定信息，建議使用專門的 API（如 `getCoreState()`、`getScrollState()` 等）。

2. **實時更新**: 狀態會隨著用戶操作（滾動、分頁、篩選等）實時更新。

3. **錯誤處理**: 在使用 API 前請確保 ref 已經正確綁定到 UdiTable 組件。

4. **開發模式**: 設置 `isDev={true}` 可以在表格下方看到實時的狀態信息，有助於開發和調試。

## 示例

查看 `UdiTableApiExample.jsx` 檔案以獲得完整的使用示例。
