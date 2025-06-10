// 表单初始化相关的逻辑
export const getDefaultFormValues = () => ({
  name: '',
  priority: 5,
  scenarioName: '',
  requiredScenarioState: '',
  newScenarioState: '',
  comment: '',
  request: {
    method: 'GET',
    urlPath: '/',
    urlPathPattern: '',
    queryParameters: {},
    headers: { 'Content-Type': 'application/json' },
    cookies: {},
    basicAuth: { username: '', password: '' },
    body: ''
  },
  response: {
    status: 200,
    statusMessage: '',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
    fixedDelayMilliseconds: 0,
    delayDistribution: { type: 'uniform', lower: 0, upper: 0 }
  },
  postServeActions: []
});

export const mapRecordToFormData = (record) => {
  if (!record) {
    return getDefaultFormValues();
  }

  return {
    name: record.name || '',
    priority: record.priority || 5,
    scenarioName: record.scenarioName || '',
    requiredScenarioState: record.requiredScenarioState || '',
    newScenarioState: record.newScenarioState || '',
    comment: record.comment || record.metadata?.wmui?.description || '',
    request: {
      method: record.request?.method || 'GET',
      urlPath: record.request?.urlPath || record.request?.url || '/',
      urlPathPattern: record.request?.urlPathPattern || record.request?.urlPattern || '',
      queryParameters: record.request?.queryParameters || {},
      headers: record.request?.headers || {},
      cookies: record.request?.cookies || {},
      basicAuth: record.request?.basicAuth || { username: '', password: '' },
      body: record.request?.body || (record.request?.bodyPatterns ? JSON.stringify(record.request.bodyPatterns, null, 2) : '')
    },
    response: {
      status: record.response?.status || 200,
      statusMessage: record.response?.statusMessage || '',
      headers: record.response?.headers || {},
      body: record.response?.body || 
            (record.response?.jsonBody ? JSON.stringify(record.response.jsonBody, null, 2) : 
             record.response?.base64Body ? atob(record.response.base64Body) : '{}'),
      fixedDelayMilliseconds: record.response?.fixedDelayMilliseconds || 0,
      delayDistribution: record.response?.delayDistribution || { type: 'uniform', lower: 0, upper: 0 }
    },
    postServeActions: (record.postServeActions || []).map(action => {
      // 处理WireMock实际的postServeActions数据结构
      if (action.name === 'webhook' && action.parameters) {
        // WireMock标准的webhook结构: { name: "webhook", parameters: {...} }
        return {
          webhook: {
            url: action.parameters.url || '',
            method: action.parameters.method || 'POST',
            headers: action.parameters.headers || {},
            body: action.parameters.body || '',
            fixedDelayMilliseconds: action.parameters.fixedDelayMilliseconds || 0
          }
        };
      } else if (action.webhook) {
        // 嵌套的webhook结构: { webhook: {...} }
        return {
          webhook: {
            url: action.webhook.url || '',
            method: action.webhook.method || 'POST',
            headers: action.webhook.headers || {},
            body: action.webhook.body || '',
            fixedDelayMilliseconds: action.webhook.fixedDelayMilliseconds || 0
          }
        };
      } else if (action.type === 'webhook' || action.webhookUrl) {
        // 扁平化结构
        return {
          webhook: {
            url: action.webhookUrl || action.url || '',
            method: action.method || 'POST',
            headers: action.headers || {},
            body: action.body || '',
            fixedDelayMilliseconds: action.fixedDelayMilliseconds || 0
          }
        };
      } else {
        // 兜底处理，确保有基本结构
        return {
          webhook: {
            url: '',
            method: 'POST',
            headers: {},
            body: '',
            fixedDelayMilliseconds: 0
          }
        };
      }
    })
  };
};
