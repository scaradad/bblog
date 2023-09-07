---
title: P9189 [USACO23OPEN] Custodial Cleanup G 题解
date: 2023-09-07 22:38:55
tags:
  - 题解
  - 搜索
  - bfs
  - USACO
categories:
  - 搜索
  - bfs
comments: true
---
## Description

奶牛旅馆可以被看作一个 $N$ 个节点 $M$ 条边的无向简单图，其中每个房间有一个颜色 $C_i$，以及一个钥匙，颜色为 $S_i$， FJ 最初在 $1$ 号节点，手上一把钥匙都没有。

FJ 可以进行无数次以下操作：

- 捡起当前房间的钥匙。（FJ 可以同时手持多个钥匙）

- 将部分或全部手上的钥匙放在当前房间。 (房间内可以同时放多把钥匙)

- 通过一条边，移到一个相邻的房间，前提是目标房间是房间 $1$, 或者 FJ 拥有至少一个目标房间颜色的钥匙。

已知 $F$ 是 $S$ 的排列， FJ 想要让每个房间里面都恰好有一个 $F_i$ 颜色的钥匙，求是否可能。

有 $T$ 组数据，每组数据由一个空行开始，接着先给定 $3$ 行每行 $N$ 个整数，分别表示 $C$,$S$,$F$，最后给定 $M$ 行，每行两个整数表示一条边。

$0 \le M \le 10^5$, $1 \le C_i, S_i, F_i, u_i, v_i \le N \le 10^5$。
$1 \le T \le 100$, $1 \le \sum N \le 10^5$, $1 \le \sum M \le 2\cdot 10^5$。
<!--more-->

## Solution

首先如果一边捡钥匙一边放钥匙一定是不优的，因为如果不放当前的钥匙，那么后面能捡的钥匙一定不会减少，还会多出一些额外的钥匙。那么如果只捡钥匙都捡不全的话其他所有的方案也一定不可能成功。

---

先考虑怎么才能捡到能捡到的所有钥匙。

设 $p_i$ 表示捡钥匙序列的前 $i$ 个钥匙颜色组成的集合，那么如果第 $i$ 个钥匙是 $s_v$，一定要满足 $c_v\in p_{i-1}$ 才能捡 $s_v$。

于是 bfs 就呼之欲出了，每次直接跑当前已经捡了钥匙的点的所有邻居，如果能捡就捡。

但是这样有个问题，如果一个钥匙颜色为 $1$ 的点旁边有很多颜色为 $2$ 的点，但是 $1$ 点走很多步能到达一个钥匙颜色为 $2$ 的点 $u$，且 $u$ 与这些颜色为 $2$ 的点不相邻，这个做法就无法捡到所有钥匙。

考虑用一个 set $st_i$ 维护当前所有遍历过的点中，颜色为 $i$ 的点中有多少还不能捡，那么每次从队列里取出一个点 $u$，就可以先把所有 $st_{s_u}$ 里的点捡了，然后继续像上面那样遍历即可。

---

然后是怎么尽可能地把捡来的钥匙放到每个点上。

设 $p_i$ 表示放钥匙序列的前 $i$ 个钥匙颜色组成的集合，$q_i$ 表示放钥匙序列的从 $i$ 开始的后缀组成的集合，那么如果第 $i$ 个钥匙是 $s_v$，一定要满足 $c_v\in \text{total}-p_{i-1}=q_{i}$ 才能放 $f_v$。

于是只要向刚才那样从 $1$ 开始跑一遍 bfs 即可，注意如果 $f_v\notin q_{i+1}$ 但是 $f_v=c_v$ 的话同样是可以放到队列里的。

---

还有个细节就是不一定能捡到全部的钥匙，那么说明第一次 bfs 中没有被捡的点一定不会再被改变，那么如果它们的初始钥匙和结束钥匙颜色不同就说明一定不合法。而且第二次 bfs 如果遇到了个不可能被经过的点就直接跳过，否则有可能 bfs 到一个不可能经过的点 $v$，满足 $c_v\notin \text{total}$，但是如果 $c_v=s_v=f_v$ 的话会误判为可以经过。

时间复杂度：$O\left((n+m)\log n\right)$。

## Code

```cpp
#include <bits/stdc++.h>

// #define int int64_t

const int kMaxN = 1e5 + 5;

int n, m;
int c[kMaxN], s[kMaxN], f[kMaxN];
bool have[kMaxN], vis[kMaxN], v1[kMaxN];
std::vector<int> G[kMaxN];
std::set<int> st[kMaxN];

bool bfs1() {
  std::queue<int> q;
  for (int i = 1; i <= n; ++i) {
    st[i].clear();
    have[i] = vis[i] = v1[i] = 0;
  }
  q.emplace(1), vis[1] = have[s[1]] = 1;
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (auto v : st[s[u]])
      if (!vis[v]) q.emplace(v), vis[v] = have[s[v]] = 1;
    st[s[u]].clear();
    for (auto v : G[u]) {
      if (vis[v]) continue;
      if (have[c[v]]) q.emplace(v), vis[v] = have[s[v]] = 1;
      else st[c[v]].emplace(v);
    }
  }
  for (int i = 1; i <= n; ++i)
    if (!vis[i])
      v1[i] = 1;
  for (int i = 1; i <= n; ++i)
    if (!vis[i] && s[i] != f[i])
      return 0;
  return 1;
}

bool bfs2() {
  std::queue<int> q;
  for (int i = 1; i <= n; ++i) {
    st[i].clear();
    have[i] = vis[i] = 0;
  }
  q.emplace(1), vis[1] = have[f[1]] = 1;
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (auto v : st[f[u]])
      if (!vis[v]) q.emplace(v), vis[v] = have[f[v]] = 1;
    st[f[u]].clear();
    for (auto v : G[u]) {
      if (vis[v] || v1[v]) continue;
      if (have[c[v]] || c[v] == f[v]) q.emplace(v), vis[v] = have[f[v]] = 1;
      else st[c[v]].emplace(v);
    }
  }
  for (int i = 1; i <= n; ++i)
    if (!vis[i] && s[i] != f[i])
      return 0;
  return 1;
}

void dickdreamer() {
  std::cin >> n >> m;
  for (int i = 1; i <= n; ++i)
    G[i].clear();
  for (int i = 1; i <= n; ++i)
    std::cin >> c[i];
  for (int i = 1; i <= n; ++i)
    std::cin >> s[i];
  for (int i = 1; i <= n; ++i)
    std::cin >> f[i];
  for (int i = 1; i <= m; ++i) {
    int u, v;
    std::cin >> u >> v;
    G[u].emplace_back(v), G[v].emplace_back(u);
  }
  std::cout << ((bfs1() && bfs2()) ? "YES\n" : "NO\n");
}

int32_t main() {
#ifdef ORZXKR
  freopen("in.txt", "r", stdin);
  freopen("out.txt", "w", stdout);
#endif
  std::ios::sync_with_stdio(0), std::cin.tie(0), std::cout.tie(0);
  int T = 1;
  std::cin >> T;
  while (T--) dickdreamer();
  // std::cerr << 1.0 * clock() / CLOCKS_PER_SEC << "s\n";
  return 0;
}
```