// 过滤请求数据
export const filterRequests = (requests, searchText, methodFilter, statusFilter) => {
  if (!Array.isArray(requests)) {
    return [];
  }

  return requests.filter((request) => {
    // 搜索文本过滤
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = 
        request.request?.url?.toLowerCase().includes(searchLower) ||
        request.request?.method?.toLowerCase().includes(searchLower) ||
        request.request?.absoluteUrl?.toLowerCase().includes(searchLower) ||
        // 处理headers的不同数据结构
        (request.request?.headers && (
          // 如果headers是数组格式
          (Array.isArray(request.request.headers) && 
            request.request.headers.some(h => 
              h.key?.toLowerCase().includes(searchLower) || 
              (Array.isArray(h.values) && h.values.some(v => v.toLowerCase().includes(searchLower)))
            )) ||
          // 如果headers是对象格式
          (!Array.isArray(request.request.headers) &&
            Object.entries(request.request.headers).some(([key, value]) =>
              key.toLowerCase().includes(searchLower) ||
              (Array.isArray(value) ? value.some(v => v.toLowerCase().includes(searchLower)) : 
               String(value).toLowerCase().includes(searchLower))
            ))
        ));
      if (!matchesSearch) return false;
    }

    // 方法过滤
    if (methodFilter && request.request?.method !== methodFilter) {
      return false;
    }

    // 状态码过滤
    if (statusFilter) {
      const status = request.response?.status;
      if (!status) return false;
      if (statusFilter === '2xx' && !(status >= 200 && status < 300)) return false;
      if (statusFilter === '3xx' && !(status >= 300 && status < 400)) return false;
      if (statusFilter === '4xx' && !(status >= 400 && status < 500)) return false;
      if (statusFilter === '5xx' && !(status >= 500)) return false;
    }

    return true;
  });
};
