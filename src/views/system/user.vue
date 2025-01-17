<template>
  <div class="container">
    <!-- 搜索栏 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 用户列表 -->
    <el-table :data="userList" border style="width: 100%">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="realName" label="真实姓名" />
      <el-table-column prop="role.name" label="角色" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            link 
            :type="scope.row.status === 1 ? 'danger' : 'success'"
            @click="handleStatusChange(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button 
            link 
            type="primary" 
            @click="handleResetPwd(scope.row)"
          >重置密码</el-button>
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

    <!-- 用户编辑对话框 -->
    <el-dialog
      :title="isEdit ? '编辑用户' : '新增用户'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="formData.roleId" placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input v-model="formData.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      title="重置密码"
      v-model="resetPwdVisible"
      width="500px"
    >
      <el-form 
        ref="resetPwdFormRef"
        :model="resetPwdForm"
        :rules="resetPwdRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetPwdForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPwdVisible = false">取消</el-button>
          <el-button type="primary" @click="handleResetPwdSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

// 搜索表单
const searchForm = ref({
  username: '',
  role: '',
  status: ''
});

// 角色选项
const roleOptions = ref([
  { id: '1', name: '超级管理员' },
  { id: '2', name: '普通管理员' }
]);

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: '',
    role: '',
    status: ''
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

// 表单相关
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const isEdit = ref(false);

const formData = ref({
  username: '',
  realName: '',
  roleId: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  status: 1
});

const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (formData.value.confirmPassword !== '') {
      if (!formRef.value) return;
      formRef.value.validateField('confirmPassword', () => null);
    }
    callback();
  }
};

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== formData.value.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
};

// 新增用户
const handleAdd = () => {
  isEdit.value = false;
  formData.value = {
    username: '',
    realName: '',
    roleId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 1
  };
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: any) => {
  isEdit.value = true;
  formData.value = {
    ...row,
    password: '',
    confirmPassword: ''
  };
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 调用API保存用户
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
        dialogVisible.value = false;
        getUsers();
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败');
      }
    }
  });
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

// 重置密码相关
const resetPwdVisible = ref(false);
const resetPwdFormRef = ref<FormInstance>();
const currentUserId = ref('');

const resetPwdForm = ref({
  password: '',
  confirmPassword: ''
});

const resetPwdRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== resetPwdForm.value.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const handleResetPwd = (row: any) => {
  currentUserId.value = row.id;
  resetPwdForm.value = {
    password: '',
    confirmPassword: ''
  };
  resetPwdVisible.value = true;
};

const handleResetPwdSubmit = async () => {
  if (!resetPwdFormRef.value) return;
  
  await resetPwdFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // TODO: 调用API重置密码
        ElMessage.success('密码重置成功');
        resetPwdVisible.value = false;
      } catch (error) {
        ElMessage.error('密码重置失败');
      }
    }
  });
};

onMounted(() => {
  getUsers();
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>