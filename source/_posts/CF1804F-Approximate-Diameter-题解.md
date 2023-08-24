---
title: CF1804F Approximate Diameter 题解
date: 2023-06-29 15:44:57
tags:
- 题解
- Codeforces
- 思维
- 二分
- BFS
categories:
- 题解
- 二分
---

## Description

给定一个 $n$ 个点 $m$ 条边的初始无向图，有 $q$ 次更新，每次更新向图中添加一条边。设 $d(G_i)$ 代表加入 $i$ 条边后的图中两点之间的最大距离，你需要输出 $q+1$ 个整数 $a_0,a_1,\dots,a_q$，满足 $\left\lceil\dfrac{d(G_i)}{2}\right\rceil\le a_i\le 2\cdot d(G_i)$。

$n,m,q\le 10^5$，图连通。

<!--more-->

## Solution

首先一个普通图的 $d$ 肯定是不好求的，这题也没有让求，考虑转化。

设 $s_i$ 表示加入 $1\sim i$ 条边，$1$ 到其他点的最长距离，易知 $s_i\leq d(G_i)$。

如果 $1$ 在 $G_i$ 的直径上，则必有 $s_i\geq\left\lceil\dfrac{d(G_i)}{2}\right\rceil$。如果不在直径上的话就先走到直径上，$s_i$ 只会变得更大。

所以 $\left\lceil\dfrac{d(G_i)}{2}\right\rceil\leq s_i\leq d(G_i)$。

显然 $s_i$ 是满足条件的 $a_i$，暴力求就可以做到 $O(n^2)$。

---

观察到 $\left\lceil\dfrac{d(G_i)}{2}\right\rceil\leq s_i\leq d(G_i)$ 的右边界是没有卡满的，甚至只卡到了原来的 $\dfrac{1}{2}$，又因为左边界是递减的，所以考虑让 $s_i$ 代替后面的一部分 $s_j$。

考虑什么条件下 $i$ 能代替 $j(i\leq j)$。

根据上面的式子可得：$\left\lceil\dfrac{d(G_j)}{2}\right\rceil\leq s_j\leq d(G_j)$，$s_i\leq 2\times d(G_j)$。

所以当 $s_i\leq 2\times s_j$ 时 $i$ 能够代替 $j$，即 $s_j\geq \left\lceil\dfrac{s_i}{2}\right\rceil$。由于 $s_i$ 是递减的，所以可以二分 $j$ 找到 $i$ 能**确保**代替的最大的 $j$。

这样做每次 $s_j$ 相比 $s_i$ 会减半，所以最多会二分 $\log n$ 轮，每轮 $\log q$ 次，时间复杂度就是 $O(n\log n\log q)$。

注意：这里 $s_j<\left\lceil\dfrac{s_i}{2}\right\rceil$ 不代表 $i$ 不能代替 $j$，不过不管它对结果没什么影响。

## Code

```cpp
#include <algorithm>
#include <cstdio>
#include <iostream>
#include <queue>
#include <vector>

// #define int long long

const int kMaxN = 1e5 + 5;

int n, m, q;
int u[kMaxN], v[kMaxN], s[kMaxN], d[kMaxN];
std::vector<int> G[kMaxN], nG[kMaxN];

int bfs() {
  std::fill(d + 1, d + 1 + n, -1);
  std::queue<int> q;
  q.emplace(1), d[1] = 0;
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (auto v : nG[u]) {
      if (!~d[v]) {
        q.emplace(v), d[v] = d[u] + 1;
      }
    }
  }
  return *std::max_element(d + 1, d + 1 + n);
}

int get(int x) {
  if (~s[x]) return s[x];
  for (int i = 1; i <= n; ++i)
    nG[i] = G[i];
  for (int i = 1; i <= x; ++i)
    nG[u[i]].emplace_back(v[i]), nG[v[i]].emplace_back(u[i]);
  return s[x] = bfs();
}

void dickdreamer() {
  std::cin >> n >> m >> q;
  for (int i = 1; i <= m; ++i) {
    int u, v;
    std::cin >> u >> v;
    G[u].emplace_back(v), G[v].emplace_back(u);
  }
  for (int i = 1; i <= q; ++i)
    std::cin >> u[i] >> v[i];
  std::fill(s, s + 1 + q, -1);
  for (int i = 0, j = 0; i <= q; i = j + 1) {
    int L = i - 1, R = q + 1;
    while (L + 1 < R) {
      int mid = (L + R) >> 1;
      if (get(mid) >= (get(i) + 1) / 2) L = j = mid;
      else R = mid;
    }
    for (int k = i; k <= j; ++k)
      std::cout << get(i) << ' ';
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
  // std::cerr << 1.0 * clock() / CLOCKS_PER_SEC << 's' << std::endl;
  return 0;
}
```

