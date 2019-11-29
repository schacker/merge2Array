---
title: 数组去重谁更快
date: 2019-11-26 15:47:09
tags:
---
昨天在写我司`node`中间层路由新方案的时候，在最后需要合并多个路由实例，在写到`Router.merge`函数的时候，突发奇想数组去重谁都会写，但效率哪个更高？于是就有了以下内容

### 常用数组去重

🙈 环境：`mac 10.14.3 (18D109)，node-8.6，8G内存`，测试数据量`15W`

### 测试基础

```ts
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

function merge2Array() {
  // 不同实现逻辑
}

log(`${c.cyan}after merge length${c.end}: ${merge2Array4(origin, target).length}`)

const end = Date.now()
log(`${c.red}all times${c.end}: ${end - start}`)
```

#### 第一种

```ts
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
```

![结果](http://schacker.lijundong.com/filter+indexOf.png)

#### 第二种

```ts
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
```

![结果](http://schacker.lijundong.com/for+for.png)

#### 第三种

```ts
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
```

![结果](http://schacker.lijundong.com/for+includes.png)

#### 第四种

```ts
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
```

![结果](http://schacker.lijundong.com/sort+for.png)

#### 第五种

```ts
/**
 * Array.from + Set
 * 代码最少，性能最好？
 * @param {*} origin
 * @param {*} target
 */
function merge2Array4 (origin, target) {
  return Array.from(new Set([...origin, ...target]))
}
```

![结果](http://schacker.lijundong.com/ArrayFrom+Set.png)

#### 第六种

```ts
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
```

![结果](http://schacker.lijundong.com/for+obj.png)

#### 第七种

```ts
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
```

![结果](http://schacker.lijundong.com/for+set.png)

### 数据级上升（150W）

我们针对最后两种方法进行数量级提升，提升至`150w`数据

#### Array.from + Set

![结果](http://schacker.lijundong.com/ArrayFrom%20+%20Set%20in%20150W.png)

#### for + obj-keys

![结果](http://schacker.lijundong.com/for+obj%20in%20150W.png)

#### for + set

![结果](http://schacker.lijundong.com/for%20+%20set%20in%20150W.png)

### 总结

- 如果你去重的是单一基础类型，那直接用`for-obj-keys`方式是最快的
- 如果你去重的是多种基础类型，最快的是`for-set`方式是最快的
