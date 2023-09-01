---
title: CF797F Mice and Holes 题解
date: 2023-09-01 20:38:12
tags:
  - 题解
  - Codeforces
  - 贪心
  - 反悔贪心
categories:
  - 贪心
  - 反悔贪心
comments: true
---
## Description

有一天 Masha 回到家，发现有 $n$ 只老鼠在它公寓的走廊上，她大声呼叫，所以老鼠们都跑进了走廊的洞中。

这个走廊可以用一个数轴来表示，上面有 $n$ 只老鼠和 $m$ 个老鼠洞。第 $i$ 只老鼠有一个坐标 $x_i$ ，第 $j$ 个洞有一个坐标 $y_j$ 和容量 $c_j$ 。容量表示最多能容纳的老鼠数量。

找到让老鼠们全部都进洞的方式，使得所有老鼠运动距离总和最小。老鼠 $i$ 进入洞 $j$ 的运动距离 为 $|x_i − y_j|$。

无解输出 $-1$。

$n,m\leq 10^6$。
<!--more-->

## Solution

首先直接贪心就考虑每只老鼠选离它左边最近的或右边最近的钻，但是这样不是全局最优的。

考虑反悔贪心。

先把老鼠和洞放到一起按坐标从小到大排序，然后从前往后扫。设 $lstx_i$ 表示第 $i$ 只老鼠当前的最优答案，$lsty_i$ 表示第 $i$ 个洞当前的最优答案。然后用两个堆分别维护老鼠和洞的信息。

如果当前枚举到了第 $i$ 只老鼠，那么就要选一个洞匹配，设其为 $j$，那么匹配 $(i,j)$ 对答案的贡献就是 $(x_i-y_j)-lsty_j=x_i-(y_j+lsty_j)$，于是只要用洞堆维护最大的 $y_j+lsty_j$，然后把答案加上 $x_i-(y_j+lsty_j)$，同时 $lstx_i\leftarrow x_i-lsty_j$。由于当前老鼠还要反悔，所以把 $x_i+lstx_i$ 放到老鼠堆里面。

如果枚举到了第 $i$ 个洞是一样的，如果选了 $j$ 号老鼠，贡献就是 $y_i-(x_j+lstx_j)$，用老鼠堆维护最大的 $x_j+lstx_j$ 即可，然后把答案加上 $y_i-(x_j+lstx_j)$，同时 $lsty_i\leftarrow y_i-lstx_j$。

至于如何处理有一个坐标有很多个洞的问题，就每次只往堆里面放一个洞，如果这个匹配了就把匹配的放进去，然后如果还有洞就再选一个没匹配的洞放进去。

时间复杂度：$O((n+m)\log (n+m))$。

## Code

```cpp
#include <bits/stdc++.h>

#define int int64_t

const int kMaxN = 1e6 + 5, kInf = 1e16;

int n, m, mm;
int x[kMaxN];
std::pair<int, int> h[kMaxN], a[kMaxN];
std::priority_queue<int> qm;
std::priority_queue<std::pair<int, int>> qh;

void dickdreamer() {
  std::cin >> n >> m;
  for (int i = 1; i <= n; ++i) {
    std::cin >> x[i];
    a[++mm] = {x[i], 0};
  }
  int sumc = 0;
  for (int i = 1; i <= m; ++i) {
    std::cin >> h[i].first >> h[i].second;
    a[++mm] = {h[i].first, i};
    sumc += h[i].second;
  }
  if (sumc < n) {
    std::cout << "-1\n";
    return;
  }
  std::sort(a + 1, a + 1 + mm);
  int ans = 0;
  for (int i = 1; i <= mm; ++i) {
    if (!a[i].second) { // 老鼠
      int val = kInf;
      if (!qh.empty()) {
        auto [p, id] = qh.top();
        qh.pop();
        val = a[i].first - p;
        if (h[id].second) --h[id].second, qh.emplace(h[id].first, id);
      }
      ans += val;
      qm.emplace(a[i].first + val);
    } else { // 洞
      int val;
      while (!qm.empty() && h[a[i].second].second && (val = a[i].first - qm.top()) < 0) {
        --h[a[i].second].second;
        ans += val;
        qm.pop();
        qh.emplace(a[i].first + val, 0);
      }
      if (h[a[i].second].second) --h[a[i].second].second, qh.emplace(a[i].first, a[i].second);
    }
  }
  std::cout << ans << '\n';
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