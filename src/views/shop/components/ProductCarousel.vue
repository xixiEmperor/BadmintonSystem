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

// 获取主题色
const getThemeColor = async () => {
  // 清空之前的数据
  imgUrlList.value = []

  carouselItems.value.forEach(item => {
    imgUrlList.value.push(item.mainImage)
  })

  const bgColorList = ref([])

  // 使用Promise.all并行处理所有请求
  try {
    const promises = imgUrlList.value.map(async (url, index) => {
      try {
        // 尝试不同的阿里云OSS参数格式
        const possibleUrls = [
          url + '?x-oss-process=image/average-hue',
          url + '@imageAve',
          url + '?imageView2/1/w/1/h/1/q/1', // 缩略图方式
        ]

        let color = '#6366f1' // 默认颜色
        let success = false

        // 尝试阿里云OSS参数
        for (const testUrl of possibleUrls) {
          try {
            console.log('尝试请求URL:', testUrl)
            const response = await axios.get(testUrl, {
              timeout: 5000,
              responseType: 'text' // 确保以文本形式接收
            })

            console.log('响应数据类型:', typeof response.data)
            console.log('响应数据长度:', response.data?.length)
            console.log('响应数据前100字符:', response.data?.substring(0, 100))

            // 检查是否是有效的颜色数据
            if (typeof response.data === 'string' && response.data.length < 50) {
              if (response.data.startsWith('#') || response.data.match(/^[0-9A-Fa-f]{6}$/)) {
                color = response.data.startsWith('#') ? response.data : '#' + response.data
                success = true
                console.log(`通过OSS获取到图片${index + 1}的主题色:`, color)
                break
              }
            }
          } catch (error) {
            console.log(`URL ${testUrl} 请求失败:`, error.message)
            continue
          }
        }

        // 如果OSS方式都失败，使用Canvas提取主色调
        if (!success) {
          console.log('OSS方式失败，使用Canvas提取主色调')
          color = await extractColorFromImage(url)
          console.log(`通过Canvas获取到图片${index + 1}的主题色:`, color)
        }

        // 直接更新对应的轮播项背景色
        if (carouselItems.value[index]) {
          carouselItems.value[index].bgColor = `linear-gradient(135deg, ${color}88, ${color}CC)`
        }

        return color
      } catch (error) {
        console.error('获取图片主题色失败:', error)

        // 返回默认颜色并应用到轮播项
        const defaultColor = '#6366f1'
        if (carouselItems.value[index]) {
          carouselItems.value[index].bgColor = `linear-gradient(135deg, ${defaultColor}88, ${defaultColor}CC)`
        }
        return defaultColor
      }
    })

    const results = await Promise.all(promises)
    bgColorList.value = results
    console.log('所有主题色:', bgColorList.value)
  } catch (error) {
    console.error('批量获取主题色失败:', error)
  }
}

// 使用Canvas提取图片主色调
const extractColorFromImage = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // 处理跨域

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // 设置小尺寸以提高性能
        canvas.width = 50
        canvas.height = 50

        // 绘制图片
        ctx.drawImage(img, 0, 0, 50, 50)

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, 50, 50)
        const data = imageData.data

        let r = 0, g = 0, b = 0
        let pixelCount = 0

        // 计算平均颜色
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          pixelCount++
        }

        r = Math.round(r / pixelCount)
        g = Math.round(g / pixelCount)
        b = Math.round(b / pixelCount)

        // 转换为十六进制
        const hex = '#' + [r, g, b].map(x => {
          const hex = x.toString(16)
          return hex.length === 1 ? '0' + hex : hex
        }).join('')

        resolve(hex)
      } catch (error) {
        console.error('Canvas提取颜色失败:', error)
        resolve('#6366f1') // 默认颜色
      }
    }

    img.onerror = () => {
      console.error('图片加载失败:', imageUrl)
      resolve('#6366f1') // 默认颜色
    }

    img.src = imageUrl
  })
}

onMounted(async () => {
  await fetchCarouselItems()
  await getThemeColor()
})
</script>

<template>
  <div class="product-carousel">
    <el-carousel
      :interval="4000"
      type="card"
      height="280px"
      class="carousel-container">
      <el-carousel-item
        v-for="item in carouselItems"
        :key="item.id"
        class="carousel-item">
        <div
          class="carousel-content"
          :style="{ background: item.bgColor }">
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
            <img :src="item.mainImage" :alt="item.title" class="carousel-image">
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
.product-carousel {
  margin: 20px 0 30px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.carousel-container {
  border-radius: 12px;
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

/* .carousel-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(255, 255, 255, 0.1); */
  /* 性能优化方案选择（取消注释使用）：*/

  /* 方案1：移除backdrop-filter，使用更深的半透明背景 */
  /* background: rgba(255, 255, 255, 0.2); */

  /* 方案2：使用will-change优化，但可能增加内存使用 */
  /* backdrop-filter: blur(10px); */
  /* will-change: backdrop-filter; */

  /* 方案3：减少模糊强度 */
  /* backdrop-filter: blur(5px); */

  /* 方案4：使用transform3d强制硬件加速 */
  /* transform: translateZ(0); */

  /* z-index: 1; */
/* } */

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
:deep(.el-carousel__indicator) {
  background-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-carousel__indicator.is-active) {
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.el-carousel__arrow) {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
