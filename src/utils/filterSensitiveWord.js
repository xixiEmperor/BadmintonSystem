// 敏感词列表
const sensitiveWordList = ['王八', '王八蛋', '王八羔子', 'fuck', 'shit', '傻逼', '傻叉', '傻子', '傻缺']

// 初始化敏感词（转为树结构）
export const initSensitiveWord = () => {
  const sensitiveWordMap = new Map()

  for(const word of sensitiveWordList) {
    let currentMap = sensitiveWordMap
    for(let i = 0; i < word.length; i++) {
      const char = word[i]
      if(currentMap.get(char)) {
        currentMap = currentMap.get(char) // 如果已经记录过，则直接进入下一层
      } else {
        if(currentMap.get('laster') === true) { // 将当前节点设置为非尾节点（laster = true表示非尾节点），并进入下一层
          currentMap.set('laster', false)
        }
        const item = new Map()

        item.set('laster', true) // 不知道当前节点是否是叶子结点，统一不当做叶子结点，记录为需要往下遍历
        currentMap.set(char, item)
        currentMap = currentMap.get(char) // 设置完当前层后，进入下一层
      }
      // 如果已经遍历到叶子结点，则用lastDigit作为叶子结点的标识符
      if(word.length === i + 1){
        currentMap.set('lastDigit', true)
      }
    }
  }
  return sensitiveWordMap
}

export const sensitiveWordMap = initSensitiveWord()

// 检查敏感词是否存在
export const checkSensitiveWord = (sensitiveWordMap, txt, index) => {
  console.log(txt)
  let currentMap = sensitiveWordMap
  let flag = false
  let sensitiveWord = ''
  for(let i = index; i < txt.length; i++) {
    const char = txt[i]
    currentMap = currentMap.get(char)
    if(currentMap){
      sensitiveWord += char
      if(currentMap.get('laster') || currentMap.get('lastDigit')){
        flag = true
        break
      }
    }else{
      break
    }
  }
  return {
    flag,
    sensitiveWord
  }
}


  // 判断文本中是否存在敏感词
export const filterSensitiveWord = (txt, sensitiveMap) => {
  let matchResult = {
    flag: false,
    sensitiveWord: ""
  };
  // 过滤掉除了中文、英文、数字之外的
  const txtTrim = txt.replace(
    /[^\u4e00-\u9fa5\u0030-\u0039\u0061-\u007a\u0041-\u005a]+/g,
    ""
  );
  for (let i = 0; i < txtTrim.length; i++) {
    matchResult = checkSensitiveWord(sensitiveMap, txtTrim, i);
    if (matchResult.flag) {
      console.log(`sensitiveWord:${matchResult.sensitiveWord}`);
      break;
    }
  }
  return matchResult;
}
