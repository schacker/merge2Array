const { log, c } = require('./util')

const origin = Array.from(new Array(100000), (x, index) => {
  return index
})

// 包含数据尽量均匀分布
const target = Array.from(new Array(50000), (x, index) => {
  return index + index
})

const start = Date.now()
log(`${c.cyan}start${c.end}`)

/**
 * 第一种，看似简洁，性能是不是也很牛逼？
 * filter + indexOf
 * @param {*} origin 
 * @param {*} target 
 */
function merge2Array(origin, target) {
  const result = origin.concat(target)
  return result.filter((item, index) => {
    return result.indexOf(item) === index
  })
}

/**
 * 第二种，复杂点（是不是感觉有点像某种排序了？），代码这么多性能是不是很糟？
 * for + for
 * @param {*} origin 
 * @param {*} target 
 */
function merge2Array1(origin, target) {
  const result = origin.concat(target)
  let len = result.length
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (result[i] === result[j]) {
        result.splice(j, 1);
        // splice 会改变数组长度，所以要将数组长度 len 和下标 j 减一
        len--;
        j--;
      }
    }
  }
  return result
}
/**
 * for + includes
 * @param {*} origin 
 * @param {*} target 
 */
function merge2Array2(origin, target) {
  origin = origin.concat(target)
  const result = []
  for (const i of origin) {
    !result.includes(i) && result.push(i)
  }
  return result
}
/**
 * sort + for
 * @param {*} origin 
 * @param {*} target 
 */
function merge2Array3(origin, target) {
  origin = origin.concat(target)
  origin.sort()
  const result = [origin[0]]
  const len = origin.length
  for (let i = 1; i < len; i++) {
    if (origin[i] !== origin[i-1]) {
      result.push(origin[i])
    }
  }
  return result
}
/**
 * Array.from + Set
 * 代码最少，性能最好？
 * @param {*} origin 
 * @param {*} target 
 */
function merge2Array4 (origin, target) {
  return Array.from(new Set([...origin, ...target]))
}

/**
 * for + obj-keys
 * 单一基础类型最快的
 * @param {*} origin 
 * @param {*} target 
 */
function merge2Array5(origin, target) {
  origin = origin.concat(target)
  const result = []
  const tagObj = {}
  for (const i of origin) {
    if (!tagObj[i]) {
      result.push(i)
      tagObj[i] = 1
    }
  }
  return result
}
/**
 * for + set
 * 多种基础数据类型最快
 * @param {*} origin 
 * @param {*} target 
 */
function merge2Array6(origin, target) {
  origin = origin.concat(target)
  const result = []
  const set = new Set()
  for (const i of origin) {
    if (!set.has(i)) {
      result.push(i)
      set.add(i)
    }
  }
  return result
}

log(`${c.cyan}after merge length${c.end}: ${merge2Array5(origin, target).length}`)

const end = Date.now()
log(`${c.red}all times${c.end}: ${end - start}`)