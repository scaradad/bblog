---
title: P3573 [POI2014] RAJ-Rally 题解
date: 2023-07-07 17:27:37
tags:
- 题解
- 洛谷
- 图论
- 拓扑排序
categories:
- 题解
- 图论
- 拓扑排序
---

## Description

给定一个 $n$ 个点 $m$ 条边的有向无环图，每条边长度都是 $1$。

请找到一个点，使得删掉这个点后剩余的图中的最长路径最短。

$n\leq 5\times 10^5,m\leq 10^6$。

<!--more-->

## Solution

设 $f_i$ 表示以 $i$ 为终点的最长路，$g_i$ 表示以 $i$ 为起点的最长路，$d_i$ 为 $i$ 的拓扑序。

这两个显然可以通过拓扑排序求出。

易知原图中的任何一个路径上的点的拓扑序一定是递增的，所以删掉一个点 $u$，剩余的路径只有 $f_i(d_i<d_u),g_i(d_i>d_u),f_i+g_j+1(d_i<d_u<d_j)$ 三种可能。

那么就可以维护三个 multiset，分别维护 $f_i(d_i<d_u),g_i(d_i>d_u),f_i+g_j+1(d_i<d_u<d_j)$。

前两个直接在从小到大枚举 $d_u$ 的时候增删，第三个可以每次先加入 $d_i=d_u-1$ 的所有边，然后删去 $d_j=d_u$ 的所有边，这样可以保证 $d_i<d_u$ 且 $d_j>d_u$。

时间复杂度：$O((n+m)\log (n+m))$。

## Code

```cpp
#include <algorithm>
#include <cassert>
#include <cstdio>
#include <iostream>
#include <queue>
#include <set>
#include <vector>

// #define int int64_t

const int kMaxN = 5e5 + 5;

int n, m, cnt;
int id[kMaxN], deg[kMaxN], f[kMaxN], g[kMaxN];
std::vector<int> G[kMaxN], rG[kMaxN];
std::multiset<int> s1, s2, s3;

// s1 : f[u]
// s2 : g[u]
// s3 : f[u] + g[v] + 1(u < i < v)

void topo() {
  std::queue<int> q;
  for (int i = 1; i <= n; ++i) {
    if (!deg[i]) {
      q.emplace(i), f[i] = 0;
    }
  }
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    id[++cnt] = u;
    for (auto v : G[u]) {
      f[v] = std::max(f[v], f[u] + 1);
      if (!--deg[v])
        q.emplace(v);
    }
  }
}

void dickdreamer() {
  std::cin >> n >> m;
  for (int i = 1; i <= m; ++i) {
    int u, v;
    std::cin >> u >> v;
    G[u].emplace_back(v), rG[v].emplace_back(u);
    ++deg[v];
  }
  topo();
  for (int i = n; i; --i) {
    int u = id[i];
    for (auto v : G[u])
      g[u] = std::max(g[u], g[v] + 1);
  }
  for (int i = 1; i <= n; ++i)
    s2.emplace(-g[i]);
  int ans = 1e9, idx = 1;
  for (int i = 1; i <= n; ++i) {
    int u = id[i];
    if (i) {
      for (auto v : G[id[i - 1]])
        s3.emplace(-(f[id[i - 1]] + g[v] + 1));
    }
    for (auto v : rG[u]) {
      s3.erase(s3.lower_bound(-(f[v] + g[u] + 1)));
    }
    if (i) s1.emplace(-f[id[i - 1]]);
    s2.erase(s2.lower_bound(-g[u]));
    int mx = 0;
    if (!s1.empty()) mx = std::max(mx, -*s1.begin());
    if (!s2.empty()) mx = std::max(mx, -*s2.begin());
    if (!s3.empty()) mx = std::max(mx, -*s3.begin());
    if (mx < ans) {
      ans = mx, idx = u;
    }
  }
  std::cout << idx << ' ' << ans << '\n';
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

