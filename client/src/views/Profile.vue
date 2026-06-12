<template>
  <div class="profile-page">
    <div class="page-header">
      <div class="container">
        <h1>👤 个人中心</h1>
        <p>管理你的个人信息和偏好设置</p>
      </div>
    </div>
    
    <div class="container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="基本信息" name="basic">
          <div class="form-wrap card">
            <div class="profile-top mb-20">
              <div class="avatar-edit">
                <img :src="form.avatar" class="avatar-xl" />
                <el-button size="small" type="primary" @click="randomAvatar">换一个</el-button>
              </div>
              <div class="quick-stats">
                <div class="stat">
                  <span class="num">{{ stats?.totalCount || 0 }}</span>
                  <span class="label">打卡次数</span>
                </div>
                <div class="stat">
                  <span class="num">{{ stats?.totalHours || 0 }}</span>
                  <span class="label">练琴小时</span>
                </div>
                <div class="stat">
                  <span class="num">{{ myInstruments.length }}</span>
                  <span class="label">发布乐器</span>
                </div>
                <div class="stat">
                  <span class="num highlight">{{ form.rating }}</span>
                  <span class="label">信用评分</span>
                </div>
              </div>
            </div>
            
            <el-form :model="form" label-width="100px">
              <el-form-item label="昵称">
                <el-input v-model="form.username" style="max-width: 300px" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="form.phone" style="max-width: 250px" />
              </el-form-item>
              <el-form-item label="所在城市">
                <el-input v-model="form.city" placeholder="如：北京市" style="max-width: 200px" />
                <el-input v-model="form.district" placeholder="如：海淀区" style="max-width: 200px; margin-left: 10px" />
              </el-form-item>
              <el-form-item label="水平等级">
                <el-radio-group v-model="form.skillLevel">
                  <el-radio value="初级">初级</el-radio>
                  <el-radio value="中级">中级</el-radio>
                  <el-radio value="高级">高级</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input v-model="form.bio" type="textarea" :rows="3" style="max-width: 500px" placeholder="介绍一下自己吧..." />
              </el-form-item>
              <el-form-item label="擅长乐器">
                <el-select
                  v-model="form.instruments"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入乐器"
                  style="max-width: 500px"
                >
                  <el-option v-for="inst in allInstruments" :key="inst" :label="inst" :value="inst" />
                </el-select>
              </el-form-item>
              <el-form-item label="喜欢的曲目">
                <el-select
                  v-model="form.favoritePieces"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择或输入曲目"
                  style="max-width: 500px"
                >
                  <el-option v-for="p in commonPieces" :key="p" :label="p" :value="p" />
                </el-select>
              </el-form-item>
              <el-form-item label="空闲时间">
                <el-checkbox-group v-model="form.freeTimes">
                  <el-checkbox label="工作日白天" />
                  <el-checkbox label="工作日晚上" />
                  <el-checkbox label="周六上午" />
                  <el-checkbox label="周六下午" />
                  <el-checkbox label="周六晚上" />
                  <el-checkbox label="周日上午" />
                  <el-checkbox label="周日下午" />
                  <el-checkbox label="周日晚上" />
                  <el-checkbox label="每天早晨" />
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" :loading="saving" @click="saveProfile">
                  <el-icon><Check /></el-icon>
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我的乐器" name="instruments">
          <div class="action-bar mb-20">
            <router-link to="/publish">
              <el-button type="primary" size="large">
                <el-icon><Plus /></el-icon>
                发布新乐器
              </el-button>
            </router-link>
          </div>
          <div v-if="myInstruments.length" class="grid grid-4 gap-20">
            <div v-for="inst in myInstruments" :key="inst.id" class="inst-item card">
              <img :src="inst.image" class="inst-image" />
              <div class="inst-info">
                <h4>{{ inst.name }}</h4>
                <div class="inst-tags">
                  <span class="badge badge-primary">{{ inst.category }}</span>
                  <span class="badge" :class="inst.status === 'available' ? 'badge-success' : 'badge-warning'">
                    {{ inst.status === 'available' ? '可借用' : '借用中' }}
                  </span>
                </div>
                <div class="inst-price">¥{{ inst.dailyFee }}/天 · 押金¥{{ inst.deposit }}</div>
                <div class="inst-actions">
                  <router-link :to="`/instruments/${inst.id}`">
                    <el-button size="small">查看</el-button>
                  </router-link>
                  <el-button size="small" type="danger" @click="deleteInstrument(inst)">下架</el-button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><Goods /></el-icon>
            <p>你还没有发布任何乐器</p>
            <router-link to="/publish" class="btn-primary mt-20">去发布我的第一件闲置乐器</router-link>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我的评价" name="reviews">
          <div class="rating-summary card mb-20">
            <div class="rating-main">
              <span class="rating-num">{{ form.rating }}</span>
              <el-rate v-model="form.rating" disabled show-score text-color="#ff9900" />
              <span class="review-count">（{{ form.reviewCount }}条评价）</span>
            </div>
          </div>
          <div v-if="myReviews.length" class="review-list">
            <div class="review-item card" v-for="r in myReviews" :key="r.id">
              <img :src="r.reviewer?.avatar" class="avatar-sm" />
              <div class="review-body">
                <div class="review-header">
                  <span class="reviewer">{{ r.reviewer?.username }}</span>
                  <el-rate :model-value="r.rating" disabled size="small" />
                  <span class="badge badge-primary">{{ r.context }}</span>
                  <span class="time">{{ new Date(r.createdAt).toLocaleDateString() }}</span>
                </div>
                <p>{{ r.content }}</p>
                <div v-if="r.rating <= 3" class="review-actions">
                  <el-button 
                    size="small" 
                    type="warning" 
                    :disabled="hasAppealMap[r.id]"
                    @click="openAppealDialog(r)"
                  >
                    <el-icon><Warning /></el-icon>
                    {{ hasAppealMap[r.id] ? '已申诉' : '申诉该评价' }}
                  </el-button>
                  <span v-if="hasAppealMap[r.id]" class="appeal-status">
                    <span :class="'badge ' + getAppealStatusClass(hasAppealMap[r.id].status)">
                      {{ getAppealStatusText(hasAppealMap[r.id].status) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><ChatLineSquare /></el-icon>
            <p>暂无评价</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="我的申诉" name="appeals">
          <div class="appeal-tabs mb-20">
            <el-radio-group v-model="appealFilter" size="large">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="pending">待处理</el-radio-button>
              <el-radio-button value="approved">已通过</el-radio-button>
              <el-radio-button value="rejected">已驳回</el-radio-button>
            </el-radio-group>
          </div>
          <div v-if="filteredAppeals.length" class="appeal-list">
            <div class="appeal-item card" v-for="a in filteredAppeals" :key="a.id">
              <div class="appeal-header">
                <span :class="'badge ' + getAppealStatusClass(a.status)">
                  {{ getAppealStatusText(a.status) }}
                </span>
                <span class="appeal-time">{{ new Date(a.createdAt).toLocaleString() }}</span>
              </div>
              <div class="appeal-review">
                <div class="appeal-review-title">原评价：</div>
                <div class="appeal-review-content">
                  <el-rate :model-value="a.review?.rating" disabled size="small" />
                  <span>{{ a.review?.content }}</span>
                </div>
              </div>
              <div class="appeal-reason">
                <div class="appeal-reason-title">申诉理由：</div>
                <p>{{ a.reason }}</p>
              </div>
              <div v-if="a.imageUrl" class="appeal-image">
                <div class="appeal-image-title">证据图片：</div>
                <a :href="a.imageUrl" target="_blank">{{ a.imageUrl }}</a>
              </div>
              <div v-if="a.reply" class="appeal-reply">
                <div class="appeal-reply-title">处理结果：</div>
                <p>{{ a.reply }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><Document /></el-icon>
            <p>暂无申诉记录</p>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-dialog
        v-model="appealDialogVisible"
        title="提交评价申诉"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form :model="appealForm" label-width="100px">
          <el-form-item label="原评价">
            <div class="appeal-target">
              <el-rate :model-value="currentAppealReview?.rating" disabled size="small" />
              <span>{{ currentAppealReview?.content }}</span>
            </div>
          </el-form-item>
          <el-form-item label="申诉原因" required>
            <el-input
              v-model="appealForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请详细说明申诉理由..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="图片链接">
            <el-input
              v-model="appealForm.imageUrl"
              placeholder="请输入证据图片链接（选填）"
            />
            <div class="form-tip">请上传图片至图床后粘贴链接，支持jpg、png等格式</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="appealDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submittingAppeal" @click="submitAppeal">
            提交申诉
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { checkinApi, instrumentApi, reviewApi, appealApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Plus, Goods, ChatLineSquare, Warning, Document } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('basic')
const saving = ref(false)
const stats = ref(null)
const myInstruments = ref([])
const myReviews = ref([])
const myAppeals = ref([])
const appealFilter = ref('all')
const appealDialogVisible = ref(false)
const submittingAppeal = ref(false)
const currentAppealReview = ref(null)
const hasAppealMap = ref({})

const appealForm = reactive({
  reason: '',
  imageUrl: ''
})

const filteredAppeals = computed(() => {
  if (appealFilter.value === 'all') return myAppeals.value
  return myAppeals.value.filter(a => a.status === appealFilter.value)
})

const form = reactive({
  ...(userStore.currentUser || {}),
  instruments: [],
  favoritePieces: [],
  freeTimes: []
})

const allInstruments = ['古典吉他', '民谣吉他', '电吉他', '尤克里里', '钢琴', '电子琴', '小提琴', '中提琴', '大提琴', '架子鼓', '卡洪鼓', '竹笛', '长笛', '洞箫', '陶埙', '口琴', '萨克斯', '小号', '古筝', '二胡', '琵琶', '阮', '扬琴']
const commonPieces = ['爱的罗曼史', '阿尔罕布拉宫的回忆', '肖邦夜曲', '梦中的婚礼', '小星星变奏曲', '铃木小提琴教程', 'Take Five', '西班牙斗牛曲', '姑苏行', '平湖秋月', '卡农', '天空之城', '千与千寻', '菊次郎的夏天']

const getAppealStatusText = (status) => {
  const map = {
    pending: '待处理',
    approved: '已通过',
    rejected: '已驳回'
  }
  return map[status] || status
}

const getAppealStatusClass = (status) => {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger'
  }
  return map[status] || ''
}

const loadAppeals = async () => {
  try {
    myAppeals.value = await appealApi.list({ appellantId: userStore.userId })
    hasAppealMap.value = {}
    myAppeals.value.forEach(a => {
      if (a.status !== 'rejected') {
        hasAppealMap.value[a.reviewId] = a
      }
    })
  } catch (e) {}
}

const openAppealDialog = (review) => {
  currentAppealReview.value = review
  appealForm.reason = ''
  appealForm.imageUrl = ''
  appealDialogVisible.value = true
}

const submitAppeal = async () => {
  if (!appealForm.reason.trim()) {
    ElMessage.warning('请填写申诉原因')
    return
  }
  submittingAppeal.value = true
  try {
    const result = await appealApi.create({
      reviewId: currentAppealReview.value.id,
      appellantId: userStore.userId,
      reason: appealForm.reason.trim(),
      imageUrl: appealForm.imageUrl.trim()
    })
    if (result.success) {
      ElMessage.success('申诉提交成功，请等待审核')
      appealDialogVisible.value = false
      loadAppeals()
    } else {
      ElMessage.error(result.error || '提交失败')
    }
  } catch (e) {
    ElMessage.error('提交失败')
  } finally {
    submittingAppeal.value = false
  }
}

onMounted(async () => {
  if (userStore.currentUser) {
    Object.assign(form, userStore.currentUser)
  }
  try {
    stats.value = await checkinApi.stats(userStore.userId)
  } catch (e) {}
  try {
    myInstruments.value = await instrumentApi.list({ ownerId: userStore.userId })
  } catch (e) {}
  try {
    myReviews.value = await reviewApi.list({ revieweeId: userStore.userId })
  } catch (e) {}
  loadAppeals()
})

const randomAvatar = () => {
  const seed = Math.random().toString(36).slice(2, 10)
  form.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

const saveProfile = async () => {
  if (!form.username) {
    ElMessage.warning('请填写昵称')
    return
  }
  saving.value = true
  try {
    const result = await userStore.updateUser({ ...form })
    if (result.success) {
      ElMessage.success('保存成功！')
    }
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const deleteInstrument = async (inst) => {
  try {
    await ElMessageBox.confirm(`确定下架「${inst.name}」吗？`, '确认下架', { type: 'warning' })
  } catch { return }
  try {
    await instrumentApi.remove(inst.id)
    ElMessage.success('已下架')
    myInstruments.value = myInstruments.value.filter(i => i.id !== inst.id)
  } catch (e) {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.mb-20 { margin-bottom: 20px; }
.mt-20 { display: inline-block; margin-top: 20px; }

.form-wrap {
  padding: 30px 40px;
  max-width: 900px;
  margin: 0 auto;
}

.profile-top {
  display: flex;
  gap: 40px;
  padding-bottom: 24px;
  border-bottom: 1px dashed var(--border-color);
}

.avatar-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-xl {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #e0e7ff;
}

.quick-stats {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  align-content: center;
}

.stat {
  text-align: center;
  padding: 16px;
  background: var(--bg-light);
  border-radius: 12px;
}

.stat .num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat .num.highlight {
  color: #f59e0b;
}

.stat .label {
  font-size: 12px;
  color: var(--text-secondary);
}

.action-bar {
  padding: 4px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.inst-item {
  overflow: hidden;
  padding: 0;
}

.inst-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.inst-info {
  padding: 14px;
}

.inst-info h4 {
  font-size: 15px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inst-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.inst-price {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.inst-actions {
  display: flex;
  gap: 8px;
}

.rating-summary {
  padding: 30px;
  text-align: center;
}

.rating-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.rating-num {
  font-size: 48px;
  font-weight: 700;
  color: #f59e0b;
}

.review-count {
  color: var(--text-secondary);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-item {
  display: flex;
  gap: 12px;
  padding: 18px;
}

.review-body {
  flex: 1;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.reviewer {
  font-weight: 500;
}

.time {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary);
}

.review-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.appeal-status {
  font-size: 12px;
}

.badge-danger {
  background: #fef2f2;
  color: #dc2626;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.appeal-tabs {
  display: flex;
  justify-content: center;
}

.appeal-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appeal-item {
  padding: 20px;
}

.appeal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border-color);
}

.appeal-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.appeal-review,
.appeal-reason,
.appeal-image,
.appeal-reply {
  margin-bottom: 12px;
}

.appeal-review-title,
.appeal-reason-title,
.appeal-image-title,
.appeal-reply-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 6px;
  font-size: 14px;
}

.appeal-review-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
}

.appeal-reason p,
.appeal-reply p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.appeal-image a {
  color: var(--primary-color);
  text-decoration: none;
}

.appeal-reply {
  background: var(--bg-light);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 0;
}

.appeal-target {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  padding: 10px;
  background: var(--bg-light);
  border-radius: 6px;
}

.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

@media (max-width: 900px) {
  .profile-top {
    flex-direction: column;
    align-items: center;
  }
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
  }
  .grid-4 {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
