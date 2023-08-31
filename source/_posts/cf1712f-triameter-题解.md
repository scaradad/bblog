---
title: CF1712F Triameter 题解
date: 2023-08-31 19:19:09
tags:
  - 题解
  - Codeforces
  - 图论
  - DP
  - 树形DP
  - 长链剖分
categories:
  - DP
  - 树形DP
  - 长链剖分
comments: true
---
## Description

你有一棵有 $n$ 个点的树，树上的每条边权值都为 $1$。现在有 $q$ 次询问，每次询问一个整数 $x$，并将叶子结点全部相连上权值为 $x$ 的边（操作不会保留）。问每次操作后图的直径是多少。图的直径定义为 $\underset{1\leq u<v\leq n}{\max}d(u,v)$。

$3\leq n\leq 10^6,1\leq q\leq 10$

<!--more-->

## Solution

考虑转化一下 $d(u,v)$。

设 $h_i$ 表示 $i$ 到叶子节点的最短距离，那么 $d(u,v)$ 就等于 $\min\{\text{dist}(u,v),h_u+h_v+x\}$。

然后枚举一下 $u$ 和 $v$ 的 $\text{LCA}$，设它为 $k$。那么 $d(u,v)=\min\{\text{dep}_u+\text{dep}_v-2\times \text{dep}_k,h_u+h_v+x\}$。

如果当前的答案为 $ans$，$d(u,v)$ 只有 $\text{dep}_u+\text{dep}_v-2\times \text{dep}_k>ans$ 且 $h_u+h_v+x>ans$ 时 $ans$ 才可被更新。

设 $M_{i,j}$ 表示 $i$ 子树里面 $h_{x}=j$ 的最大的 $\text{dep}_x$。

由于 $i$ 的子树里面不可能 $d$ 全都大于 $d_i$，因为一定有 $0$，并且相邻的两个点 $d$ 值相差不超过 $1$，所以 $0\sim d_i$ 都会在 $i$ 的子树里面出现，那么 $M_{i,j}\geq M_{i,j+1}$。

然后对于 $k$ 的两个个儿子 $a$ 和 $b$，它们子树里如果存在能让 $ans$ 更新的点对，说明存在 $i,j$，使得 $i+j+x>ans$ 且 $M_{a,i}+M_{b,j}-2\times\text{dep}_k>ans$。

移项就得出 $M_{a,i}+M_{b,\max(ans-x-i+1,0)}-2\times \text{dep}_k>ans$。

容易发现 $M_{i,j}$ 不为 $0$ 说明 $j$ 不超过 $i$ 这个子树里面的长链长度，所以直接长剖优化即可。

时间复杂度：$O(nq)$，常数很大。

## Code

```cpp
#include <bits/stdc++.h>

// #define int int64_t

const int kMaxN = 1e6 + 5;

int n, ans, x;
int d[kMaxN], dep[kMaxN];
std::vector<int> G[kMaxN], f[kMaxN];

void dfs1(int u, int fa) {
  dep[u] = dep[fa] + 1;
  if (G[u].size() != 1) d[u] = 1e9;
  for (auto v : G[u]) {
    if (v == fa) continue;
    dfs1(v, u);
    d[u] = std::min(d[u], d[v] + 1);
  }
}

void dfs2(int u, int fa) {
  for (auto v : G[u]) {
    if (v == fa) continue;
    d[v] = std::min(d[v], d[u] + 1);
    dfs2(v, u);
  }
}

void merge(int u, int v) {
  for (int i = 0; i < static_cast<int>(f[v].size()); ++i) {
    for (;;) {
      int j = std::max(ans - x - i + 1, 0);
      if (j < static_cast<int>(f[u].size()) && f[v][i] + f[u][j] - 2 * dep[u] > ans) ++ans;
      else break;
    }
  }
  for (int i = 0; i < static_cast<int>(f[v].size()); ++i)
    f[u][i] = std::max(f[u][i], f[v][i]);
}

void dfs3(int u, int fa) {
  int mxid = 0;
  for (auto v : G[u]) {
    if (v == fa) continue;
    dfs3(v, u);
    if (f[v].size() > f[mxid].size()) mxid = v;
  }
  std::swap(f[u], f[mxid]);
  for (auto v : G[u]) {
    if (v == fa || v == mxid) continue;
    merge(u, v);
  }
  for (;;) {
    int i = std::max(ans - x - d[u] + 1, 0);
    if (i < static_cast<int>(f[u].size()) && f[u][i] - dep[u] > ans) ++ans;
    else break;
  }
  if (d[u] == static_cast<int>(f[u].size()))
    f[u].emplace_back(dep[u]);
}

void dickdreamer() {
  std::cin >> n;
  for (int i = 2; i <= n; ++i) {
    int p;
    std::cin >> p;
    G[p].emplace_back(i), G[i].emplace_back(p);
  }
  dfs1(1, 0), dfs2(1, 0);
  int q;
  std::cin >> q;
  for (; q; --q) {
    std::cin >> x;
    for (int i = 1; i <= n; ++i) {
      f[i].clear(), f[i].shrink_to_fit();
    }
    ans = 0;
    dfs3(1, 0);
    std::cout << ans << ' ';
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