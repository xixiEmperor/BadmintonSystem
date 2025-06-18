/**
 * 基于发布订阅模式的任务队列管理器
 * 用于控制并发请求数量，避免服务器压力过大
 */
class TaskQueue {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 3 // 最大并发数
    this.delay = options.delay || 100 // 任务间延迟时间(ms)
    this.retryTimes = options.retryTimes || 2 // 重试次数

    this.queue = [] // 任务队列
    this.running = [] // 正在执行的任务
    this.completed = [] // 已完成的任务
    this.failed = [] // 失败的任务

    this.subscribers = {} // 事件订阅者
    this.isProcessing = false // 是否正在处理队列
  }

  /**
   * 订阅事件
   * @param {string} event 事件名称
   * @param {function} callback 回调函数
   */
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = []
    }
    this.subscribers[event].push(callback)
  }

  /**
   * 取消订阅
   * @param {string} event 事件名称
   * @param {function} callback 回调函数
   */
  unsubscribe(event, callback) {
    if (this.subscribers[event]) {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback)
    }
  }

  /**
   * 发布事件
   * @param {string} event 事件名称
   * @param {any} data 事件数据
   */
  publish(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件回调执行错误 [${event}]:`, error)
        }
      })
    }
  }

  /**
   * 添加任务到队列
   * @param {function} task 任务函数
   * @param {any} data 任务数据
   * @param {string} id 任务ID
   */
  addTask(task, data, id = null) {
    const taskItem = {
      id: id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      task,
      data,
      retryCount: 0,
      status: 'pending', // pending, running, completed, failed
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      error: null,
      result: null
    }

    this.queue.push(taskItem)
    this.publish('taskAdded', taskItem)

    // 如果没有在处理队列，开始处理
    if (!this.isProcessing) {
      this.processQueue()
    }

    return taskItem.id
  }

  /**
   * 批量添加任务
   * @param {Array} tasks 任务数组 [{task, data, id?}, ...]
   */
  addTasks(tasks) {
    const taskIds = []
    tasks.forEach(({ task, data, id }) => {
      const taskId = this.addTask(task, data, id)
      taskIds.push(taskId)
    })
    return taskIds
  }

  /**
   * 处理任务队列
   */
  async processQueue() {
    if (this.isProcessing) return

    this.isProcessing = true
    this.publish('queueStarted', {
      totalTasks: this.queue.length,
      maxConcurrency: this.maxConcurrency
    })

    while (this.queue.length > 0 || this.running.length > 0) {
      // 启动新任务直到达到最大并发数
      while (this.running.length < this.maxConcurrency && this.queue.length > 0) {
        const taskItem = this.queue.shift()
        this.executeTask(taskItem)
      }

      // 等待一段时间再检查
      await this.sleep(50)
    }

    this.isProcessing = false
    this.publish('queueCompleted', {
      completed: this.completed.length,
      failed: this.failed.length,
      total: this.completed.length + this.failed.length
    })
  }

  /**
   * 执行单个任务
   * @param {object} taskItem 任务项
   */
  async executeTask(taskItem) {
    taskItem.status = 'running'
    taskItem.startedAt = new Date()
    this.running.push(taskItem)

    this.publish('taskStarted', taskItem)

    try {
      // 执行任务
      const result = await taskItem.task(taskItem.data)

      // 任务成功完成
      taskItem.status = 'completed'
      taskItem.completedAt = new Date()
      taskItem.result = result

      this.moveTaskFromRunningToCompleted(taskItem)
      this.publish('taskCompleted', taskItem)

    } catch (error) {
      // 任务执行失败
      taskItem.error = error

      // 检查是否需要重试
      if (taskItem.retryCount < this.retryTimes) {
        taskItem.retryCount++
        taskItem.status = 'pending'

        // 重新加入队列
        this.removeTaskFromRunning(taskItem)
        this.queue.unshift(taskItem) // 优先处理重试任务

        this.publish('taskRetry', taskItem)
      } else {
        // 重试次数用完，标记为失败
        taskItem.status = 'failed'
        taskItem.completedAt = new Date()

        this.moveTaskFromRunningToFailed(taskItem)
        this.publish('taskFailed', taskItem)
      }
    }

    // 任务间延迟
    if (this.delay > 0) {
      await this.sleep(this.delay)
    }
  }

  /**
   * 将任务从运行中移动到已完成
   */
  moveTaskFromRunningToCompleted(taskItem) {
    this.removeTaskFromRunning(taskItem)
    this.completed.push(taskItem)
  }

  /**
   * 将任务从运行中移动到失败
   */
  moveTaskFromRunningToFailed(taskItem) {
    this.removeTaskFromRunning(taskItem)
    this.failed.push(taskItem)
  }

  /**
   * 从运行中移除任务
   */
  removeTaskFromRunning(taskItem) {
    const index = this.running.findIndex(t => t.id === taskItem.id)
    if (index !== -1) {
      this.running.splice(index, 1)
    }
  }

  /**
   * 获取队列状态
   */
  getStatus() {
    return {
      pending: this.queue.length,
      running: this.running.length,
      completed: this.completed.length,
      failed: this.failed.length,
      total: this.queue.length + this.running.length + this.completed.length + this.failed.length,
      isProcessing: this.isProcessing
    }
  }

  /**
   * 清空队列
   */
  clear() {
    this.queue = []
    this.completed = []
    this.failed = []
    this.publish('queueCleared', {})
  }

  /**
   * 暂停队列处理
   */
  pause() {
    this.isProcessing = false
    this.publish('queuePaused', {})
  }

  /**
   * 恢复队列处理
   */
  resume() {
    if (!this.isProcessing && (this.queue.length > 0 || this.running.length > 0)) {
      this.processQueue()
    }
  }

  /**
   * 获取失败的任务
   */
  getFailedTasks() {
    return this.failed
  }

  /**
   * 重试失败的任务
   */
  retryFailedTasks() {
    const failedTasks = [...this.failed]
    this.failed = []

    failedTasks.forEach(taskItem => {
      taskItem.status = 'pending'
      taskItem.retryCount = 0
      taskItem.error = null
      taskItem.startedAt = null
      taskItem.completedAt = null
      this.queue.push(taskItem)
    })

    this.publish('failedTasksRetried', { count: failedTasks.length })

    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  /**
   * 睡眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default TaskQueue
