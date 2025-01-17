<template>
  <div class="container">
    <!-- 搜索和操作栏 -->
    <div class="header-actions">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="商品名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.category" placeholder="商品分类" clearable>
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="primary" @click="handleAdd">新增商品</el-button>
        </el-form-item>
      </el-form>
      <div class="view-switch">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="card">卡片视图</el-radio-button>
          <el-radio-button label="table">表格视图</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card'" class="card-view">
      <el-row :gutter="20">
        <el-col 
          v-for="item in productList" 
          :key="item.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <el-card :body-style="{ padding: '0px' }" class="product-card">
            <el-image 
              :src="item.cover" 
              fit="cover"
              class="product-image"
            />
            <div class="product-info">
              <h3 class="product-title">{{ item.name }}</h3>
              <div class="product-price">¥{{ item.price }}</div>
              <div class="product-category">
                <el-tag size="small">{{ item.category.name }}</el-tag>
              </div>
              <div class="product-actions">
                <el-button type="primary" link @click="handleEdit(item)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(item)">删除</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 表格视图 -->
    <el-table 
      v-else 
      :data="productList" 
      border 
      style="width: 100%"
    >
      <el-table-column label="商品图片" width="120">
        <template #default="scope">
          <el-image
            style="width: 60px; height: 60px"
            :src="scope.row.cover"
            :preview-src-list="[scope.row.cover]"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="price" label="价格">
        <template #default="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="category.name" label="分类" />
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProducts, getCategories, deleteProduct } from '@/api/product';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  cover: string;
  price: number;
  stock: number;
  status: number;
  category: Category;
}

const router = useRouter();
const viewMode = ref('card');
const productList = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const searchForm = ref({
  keyword: '',
  category: ''
});

// 获取商品列表
const getProductList = async () => {
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            keyword: searchForm.value.keyword,
            categoryId: searchForm.value.category
        };
        const res = await getProducts(params);
        productList.value = res.list;
        total.value = res.total;
    } catch (error) {
        console.error('获取商品列表失败:', error);
        ElMessage.error('获取商品列表失败');
    }
};

// 获取分类列表
const getCategoryList = async () => {
    try {
        const res = await getCategories();
        categories.value = res;
    } catch (error) {
        console.error('获取分类列表失败:', error);
        ElMessage.error('获取分类列表失败');
    }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getProductList();
};

// 新增商品
const handleAdd = () => {
  router.push('/products/create');
};

// 编辑商品
const handleEdit = (row: Product) => {
  router.push(`/products/edit/${row.id}`);
};

// 删除商品
const handleDelete = (row: Product) => {
    ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            await deleteProduct(row.id);
            ElMessage.success('删除成功');
            getProductList();
        } catch (error) {
            console.error('删除商品失败:', error);
            ElMessage.error('删除失败');
        }
    });
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  getProductList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getProductList();
};

onMounted(() => {
  getProductList();
  getCategoryList();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-view {
  margin-bottom: 20px;
}

.product-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.product-image {
  width: 100%;
  height: 200px;
}

.product-info {
  padding: 14px;
}

.product-title {
  font-size: 16px;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  color: #f56c6c;
  font-size: 20px;
  margin-bottom: 10px;
}

.product-category {
  margin-bottom: 10px;
}

.product-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 