<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecommendProducts } from '@/api/shop'
import axios from 'axios'

const router = useRouter()

// 轮播图数据
const carouselItems = ref([])

// 跳转到商品详情
const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

// 获取轮播图数据
const fetchCarouselItems = async () => {
  try {
    const res = await getRecommendProducts()
    if (res.data.code === 0) {
      carouselItems.value = res.data.data
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    console.error('获取轮播图数据失败', error)
  }
}

const imgUrlList = ref([])

// 预设的漂亮颜色方案
const colorPalettes = [
  { primary: '#FF6B6B', secondary: '#4ECDC4' }, // 珊瑚红 + 薄荷绿
  { primary: '#845EC2', secondary: '#FF8066' }, // 紫色 + 橘色
  { primary: '#FFD93D', secondary: '#6BCF7F' }, // 金黄 + 翠绿
  { primary: '#FF8E9B', secondary: '#C7CEEA' }, // 粉红 + 淡紫
  { primary: '#A8E6CF', secondary: '#FFEAA7' }, // 薄荷 + 淡黄
  { primary: '#74B9FF', secondary: '#FD79A8' }, // 天蓝 + 粉色
  { primary: '#FDCB6E', secondary: '#6C5CE7' }, // 橙黄 + 紫色
  { primary: '#55A3FF', secondary: '#FEA47F' }, // 蓝色 + 橙粉
  { primary: '#26DE81', secondary: '#FC7C7C' }, // 翠绿 + 红粉
  { primary: '#A29BFE', secondary: '#FDA085' }, // 淡紫 + 橙色
]

// 根据字符串生成一个稳定的颜色索引
const getColorIndexFromString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash) % colorPalettes.length
}

// 获取主题色（使用预设颜色方案）
const getThemeColor = async () => {
  console.log('🎨 开始设置主题色，使用预设颜色方案')
  console.log('轮播图数据:', carouselItems.value)

  try {
    carouselItems.value.forEach((item, index) => {
      // 基于商品名称或ID生成稳定的颜色
      const colorIndex = getColorIndexFromString(item.productName + item.productId)
      const palette = colorPalettes[colorIndex]
      
      // 创建渐变背景
      const gradient = `linear-gradient(135deg, ${palette.primary}CC, ${palette.secondary}AA)`
      
      // 应用背景色
      item.bgColor = gradient
      
      console.log(`🎨 商品"${item.productName}"应用颜色方案${colorIndex + 1}: ${palette.primary} → ${palette.secondary}`)
      console.log(`   渐变效果: ${gradient}`)
    })
    
    console.log('🎉 所有主题色设置完成')
    
  } catch (error) {
    console.error('❌ 设置主题色失败:', error)
  }
}

// 备用方案：如果需要后端代理OSS颜色提取
const getThemeColorViaProxy = async () => {
  console.log('🌐 通过后端代理获取主题色')
  console.log('图片列表:', carouselItems.value.map(item => ({ name: item.productName, url: item.mainImage })))
  
  try {
    const promises = carouselItems.value.map(async (item, index) => {
      try {
        console.log(`📡 开始请求图片${index + 1}: ${item.productName}`)
        console.log(`   图片URL: ${item.mainImage}`)
        
        // 调用后端代理接口
        const response = await axios.post('/api/image/extract-color', {
          imageUrl: item.mainImage
        })
        
        console.log(`📡 图片${index + 1}响应:`, response.data)
        
        if (response.data.code === 0) {
          const color = response.data.data.color
          const source = response.data.data.source
          const gradient = `linear-gradient(135deg, ${color}CC, ${adjustColorBrightness(color, -30)}DD)`
          
          item.bgColor = gradient
          item.colorSource = source === 'oss' ? '阿里云OSS' : source === 'java' ? 'Java处理' : source
          console.log(`✅ 通过${source}获取到图片${index + 1}的主题色: ${color}`)
          console.log(`   渐变效果: ${gradient}`)
          
          return { color, source, success: true }
        } else {
          throw new Error(response.data.msg || '后端返回错误')
        }
      } catch (error) {
        console.error(`❌ 图片${index + 1}(${item.productName})颜色获取失败:`, error.message)
        
        // 回退到预设颜色
        const colorIndex = getColorIndexFromString(item.productName + item.productId)
        const palette = colorPalettes[colorIndex]
        const gradient = `linear-gradient(135deg, ${palette.primary}CC, ${palette.secondary}AA)`
        
        item.bgColor = gradient
        item.colorSource = '预设方案'
        console.log(`🔄 图片${index + 1}回退到预设颜色方案${colorIndex + 1}: ${palette.primary} → ${palette.secondary}`)
        
        return { color: palette.primary, source: 'fallback', success: false, error: error.message }
      }
    })
    
    const results = await Promise.all(promises)
    
    // 统计结果
    const successCount = results.filter(r => r.success).length
    const fallbackCount = results.filter(r => !r.success).length
    
    console.log('🎉 代理方式主题色获取完成!')
    console.log(`   成功: ${successCount}/${results.length}`)
    console.log(`   回退: ${fallbackCount}/${results.length}`)
    console.log('   详细结果:', results)
    
    if (successCount === 0) {
      console.warn('⚠️ 所有图片都获取颜色失败，可能需要检查后端服务')
    }
    
  } catch (error) {
    console.error('❌ 代理方式获取主题色完全失败:', error)
    console.log('🔄 完全回退到预设方案')
    // 完全回退到预设方案
    await getThemeColor()
  }
}

// 调整颜色亮度的辅助函数
const adjustColorBrightness = (hex, amount) => {
  // 移除#号
  const color = hex.replace('#', '')
  
  // 转换为RGB
  const num = parseInt(color, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  
  // 转换回16进制
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

onMounted(async () => {
  await fetchCarouselItems()
  console.log('📦 轮播图数据加载完成，开始获取真实图片颜色')
  
  // 使用后端代理获取真实的图片颜色
  await getThemeColorViaProxy()
})
</script>

<template>
  <div class="product-carousel">
    <el-carousel
      :interval="4000"
      type="card"
      height="280px"
      indicator-position="outside"
      arrow="never"
      class="carousel-container">
      <el-carousel-item
        v-for="item in carouselItems"
        :key="item.productId"
        class="carousel-item">
        <div
          class="carousel-content"
          :style="{ background: item.bgColor || 'linear-gradient(135deg, #6366f1AA, #4f46e5DD)' }">
          <div class="content-left">
            <h3 class="carousel-title">{{ item.productName }}</h3>
            <p class="carousel-subtitle">{{ item.subtitle }}</p>
            <el-button
              type="primary"
              size="large"
              class="carousel-button"
              @click="goToProduct(item.productId)">
              立即购买
            </el-button>
          </div>
          <div class="content-right">
            <img :src="item.mainImage" :alt="item.productName" class="carousel-image">
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
.product-carousel {
  margin: 20px 0 50px 0;
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.carousel-container {
  border-radius: 12px;
  overflow: hidden;
}

.carousel-item {
  border-radius: 12px;
  overflow: hidden;
}

.carousel-content {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 30px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.carousel-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.content-left {
  flex: 1;
  z-index: 2;
  position: relative;
}

.content-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  position: relative;
}

.carousel-title {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.carousel-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.carousel-button {
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.2s ease;
}

.carousel-button:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.carousel-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.carousel-image:hover {
  transform: scale(1.02);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .product-carousel {
    margin: 15px 0 20px 0;
  }

  .carousel-container {
    height: 200px !important;
  }

  .carousel-content {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .content-left {
    margin-bottom: 15px;
  }

  .content-right {
    display: none; /* 移动端隐藏图片 */
  }

  .carousel-title {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .carousel-subtitle {
    font-size: 14px;
    margin-bottom: 15px;
  }

  .carousel-button {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .carousel-container {
    height: 160px !important;
  }

  .carousel-content {
    padding: 15px;
  }

  .carousel-title {
    font-size: 18px;
  }

  .carousel-subtitle {
    font-size: 12px;
  }
}

/* 自定义轮播图指示器样式 */
:deep(.el-carousel__indicators--outside) {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-carousel__indicator) {
  padding: 8px 4px;
}

:deep(.el-carousel__button) {
  width: 40px;
  height: 6px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.15);
  border: none;
  transition: all 0.3s ease;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background-color: #4f80ff;
  transform: scaleX(1.5);
}

:deep(.el-carousel__indicator:hover .el-carousel__button) {
  background-color: rgba(79, 128, 255, 0.6);
}
</style>
