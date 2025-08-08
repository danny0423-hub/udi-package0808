import React, { useEffect, useState } from "react";


/*
 * 未來有需要模組化tables同步功能在繼續進行
 * 目前已完成scrollbar模組化
 * 分頁模組未完成 
 */

const useUdiTableSync = ({ targetRef = [], syncScrollBar, syncPage }) => {
  //要匯入udiTable 之後要包入hook
  const [tablePage, setTablePage] = useState({});

  const [tablesState, setTablesState] = useState([]);




//控制項==========================
    //滾軸========================================
        const controlScroll = (sourceRef, targetRefs = []) => {
            const state = sourceRef.getScrollState();
            const { isHovered, tableName } = sourceRef.getState();
                if (isHovered) {
                targetRefs.forEach((targetRef) => {
                    if (
                    targetRef &&
                    typeof targetRef.scrollControl === "function"
                    ) {
                    targetRef.scrollControl("top", state.top);
                    targetRef.scrollControl("left", state.left);
                    } else {
                    console.error("Invalid targetRef structure", targetRef);
                    }
                });
                }
        };
    //===================================
        //分頁========================================
          const controlPagination = (sourceRef, targetRefs = []) => {
            const sourcePagination = sourceRef.current.getState().pagination;
            const targetPagination = targetRef.current.getState().pagination;
            const { isHovered } = sourceRef.current.getState();
            3;
            if (isHovered) {
              if (
                sourcePagination.currentPage !== targetPagination.currentPage
              ) {
                targetRef.current.setPage(sourcePagination.currentPage);
              }
              if (sourcePagination.pageSize !== targetPagination.pageSize) {
                targetRef.current.setPageSize(sourcePagination.pageSize);
              }
            }
          };
        //===================================
//====================================================       
  
  


  //=====page======


  useEffect(() => {
    const syncPagination = () => {
      if (importedTableRef.current && originalTableRef.current) {
        controlPagination(importedTableRef, originalTableRef);
        controlPagination(originalTableRef, importedTableRef);
      }
    };

    const importedPagination = importedTableRef.current?.getState().pagination;
    const originalPagination = originalTableRef.current?.getState().pagination;

    if (importedPagination && originalPagination) {
      syncPagination();
    }
  }, [tablePage]);

  //=====page======



  // Consolidate table registration and monitoring logic
  const registerAndMonitorTables = () => {
    const tableData = targetRef.map((ref) => ({
      ref: ref.current?.getState(),
    }));

    if (!tableData.every((table) => table.ref)) {
      throw new Error("All table references must be defined");
    }

    tableData.forEach((table) => {
      const tableElement = table.ref.tableWrapperRef;
      if (!tableElement) {
        throw new Error("Table element is not defined");
      }

      const handleScroll = (event) => {
        if (!syncScrollBar) return;
        const target = event.target;
        const otherTable = [];
        let sourceRef;

        targetRef.forEach((table) => {
          if (table?.current?.getState().tableWrapperRef !== target) {
            otherTable.push(table?.current);
          } else {
            sourceRef = table?.current;
          }
        });
        // Immediate controlScroll logic
        if (sourceRef && otherTable.length > 0) {
          controlScroll(sourceRef, otherTable);
        } else {
          console.error("SourceRef or otherTable is invalid", {
            sourceRef,
            otherTable,
          });
        }
      };

      tableElement.addEventListener("scroll", handleScroll);

      // Cleanup listener on unmount
      return () => {
        tableElement.removeEventListener("scroll", handleScroll);
      };
    });
  };




  // Refactor retryTableMount to dynamically handle all targetRefs
  useEffect(() => {
    const retryTableMount = () => {
      const allTableElements = targetRef.map(
        (ref) => ref.current?.getState().tableWrapperRef
      );

      if (allTableElements.some((element) => !element)) {
        setTimeout(retryTableMount, 500); // Retry after 500ms
      } else {
        registerAndMonitorTables();
      }
    };

    retryTableMount();

    return () => clearTimeout(retryTableMount);
  }, [targetRef]);


  return {setTablePage}
};

export default useUdiTableSync;
