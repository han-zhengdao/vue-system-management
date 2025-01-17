<template>
  <div class="container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑商品' : '新增商品' }}</span>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <!-- 基本信息 -->
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>

        <el-form-item label="商品分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="formData.price"
            :precision="2"
            :step="0.1"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="商品库存" prop="stock">
          <el-input-number 
            v-model="formData.stock"
            :min="0"
            :precision="0"
          />
        </el-form-item>

        <el-form-item label="商品状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>

        <!-- 商品图片 -->
        <el-form-item label="商品主图" prop="cover">
          <el-upload
            class="cover-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleCoverSuccess"
            :on-error="handleUploadError"
            name="file"
          >
            <img v-if="formData.cover" :src="formData.cover" class="cover" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品图片" prop="images">
          <el-upload
            class="image-uploader"
            action="/api/upload"
            list-type="picture-card"
            :on-success="handleImageSuccess"
            :on-remove="handleImageRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <!-- 商品详情 -->
        <el-form-item label="商品详情" prop="detail">
          <QuillEditor
            v-model:content="formData.detail"
            :options="editorOptions"
            contentType="html"
            theme="snow"
            toolbar="full"
            @ready="onEditorReady"
            class="editor-container"
          />
        </el-form-item>

        <!-- 表单操作 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="router.back()">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { 
    getProductDetail, 
    createProduct, 
    updateProduct, 
    getCategories,
    uploadFile 
} from '@/api/product';

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
const isEdit = computed(() => route.params.id !== undefined);

interface Category {
  id: string;
  name: string;
}

const categories = ref<Category[]>([]);

const formData = ref({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: 1,
  cover: '',
  images: [] as string[],
  detail: ''
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }],
  cover: [{ required: true, message: '请上传商品主图', trigger: 'change' }],
  detail: [{ required: true, message: '请填写商品详情', trigger: 'blur' }]
};

// 编辑器配置
const editorOptions = {
  placeholder: '请输入商品详情...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ],
    imageUploader: {
      upload: (file: File) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append('file', file);
          
          fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
            .then(res => res.json())
            .then(result => {
              resolve(result.url);
            })
            .catch(error => {
              reject('Upload failed');
              console.error('Error:', error);
            });
        });
      }
    }
  }
};

// 编辑器就绪回调
const onEditorReady = (quill: any) => {
  console.log('Editor is ready!', quill);
};

// 获取商品详情
const getDetail = async (id: string) => {
    try {
        const res = await getProductDetail(id);
        formData.value = res;
    } catch (error) {
        console.error('获取商品详情失败:', error);
        ElMessage.error('获取商品详情失败');
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

// 上传相关配置
const uploadUrl = 'http://localhost:5000/api/upload';
const uploadHeaders = computed(() => {
    const token = localStorage.getItem('token');
    return {
        Authorization: token ? `Bearer ${token}` : ''
    };
});

// 处理主图上传成功
const handleCoverSuccess = (response: any) => {
    if (response.code === 0) {
        formData.value.cover = response.data;
        ElMessage.success('上传成功');
    } else {
        ElMessage.error(response.message || '上传失败');
    }
};

// 处理商品图片上传成功
const handleImageSuccess = (response: any) => {
    if (response.code === 0) {
        formData.value.images.push(response.data);
        ElMessage.success('上传成功');
    } else {
        ElMessage.error(response.message || '上传失败');
    }
};

// 处理商品图片删除
const handleImageRemove = (file: any) => {
  const index = formData.value.images.indexOf(file.url);
  if (index !== -1) {
    formData.value.images.splice(index, 1);
  }
};

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            try {
                if (isEdit.value) {
                    await updateProduct(route.params.id as string, formData.value);
                    ElMessage.success('更新成功');
                } else {
                    await createProduct(formData.value);
                    ElMessage.success('创建成功');
                }
                router.push('/products');
            } catch (error) {
                console.error('保存商品失败:', error);
                ElMessage.error(isEdit.value ? '更新失败' : '创建失败');
            }
        }
    });
};

// 图片上传
const handleUpload = async (file: File) => {
    try {
        const res = await uploadFile(file);
        return res.url;
    } catch (error) {
        console.error('上传图片失败:', error);
        ElMessage.error('上传图片失败');
        return '';
    }
};

onMounted(() => {
    getCategoryList();
    if (isEdit.value && route.params.id) {
        getDetail(route.params.id as string);
    }
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.form-card {
  margin-bottom: 20px;
}

.cover-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader:hover {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.cover {
  width: 178px;
  height: 178px;
  display: block;
}

.editor-container {
  width: 100%;
  height: 600px;
  margin-bottom: 20px;
}

:deep(.ql-toolbar.ql-snow) {
  border: 1px solid #dcdfe6;
  border-radius: 4px 4px 0 0;
  background-color: #f5f7fa;
  padding: 8px;
  width: 100%;
}

:deep(.ql-container.ql-snow) {
  border: 1px solid #dcdfe6;
  border-top: none;
  border-radius: 0 0 4px 4px;
  height: calc(100% - 42px);
  width: 100%;
}

:deep(.ql-editor) {
  font-size: 14px;
  line-height: 1.8;
  padding: 20px;
  min-height: 500px;
  background-color: #fff;
}

:deep(.ql-editor)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

:deep(.ql-editor)::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

:deep(.ql-editor)::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

:deep(.ql-tooltip) {
  z-index: 2000;
}
</style> 