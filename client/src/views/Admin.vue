<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="container">
        <h1>⚙️ 后台管理</h1>
        <p>管理评价申诉和平台内容</p>
      </div>
    </div>

    <div class="container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="申诉管理" name="appeals">
          <div class="admin-actions mb-20">
            <div class="filter-tabs">
              <el-radio-group v-model="statusFilter" size="large">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="pending">待处理</el-radio-button>
                <el-radio-button value="approved">已通过</el-radio-button>
                <el-radio-button value="rejected">已驳回</el-radio-button>
              </el-radio-group>
            </div>
            <el-button type="primary" @click="loadAppeals">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>

          <div class="stats-cards mb-20">
            <div class="stat-card">
              <span class="stat-label">总申诉数</span>
              <span class="stat-value">{{ stats.total }}</span>
            </div>
            <div class="stat-card pending">
              <span class="stat-label">待处理</span>
              <span class="stat-value">{{ stats.pending }}</span>
            </div>
            <div class="stat-card approved">
              <span class="stat-label">已通过</span>
              <span class="stat-value">{{ stats.approved }}</span>
            </div>
            <div class="stat-card rejected">
              <span class="stat-label">已驳回</span>
              <span class="stat-value">{{ stats.rejected }}</span>
            </div>
          </div>

          <div v-if="filteredAppeals.length" class="appeal-table-wrap card">
            <el-table :data="filteredAppeals" stripe>
              <el-table-column prop="id" label="申诉ID" width="120" />
              <el-table-column label="申诉人" width="140">
                <template #default="{ row }">
                  <div class="user-cell">
                    <img :src="row.appellant?.avatar" class="avatar-xs" />
                    <span>{{ row.appellant?.username }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="被评价人" width="140">
                <template #default="{ row }">
                  <div class="user-cell">
                    <img :src="row.reviewer?.avatar" class="avatar-xs" />
                    <span>{{ row.reviewer?.username }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="原评价">
                <template #default="{ row }">
                  <div class="review-cell">
                    <el-rate :model-value="row.review?.rating" disabled size="small" />
                    <span class="review-text">{{ row.review?.content }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="reason" label="申诉理由" min-width="180" show-overflow-tooltip />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <span :class="'badge ' + getStatusClass(row.status)">
                    {{ getStatusText(row.status) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="申诉时间" width="180">
                <template #default="{ row }">
                  {{ new Date(row.createdAt).toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button
                    v-if="row.status === 'pending'"
                    type="primary"
                    size="small"
                    @click="openHandleDialog(row)"
                  >
                    处理
                  </el-button>
                  <el-button
                    v-else
                    type="info"
                    size="small"
                    @click="viewDetail(row)"
                  >
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-else class="empty-state">
            <el-icon><Document /></el-icon>
            <p>暂无申诉记录</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="handleDialogVisible"
      :title="isViewMode ? '申诉详情' : '处理申诉'"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentAppeal" class="appeal-detail">
        <div class="detail-section">
          <div class="detail-label">申诉信息</div>
          <div class="detail-row">
            <span class="detail-key">申诉ID：</span>
            <span class="detail-value">{{ currentAppeal.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">申诉时间：</span>
            <span class="detail-value">{{ new Date(currentAppeal.createdAt).toLocaleString() }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">申诉人：</span>
            <span class="detail-value">{{ currentAppeal.appellant?.username }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">状态：</span>
            <span :class="'badge ' + getStatusClass(currentAppeal.status)">
              {{ getStatusText(currentAppeal.status) }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">原评价信息</div>
          <div class="detail-row">
            <span class="detail-key">评价人：</span>
            <span class="detail-value">{{ currentAppeal.reviewer?.username }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">评分：</span>
            <el-rate :model-value="currentAppeal.review?.rating" disabled size="small" />
          </div>
          <div class="detail-row">
            <span class="detail-key">评价内容：</span>
            <span class="detail-value">{{ currentAppeal.review?.content }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">申诉内容</div>
          <div class="detail-row">
            <span class="detail-key">申诉理由：</span>
            <span class="detail-value">{{ currentAppeal.reason }}</span>
          </div>
          <div v-if="currentAppeal.imageUrl" class="detail-row">
            <span class="detail-key">证据图片：</span>
            <a :href="currentAppeal.imageUrl" target="_blank" class="detail-value link">
              {{ currentAppeal.imageUrl }}
            </a>
          </div>
        </div>

        <div v-if="currentAppeal.status !== 'pending'" class="detail-section">
          <div class="detail-label">处理结果</div>
          <div class="detail-row">
            <span class="detail-key">处理人：</span>
            <span class="detail-value">{{ currentAppeal.handler?.username || '系统' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">处理时间：</span>
            <span class="detail-value">{{ currentAppeal.handledAt ? new Date(currentAppeal.handledAt).toLocaleString() : '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">处理意见：</span>
            <span class="detail-value">{{ currentAppeal.reply }}</span>
          </div>
        </div>

        <el-form v-if="!isViewMode" :model="handleForm" label-width="100px" class="handle-form">
          <el-form-item label="处理结果" required>
            <el-radio-group v-model="handleForm.status">
              <el-radio value="approved">通过申诉（删除评价）</el-radio>
              <el-radio value="rejected">驳回申诉</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="处理意见" required>
            <el-input
              v-model="handleForm.reply"
              type="textarea"
              :rows="3"
              placeholder="请输入处理意见..."
              maxlength="300"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="handleDialogVisible = false">关闭</el-button>
        <el-button
          v-if="!isViewMode"
          type="primary"
          :loading="handling"
          @click="handleAppeal"
        >
          确认处理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { appealApi } from '../api'
import { ElMessage } from 'element-plus'
import { Refresh, Document } from '@element-plus/icons-vue'

const userStore = useUserStore()

const activeTab = ref('appeals')
const statusFilter = ref('pending')
const appeals = ref([])
const handleDialogVisible = ref(false)
const handling = ref(false)
const isViewMode = ref(false)
const currentAppeal = ref(null)

const handleForm = reactive({
  status: 'approved',
  reply: ''
})

const stats = computed(() => {
  const total = appeals.value.length
  const pending = appeals.value.filter(a => a.status === 'pending').length
  const approved = appeals.value.filter(a => a.status === 'approved').length
  const rejected = appeals.value.filter(a => a.status === 'rejected').length
  return { total, pending, approved, rejected }
})

const filteredAppeals = computed(() => {
  if (statusFilter.value === 'all') return appeals.value
  return appeals.value.filter(a => a.status === statusFilter.value)
})

const getStatusText = (status) => {
  const map = {
    pending: '待处理',
    approved: '已通过',
    rejected: '已驳回'
  }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger'
  }
  return map[status] || ''
}

const loadAppeals = async () => {
  try {
    appeals.value = await appealApi.list()
  } catch (e) {
    ElMessage.error('加载申诉列表失败')
  }
}

const openHandleDialog = (appeal) => {
  isViewMode.value = false
  currentAppeal.value = appeal
  handleForm.status = 'approved'
  handleForm.reply = ''
  handleDialogVisible.value = true
}

const viewDetail = (appeal) => {
  isViewMode.value = true
  currentAppeal.value = appeal
  handleDialogVisible.value = true
}

const handleAppeal = async () => {
  if (!handleForm.reply.trim()) {
    ElMessage.warning('请输入处理意见')
    return
  }
  handling.value = true
  try {
    const result = await appealApi.handle(currentAppeal.value.id, {
      status: handleForm.status,
      reply: handleForm.reply.trim(),
      handlerId: userStore.userId
    })
    if (result.success) {
      ElMessage.success('处理成功')
      handleDialogVisible.value = false
      loadAppeals()
    } else {
      ElMessage.error(result.error || '处理失败')
    }
  } catch (e) {
    ElMessage.error('处理失败')
  } finally {
    handling.value = false
  }
}

onMounted(() => {
  loadAppeals()
})
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}

.admin-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-card.pending {
  border-left: 4px solid #f59e0b;
}

.stat-card.approved {
  border-left: 4px solid #10b981;
}

.stat-card.rejected {
  border-left: 4px solid #ef4444;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.appeal-table-wrap {
  padding: 0;
  overflow: hidden;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-xs {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.review-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-danger {
  background: #fef2f2;
  color: #dc2626;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.appeal-detail {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border-color);
}

.detail-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-size: 15px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.6;
}

.detail-key {
  color: var(--text-secondary);
  min-width: 80px;
  flex-shrink: 0;
}

.detail-value {
  color: var(--text-primary);
  flex: 1;
}

.detail-value.link {
  color: var(--primary-color);
  text-decoration: none;
}

.handle-form {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--border-color);
}

@media (max-width: 900px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-actions {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
