import api from './api';

export const logAudit = async (action, model, modelId, reason = null) => {
  try {
    await api.post('/audit-logs', {
      action,
      model,
      model_id: modelId,
      reason
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

export const getAuditLogs = async (filters = {}) => {
  try {
    const response = await api.get('/audit-logs', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw error;
  }
};

export const getModelAuditHistory = async (model, modelId) => {
  try {
    const response = await api.get(`/audit-logs/${model}/${modelId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch model audit history:', error);
    throw error;
  }
};
