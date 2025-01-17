<template>
  <div class="container">
    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="statistics">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.totalUsers }}</div>
          <div class="card-footer">
            <span>较昨日</span>
            <span :class="statistics.userGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.userGrowth) }}%
              <el-icon><CaretTop v-if="statistics.userGrowth >= 0" /><CaretBottom v-else /></el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日活跃</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.activeUsers }}</div>
          <div class="card-footer">
            <span>较昨日</span>
            <span :class="statistics.activeGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.activeGrowth) }}%
              <el-icon><CaretTop v-if="statistics.activeGrowth >= 0" /><CaretBottom v-else /></el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月新增</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.monthlyNewUsers }}</div>
          <div class="card-footer">
            <span>较上月</span>
            <span :class="statistics.monthlyGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.monthlyGrowth) }}%
              <el-icon><CaretTop v-if="statistics.monthlyGrowth >= 0" /><CaretBottom v-else /></el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>用户转化率</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.conversionRate }}%</div>
          <div class="card-footer">
            <span>较上周</span>
            <span :class="statistics.conversionGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.conversionGrowth) }}%
              <el-icon><CaretTop v-if="statistics.conversionGrowth >= 0" /><CaretBottom v-else /></el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户昵称">
          <el-input v-model="searchForm.nickname" placeholder="请输入用户昵称" clearable />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号码" clearable />
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 用户列表 -->
    <el-table :data="userList" border style="width: 100%">
      <el-table-column label="用户头像" width="100">
        <template #default="scope">
          <el-avatar :size="40" :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="用户昵称" />
      <el-table-column prop="phone" label="手机号码" width="120" />
      <el-table-column label="用户状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="registerTime" label="注册时间" width="180" />
      <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
          <el-button 
            link 
            :type="scope.row.status === 1 ? 'danger' : 'success'"
            @click="handleStatusChange(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用户详情对话框 -->
    <el-dialog
      title="用户详情"
      v-model="detailVisible"
      width="600px"
    >
      <div class="user-detail" v-if="currentUser">
        <div class="user-header">
          <el-avatar :size="80" :src="currentUser.avatar" />
          <div class="user-info">
            <h3>{{ currentUser.nickname }}</h3>
            <p>{{ currentUser.phone }}</p>
          </div>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentUser.registerTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ currentUser.lastLoginTime }}</el-descriptions-item>
          <el-descriptions-item label="用户状态">
            <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
              {{ currentUser.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="user-statistics">
          <h4>用户数据</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ currentUser.orderCount }}</div>
                <div class="stat-label">订单数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">¥{{ currentUser.totalSpent }}</div>
                <div class="stat-label">消费金额</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ currentUser.lastActive }}</div>
                <div class="stat-label">活跃天数</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CaretTop, CaretBottom } from '@element-plus/icons-vue';

// 数据统计
const statistics = ref({
  totalUsers: 0,
  userGrowth: 0,
  activeUsers: 0,
  activeGrowth: 0,
  monthlyNewUsers: 0,
  monthlyGrowth: 0,
  conversionRate: 0,
  conversionGrowth: 0
});

// 搜索表单
const searchForm = ref({
  nickname: '',
  phone: '',
  status: '',
  dateRange: []
});

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    nickname: '',
    phone: '',
    status: '',
    dateRange: []
  };
  handleSearch();
};

// 列表数据
const userList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取用户列表
const getUsers = async () => {
  try {
    // TODO: 调用API获取用户列表
    userList.value = [];
    total.value = 0;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  }
};

// 获取统计数据
const getStatistics = async () => {
  try {
    // TODO: 调用API获取统计数据
  } catch (error) {
    ElMessage.error('获取统计数据失败');
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getUsers();
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  getUsers();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getUsers();
};

// 用户详情
const detailVisible = ref(false);
const currentUser = ref(null);

const handleDetail = (row: any) => {
  currentUser.value = row;
  detailVisible.value = true;
};

// 修改用户状态
const handleStatusChange = (row: any) => {
  const action = row.status === 1 ? '禁用' : '启用';
  ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用API更新用户状态
      ElMessage.success(`${action}成功`);
      getUsers();
    } catch (error) {
      ElMessage.error(`${action}失败`);
    }
  });
};

onMounted(() => {
  getUsers();
  getStatistics();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.statistics {
  margin-bottom: 20px;
}

.card-header {
  font-size: 14px;
  color: #666;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.card-footer {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
}

.up {
  color: #67c23a;
}

.down {
  color: #f56c6c;
}

.search-wrapper {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 用户详情样式 */
.user-detail {
  padding: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.user-info {
  margin-left: 20px;
}

.user-info h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.user-info p {
  margin: 0;
  color: #666;
}

.user-statistics {
  margin-top: 30px;
}

.user-statistics h4 {
  margin: 0 0 20px;
  font-size: 16px;
  color: #333;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}
</style> 