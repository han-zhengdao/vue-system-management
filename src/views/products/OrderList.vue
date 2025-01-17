<template>
  <div class="container">
    <!-- 搜索栏 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option
              v-for="item in orderStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
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

    <!-- 订单列表 -->
    <el-table :data="orderList" border style="width: 100%">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column label="商品信息" min-width="300">
        <template #default="scope">
          <div class="order-goods" v-for="item in scope.row.goods" :key="item.id">
            <el-image :src="item.cover" style="width: 50px; height: 50px" />
            <div class="goods-info">
              <div class="goods-name">{{ item.name }}</div>
              <div class="goods-price">¥{{ item.price }} × {{ item.quantity }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="订单金额" width="120">
        <template #default="scope">
          ¥{{ scope.row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="120">
        <template #default="scope">
          <el-tag :type="getOrderStatusType(scope.row.status)">
            {{ getOrderStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
          <el-button 
            v-if="scope.row.status === 1"
            link 
            type="success" 
            @click="handleShip(scope.row)"
          >发货</el-button>
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

    <!-- 订单详情对话框 -->
    <el-dialog
      title="订单详情"
      v-model="detailVisible"
      width="800px"
    >
      <div class="order-detail" v-if="currentOrder">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-item">
            <span class="label">订单号：</span>
            <span>{{ currentOrder.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">下单时间：</span>
            <span>{{ currentOrder.createTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">订单状态：</span>
            <el-tag :type="getOrderStatusType(currentOrder.status)">
              {{ getOrderStatusText(currentOrder.status) }}
            </el-tag>
          </div>
        </div>

        <div class="detail-section">
          <h3>收货信息</h3>
          <div class="detail-item">
            <span class="label">收货人：</span>
            <span>{{ currentOrder.receiver }}</span>
          </div>
          <div class="detail-item">
            <span class="label">联系电话：</span>
            <span>{{ currentOrder.phone }}</span>
          </div>
          <div class="detail-item">
            <span class="label">收货地址：</span>
            <span>{{ currentOrder.address }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>商品信息</h3>
          <el-table :data="currentOrder.goods" border>
            <el-table-column label="商品图片" width="100">
              <template #default="scope">
                <el-image :src="scope.row.cover" style="width: 60px; height: 60px" />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="price" label="单价" width="120">
              <template #default="scope">
                ¥{{ scope.row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column label="小计" width="120">
              <template #default="scope">
                ¥{{ scope.row.price * scope.row.quantity }}
              </template>
            </el-table-column>
          </el-table>
          <div class="order-amount">
            <span>订单总额：</span>
            <span class="amount">¥{{ currentOrder.totalAmount }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog
      title="订单发货"
      v-model="shipVisible"
      width="500px"
    >
      <el-form 
        ref="shipFormRef"
        :model="shipForm"
        :rules="shipRules"
        label-width="100px"
      >
        <el-form-item label="物流公司" prop="company">
          <el-select v-model="shipForm.company" placeholder="请选择物流公司">
            <el-option label="顺丰快递" value="SF" />
            <el-option label="圆通快递" value="YTO" />
            <el-option label="中通快递" value="ZTO" />
            <el-option label="韵达快递" value="YD" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="trackingNo">
          <el-input v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shipVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShip">确认发货</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 订单状态选项
const orderStatusOptions = [
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
];

// 获取订单状态文本
const getOrderStatusText = (status: number) => {
  const option = orderStatusOptions.find(item => item.value === status);
  return option ? option.label : '';
};

// 获取订单状态类型
const getOrderStatusType = (status: number) => {
  switch (status) {
    case 0: return 'warning';
    case 1: return 'primary';
    case 2: return 'success';
    case 3: return 'info';
    case 4: return 'danger';
    default: return 'info';
  }
};

// 搜索表单
const searchForm = ref({
  orderNo: '',
  status: '',
  dateRange: []
});

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    orderNo: '',
    status: '',
    dateRange: []
  };
  handleSearch();
};

// 列表数据
const orderList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 获取订单列表
const getOrders = async () => {
  try {
    // TODO: 调用API获取订单列表
    orderList.value = [];
    total.value = 0;
  } catch (error) {
    ElMessage.error('获取订单列表失败');
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getOrders();
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  getOrders();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getOrders();
};

// 订单详情
const detailVisible = ref(false);
const currentOrder = ref(null);

const handleDetail = (row: any) => {
  currentOrder.value = row;
  detailVisible.value = true;
};

// 发货
const shipVisible = ref(false);
const shipFormRef = ref();
const shipForm = ref({
  company: '',
  trackingNo: ''
});

const shipRules = {
  company: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
  trackingNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
};

const handleShip = (row: any) => {
  currentOrder.value = row;
  shipForm.value = {
    company: '',
    trackingNo: ''
  };
  shipVisible.value = true;
};

const confirmShip = async () => {
  if (!shipFormRef.value) return;
  
  await shipFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // TODO: 调用API更新订单状态
        ElMessage.success('发货成功');
        shipVisible.value = false;
        getOrders();
      } catch (error) {
        ElMessage.error('发货失败');
      }
    }
  });
};

onMounted(() => {
  getOrders();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.search-wrapper {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.order-goods {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-goods:last-child {
  border-bottom: none;
}

.goods-info {
  margin-left: 10px;
  flex: 1;
}

.goods-name {
  font-size: 14px;
  margin-bottom: 5px;
}

.goods-price {
  color: #999;
  font-size: 13px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 订单详情样式 */
.order-detail {
  padding: 0 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin: 0 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  font-weight: 500;
}

.detail-item {
  margin-bottom: 15px;
  font-size: 14px;
}

.detail-item .label {
  color: #666;
  margin-right: 10px;
  display: inline-block;
  width: 80px;
}

.order-amount {
  margin-top: 20px;
  text-align: right;
  font-size: 14px;
}

.order-amount .amount {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin-left: 10px;
}
</style> 