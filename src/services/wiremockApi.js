import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/__admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('请求错误:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Stub Mappings API
export const stubMappingsApi = {
  // 获取所有 stub mappings
  getAll: (params = {}) => {
    return api.get('/mappings', { params });
  },

  // 创建新的 stub mapping
  create: (data) => {
    return api.post('/mappings', data);
  },

  // 根据 ID 获取 stub mapping
  getById: (id) => {
    return api.get(`/mappings/${id}`);
  },

  // 更新 stub mapping
  update: (id, data) => {
    return api.put(`/mappings/${id}`, data);
  },

  // 删除 stub mapping
  delete: (id) => {
    return api.delete(`/mappings/${id}`);
  },

  // 删除所有 stub mappings
  deleteAll: () => {
    return api.delete('/mappings');
  },

  // 重置 stub mappings
  reset: () => {
    return api.post('/mappings/reset');
  },

  // 持久化 stub mappings
  persist: () => {
    return api.post('/mappings/save');
  },

  // 导入 stub mappings
  import: (data) => {
    return api.post('/mappings/import', data);
  },
};

// Requests API
export const requestsApi = {
  // 获取所有请求记录
  getAll: (params = {}) => {
    return api.get('/requests', { params });
  },

  // 根据 ID 获取请求记录
  getById: (id) => {
    return api.get(`/requests/${id}`);
  },

  // 删除所有请求记录
  deleteAll: () => {
    return api.delete('/requests');
  },

  // 查找请求记录
  find: (criteria) => {
    return api.post('/requests/find', criteria);
  },

  // 获取未匹配的请求
  getUnmatched: () => {
    return api.get('/requests/unmatched');
  },

  // 获取请求计数
  getCount: () => {
    return api.get('/requests/count');
  },
};

// Settings API
export const settingsApi = {
  // 获取全局设置
  getGlobal: () => {
    return api.get('/settings');
  },

  // 更新全局设置
  updateGlobal: (settings) => {
    return api.post('/settings', settings);
  },

  // 重置设置
  reset: () => {
    return api.post('/settings/reset');
  },
};

// Scenarios API
export const scenariosApi = {
  // 获取所有场景
  getAll: () => {
    return api.get('/scenarios');
  },

  // 重置所有场景
  resetAll: () => {
    return api.post('/scenarios/reset');
  },

  // 重置特定场景
  reset: (name) => {
    return api.put(`/scenarios/${name}/reset`);
  },
};

// System API
export const systemApi = {
  // 获取系统信息
  getInfo: () => {
    return api.get('/');
  },

  // 健康检查
  health: () => {
    return api.get('/health');
  },

  // 关闭服务器
  shutdown: () => {
    return api.post('/shutdown');
  },
};

// 录制和回放 API
export const recordingApi = {
  // 开始录制
  start: (config) => {
    return api.post('/recordings/start', config);
  },

  // 停止录制
  stop: () => {
    return api.post('/recordings/stop');
  },

  // 获取录制状态
  getStatus: () => {
    return api.get('/recordings/status');
  },

  // 快照录制
  snapshot: (config) => {
    return api.post('/recordings/snapshot', config);
  },
};

// 导出默认 API 实例
export default api;
