---
title: P7986 [USACO21DEC] HILO P 题解
date: 2023-08-21 21:49:04
tags:
- 题解
- 洛谷
- 数学
- 期望
categories:
- 题解
- 数学
- 期望
---

## Description

给定两个数 $n,x$，对于一个排列 $a$，可以进行如下操作：从前到后枚举 $a_i$，若 $a_i>x$ 且之前不存在 $j$，使得 $x<a_j<a_i$，或者 $a_i\leq x$ 且之前不存在 $j$，使得 $a_i<a_j\leq x$ 就把 $a_i$ 加到一个队列 $b$ 里面。

定义序列 $a$ 的价值为 $b$ 中形如 $b_i>x$ 且 $b_{i+1}\leq x$ 的所有 $i$ 的个数。

问所有含 $n$ 个数的排列的价值总和对 $10^9+7$ 取模的值。

$0\leq x\leq n\leq 5000$。

[link](https://www.luogu.com.cn/problem/P7986)

<!--more-->

## Solution

令 $y=n-x,a_i=x+i,b_i=x-i+1$，那么题目就相当于问将 $a,b$ 放到一起全排列，取出其中所有不同的前缀下标最小值，问形如 $ab$ 的个数。

显然是个 dp，设 $f_{i,j,0/1}$ 表示当前 $a$ 数组中下标的最小值为 $i$，$b$ 数组中的为 $j$，且当前最后面的是 $a/b$ 的价值和。

容易发现这个状态是不好做的，因为不是下标最小值的数虽然不能对价值和造成贡献，但是可能会使这个价值和的方案数变多，这样就变得难做了。如果强行把这个加到状态里的话，可能又会 TLE。

那么怎样才能把那些无效的数造成的影响去除呢？

---

注意到题目中的方案数是一定的，为 $n!$，所以可设 $f_{i,j,0/1}$ 表示还有 $i$ 个有效的 $a$，$j$ 个有效的 $b$，且填完这 $i+j$ 个数之前，最后面的是 $a/b$ 的价值和的**期望**。

先考虑 $f_{i,j,1}$，然后枚举下一步选的**有效**的数，容易知道每种选法的概率是 $\displaystyle\frac{1}{i+j}$。

如果选的是 $a_k$，那么下下步之后，只有 $k-1$ 个有效的 $a$，$j$ 个有效的 $b$，期望就是 $f_{k-1,j,0}$。

同理，如果选的是 $b_k$，那么下下步之后，只有 $k-1$ 个有效的 $b$，$i$ 个有效的 $a$，由于这样期望就是 $f_{i,k-1,1}$。

然后考虑 $f_{i,j,0}$：

如果选的是 $a_k$，那么下下步之后，只有 $k-1$ 个有效的 $a$，$j$ 个有效的 $b$，期望就是 $f_{k-1,j,0}$。

如果选的是 $b_k$，那么下下步之后，只有 $k-1$ 个有效的 $b$，$i$ 个有效的 $a$，由于上一步选的是 $a$，而这一步选了 $b$，会对价值造成贡献，所以期望是 $f_{i,k-1,1}+1$。

所以可以列出式子：
$$
f_{i,j,1}=\frac{1}{i+j}\left(\sum_{k=0}^{i-1}{f_{k,j,0}}+\sum_{k=0}^{j-1}{f_{i,k,1}}\right)\\
f_{i,j,0}=\frac{1}{i+j}\left(\sum_{k=0}^{i-1}{(f_{k,j,0}+1)}+\sum_{k=0}^{j-1}{f_{i,k,1}}\right)=f_{i,j,1}+\frac{i}{i+j}
$$
答案就是
$$
\frac{n!}{x+y}\left(\sum_{k=0}^{x-1}{f_{k,y,0}}+\sum_{k=0}^{y-1}{f_{x,k,1}}\right)
$$
直接 dp 即可做到 $O(n^2)$。

---

这样做是对的，但是它看起来又和不加期望的做法差异不大，而且把无效的数的影响解决了，期望为什么能做到这一点呢？

回到状态转移方程，可以假设已知当前操作成了 $f_{i,j,0}$  所对应的局面，设 $s_{i,j,0/1}$ 表示所有还有 $i$ 个有效的 $a$，$j$ 个有效的 $b$，且填完这 $i+j$ 个数之前，最后面的是 $a/b$ 的方案数。不妨设 $l$ 表示这 $s_{i,j,0}$ 个方案中的一种

考虑枚举下一个状态 $f_{k,j,0}$，设 $h$ 表示从 $l$ 操作到 $f_{k,j,0}$ 这个状态的的所有方案数，$m$ 表示这 $h$ 个方案中的一个。

那么 $l$ 状态对 $f_{i,j,0}$ 的贡献即为 $\displaystyle\frac{1}{s_{i,j,0}}\sum_{m}{\frac{1}{h}f_{k,j,0}=\frac{f_{k,j,0}}{s_{i,j,0}}}$，会发现再对所有的 $l$，共 $s_{i,j,0}$ 个方案求和就是 $f_{k,j,0}$，这就把无效数的影响解决了。

其实这就是期望的线性性质。

## Code

```cpp
#include <bits/stdc++.h>

// #define int int64_t

using i64 = int64_t;

const int kMaxN = 5005, kMod = 1e9 + 7;

int n, x;
int inv[kMaxN], s1[kMaxN], s2[kMaxN];

void dickdreamer() {
  std::cin >> n >> x;
  inv[1] = 1;
  for (int i = 2; i <= n; ++i)
    inv[i] = (i64)(kMod - kMod / i) * inv[kMod % i] % kMod;
  for (int i = 0; i <= n - x; ++i) {
    for (int j = 0; j <= x; ++j) {
      int ff = (i64)inv[i + j] * (s1[j] + s2[i]) % kMod, f = (ff + (i64)j * inv[i + j] % kMod) % kMod;
      s1[j] = (s1[j] + f) % kMod;
      s2[i] = (s2[i] + ff) % kMod;
      if (i == n - x && j == x) {
        for (int k = 1; k <= n; ++k)
          ff = (i64)ff * k % kMod;
        std::cout << ff << '\n';
        return;
      }
    }
  }
}

int32_t main() {
#ifdef ORZXKR
  freopen("in.txt", "r", stdin);
  freopen("out.txt", "w", stdout);
#endif
  std::ios::sync_with_stdio(0), std::cin.tie(0), std::cout.tie(0);
  int T = 1;
  // std::cin >> T;
  while (T--) dickdreamer();
  // std::cerr << 1.0 * clock() / CLOCKS_PER_SEC << "s\n";
  return 0;
}
```

## Summary

OI 里面的 dp 求和题如果总状态数一定，且状态外的东西对 dp 状态只对方案数有影响，对实际权值没有影响，那么就可以转化为求期望和，有时看似差异不大，但是可以把那些状态外东西的影响消除。
