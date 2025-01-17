<template>
  <div class="container">
    <div class="header-actions">
      <el-button type="primary" @click="handleAdd">新增分类</el-button>
    </div>

    <el-table :data="categoryList" border style="width: 100%">
      <el-table-column prop="name" label="分类名称" />
      <el-table-column label="分类图片" width="120">
        <template #default="scope">
          <el-image
            style="width: 60px; height: 60px"
            :src="scope.row.image"
            :preview-src-list="[scope.row.image]"
          />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" />
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

    <!-- 分类编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="分类图片" prop="image">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            name="file"
            :with-credentials="true"
          >
            <img v-if="formData.image" :src="formData.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { createCategory, updateCategory, deleteCategory, getCategories } from '@/api/product';

interface Category {
  id: string;
  name: string;
  image: string;
  sort: number;
}

const categoryList = ref<Category[]>([]);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const isEdit = ref(false);

const formData = ref({
  id: '',
  name: '',
  image: '',
  sort: 0
});

const dialogTitle = computed(() => isEdit.value ? '编辑分类' : '新增分类');

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  image: [{ required: true, message: '请上传分类图片', trigger: 'change' }]
};

// 上传相关配置
const uploadUrl = 'http://localhost:5000/api/upload';
const uploadHeaders = computed(() => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };
});

// 上传前验证
const beforeUpload = (file: File) => {
    const token = localStorage.getItem('token');
    if (!token) {
        ElMessage.error('请先登录');
        return false;
    }

    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!');
        return false;
    }
    return true;
};

// 上传成功回调
const handleUploadSuccess = (response: any) => {
    console.log('上传响应:', response);
    if (response.code === 0) {
        formData.value.image = response.data;
        ElMessage.success('上传成功');
    } else {
        ElMessage.error(response.message || '上传失败');
    }
};

// 上传失败回调
const handleUploadError = (error: any) => {
    console.error('上传失败:', error);
    if (error.response?.data?.message === '请先登录') {
        ElMessage.error('登录已过期，请重新登录');
        window.location.href = '/login';
        return;
    }
    ElMessage.error('上传失败，请重试');
};

// 获取分类列表
const getCategories = async () => {
  try {
    // TODO: 调用API获取分类列表
    categoryList.value = [];
  } catch (error) {
    ElMessage.error('获取分类列表失败');
  }
};

// 新增分类
const handleAdd = () => {
  isEdit.value = false;
  formData.value = {
    id: '',
    name: '',
    image: '',
    sort: 0
  };
  dialogVisible.value = true;
};

// 编辑分类
const handleEdit = (row: Category) => {
  isEdit.value = true;
  formData.value = { ...row };
  dialogVisible.value = true;
};

// 删除分类
const handleDelete = (row: Category) => {
  ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用API删除分类
      ElMessage.success('删除成功');
      getCategories();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateCategory(formData.value.id, formData.value);
          ElMessage.success('更新成功');
        } else {
          await createCategory(formData.value);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        getCategories();  // 刷新列表
      } catch (error) {
        console.error('保存分类失败:', error);
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败');
      }
    }
  });
};
</script>

<style scoped>
.container {
  padding: 20px;
}

.header-actions {
  margin-bottom: 20px;
}

.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style> 