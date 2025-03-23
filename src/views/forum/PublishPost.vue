<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const router = useRouter()

// 帖子标题
const postTitle = ref('')

// 帖子内容
const postContent = ref('')

// 选择的标签/分类
const selectedCategory = ref('')

// 分类选项
const categoryOptions = [
  { value: 'question', label: '新手求助' },
  { value: 'notice', label: '公告通知' },
  { value: 'activity', label: '打球组队' },
  { value: 'experience', label: '经验交流' },
]

// 字数统计
const textCount = ref(0)
const lineCount = ref(0)
const chineseTextCount = ref(0)

// 发布帖子
const publishPost = () => {
  // 表单验证
  if (!postTitle.value.trim()) {
    ElMessage.warning('请输入帖子标题')
    return
  }

  if (!postContent.value || postContent.value === '') {
    ElMessage.warning('请输入帖子内容')
    return
  }

  if (!selectedCategory.value) {
    ElMessage.warning('请选择帖子分类')
    return
  }

  // TODO: 调用API发布帖子
  // 模拟发布成功
  ElMessage.success('发布成功')

  // 跳转回论坛页
  router.push('/forum')
}

// 取消发布，返回论坛页面
const cancelPublish = () => {
  router.push('/forum')
}

// 文本变化时更新字数统计
const updateCount = (content) => {
  postContent.value = content
  textCount.value = content.length
  lineCount.value = content.split('\n').length

  // 计算中文字符数
  const chineseRegex = /[\u4e00-\u9fa5]/g
  const chineseChars = content.match(chineseRegex)
  chineseTextCount.value = chineseChars ? chineseChars.length : 0
}
</script>

<template>
  <div class="publish-post-container">
    <div class="publish-header">
      <h2>发布新帖</h2>
    </div>

    <el-card class="publish-card">
      <div class="post-title-container">
        <el-input
          v-model="postTitle"
          placeholder="输入文章标题..."
          maxlength="100"
          show-word-limit
          class="title-input"
        ></el-input>
      </div>

      <div class="editor-container">
        <QuillEditor
          v-model="postContent"
          @text-change="updateCount($event)"
          placeholder="在此输入帖子内容..."
          theme="snow"
          class="content-editor"
        />
      </div>

      <div class="post-footer">
        <div class="post-stats">
          <span>字符数: {{ textCount }}</span>
          <span>行数: {{ lineCount }}</span>
          <span>中文字数: {{ chineseTextCount }}</span>
        </div>

        <div class="post-options">
          <el-select v-model="selectedCategory" placeholder="选择分类">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>

        <div class="post-actions">
          <el-button @click="cancelPublish">取消</el-button>
          <el-button type="primary" @click="publishPost">发布</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="less" scoped>
.publish-post-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .publish-header {
    text-align: center;
    margin-bottom: 20px;

    h2 {
      color: #2b6fc2;
      font-weight: bold;
    }
  }

  .publish-card {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .post-title-container {
    margin-bottom: 15px;

    .title-input {
      :deep(.el-input__inner) {
        height: 50px;
        font-size: 18px;
        font-weight: bold;
        border: none;
        border-bottom: 1px solid #eaeaea;
        border-radius: 0;
        padding-left: 0;
      }
    }
  }

  .editor-container {
    margin-bottom: 20px;
    height: 400px;

    .content-editor {
      font-size: 16px;
      line-height: 1.6;

      :deep(.ql-editor) {
        min-height: 500px; // 将高度增加到500px
      }
    }
  }

  .post-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding-top: 30px; // 增加顶部填充，避免边框线压到按钮上
    border-top: 1px solid #eaeaea;

    .post-stats {
      display: flex;
      gap: 10px;
      font-size: 12px;
      color: #999;
    }

    .post-options {
      flex-grow: 1;
    }

    .post-actions {
      display: flex;
      gap: 10px;
    }
  }
}

@media screen and (max-width: 768px) {
  .publish-post-container {
    padding: 10px;
  }

  .post-footer {
    flex-direction: column;
    align-items: flex-start;

    .post-options,
    .post-actions {
      width: 100%;
    }

    .post-actions {
      justify-content: flex-end;
    }
  }
}
</style>
