<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import { createPost } from '@/api/forum'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const router = useRouter()

// 帖子标题
const postTitle = ref('')

// 帖子内容
const postContent = ref('')

// 纯文本内容
const plainTextContent = ref('')

// 编辑器实例引用
const editorRef = ref(null)

// 选择的标签/分类
const selectedCategory = ref('')

// 分类选项
const categoryOptions = [
  { value: 'team', label: '打球组队' },
  { value: 'notice', label: '公告通知' },
  { value: 'help', label: '求助问答' },
  { value: 'exp', label: '经验交流' },
]

// 字数统计
const textCount = ref(0)
const maxTextCount = ref(100)

// 发布帖子
const publishPost = async () => {
  // 表单验证
  if (!postTitle.value.trim()) {
    ElMessage.warning('请输入帖子标题')
    return
  }

  if (!plainTextContent.value || plainTextContent.value === '') {
    ElMessage.warning('请输入帖子内容')
    return
  }

  if (!selectedCategory.value) {
    ElMessage.warning('请选择帖子分类')
    return
  }

  // 调用API发布帖子
  const res = await createPost({
    title: postTitle.value,
    content: plainTextContent.value, // 使用纯文本内容
    category: selectedCategory.value,
  })
  if (res.data.code === 0) {
    // 发布成功
    ElMessage.success(res.data.msg)

    // 跳转回论坛页
    router.push('/forum')
  } else {
    ElMessage.error(res.data.msg)
  }
}

// 取消发布，返回论坛页面
const cancelPublish = () => {
  router.push('/forum')
}

// 文本变化时更新字数统计
const updateCount = () => {
  if (editorRef.value && editorRef.value.getQuill) {
    const quill = editorRef.value.getQuill()
    if (quill) {
      // 获取纯文本内容
      const text = quill.getText() || ''
      // 移除最后的换行符（Quill 编辑器默认添加）
      const cleanText = text.endsWith('\n') ? text.slice(0, -1) : text
      textCount.value = cleanText.length

      // 保存纯文本内容
      plainTextContent.value = cleanText
    }
  }
}

// 当编辑器内容变化时调用
const onEditorChange = () => {
  updateCount()
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
        <div class="word-count">{{ textCount }} / {{ maxTextCount }}</div>
        <QuillEditor
          ref="editorRef"
          v-model="postContent"
          @text-change="onEditorChange"
          placeholder="在此输入帖子内容..."
          theme="snow"
          class="content-editor"
        />
      </div>

      <div class="post-footer">
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
    position: relative;

    .word-count {
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 12px;
      color: #999;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 2px 8px;
      border-radius: 10px;
      z-index: 10;
    }

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
