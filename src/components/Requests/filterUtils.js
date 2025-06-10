// 过滤请求数据
export const filterRequests = (requests, searchText, methodFilter, statusFilter) => {
  return requests.filter((request) => {
    // 搜索文本过滤
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = 
        request.request?.url?.toLowerCase().includes(searchLower) ||
        request.request?.method?.toLowerCase().includes(searchLower) ||
        request.request?.headers?.some(h => 
          h.key?.toLowerCase().includes(searchLower) || 
          h.values?.some(v => v.toLowerCase().includes(searchLower))
        );
      if (!matchesSearch) return false;
    }

    // 方法过滤
    if (methodFilter && request.request?.method !== methodFilter) {
      return false;
    }

    // 状态码过滤
    if (statusFilter) {
      const status = request.response?.status;
      if (statusFilter === '2xx' && !(status >= 200 && status < 300)) return false;
      if (statusFilter === '3xx' && !(status >= 300 && status < 400)) return false;
      if (statusFilter === '4xx' && !(status >= 400 && status < 500)) return false;
      if (statusFilter === '5xx' && !(status >= 500)) return false;
    }

    return true;
  });
};
