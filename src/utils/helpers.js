/**
 * 判斷傳入值是否為純粹的物件（不包含陣列與 null）
 *
 * @param {*} val - 任意型別的值
 * @returns {boolean} - 若是純物件則回傳 true，否則回傳 false
 *
 * @example
 * isObject({})           // true
 * isObject([])           // false
 * isObject(null)         // false
 * isObject("string")     // false
 */
const isObject = (val) => {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
};

/**
 * 等待指定時間後再繼續執行
 *
 * @param {number} time - 等待的時間（毫秒為單位，例如 1000 代表 1 秒）
 * @returns {Promise<void>} - 回傳一個 Promise，在指定毫秒數後 resolve
 *
 * @example
 * await sleep(1000); // 等待 1 秒
 */
function sleep(time) {
  // 建立一個 Promise，使用 setTimeout 來延遲執行 resolve
  return new Promise((resolve) => setTimeout(resolve, time));
}

export {
    isObject,
    sleep
}