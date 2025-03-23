/**
 * 路由导航工具函数
 */

import router from '@/router'

/**
 * 处理路由导航，根据路径类型决定是在当前窗口导航还是打开新标签页
 * @param {string} path - 路径
 * @param {Object} query - 查询参数
 */
export const navigate = (path, query = {}) => {
  // 需要在新标签页中打开的路径
  const newTabPaths = ['/', '/login', '/admin', '/post']

  // 判断是否需要在新标签页中打开
  const shouldOpenInNewTab = newTabPaths.some(
    (newTabPath) => path === newTabPath || path.startsWith(`${newTabPath}/`),
  )

  if (shouldOpenInNewTab) {
    // 需要在新标签页中打开的路径
    const url = new URL(path, window.location.origin)

    // 添加查询参数
    Object.keys(query).forEach((key) => {
      url.searchParams.append(key, query[key])
    })

    // 在新标签页中打开
    window.open(url.toString(), '_blank')
  } else {
    // 在当前页面中导航的路径
    router.push({ path, query })
  }
}
