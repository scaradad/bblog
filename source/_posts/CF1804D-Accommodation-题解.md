---
title: CF1804D Accommodation 题解
date: 2023-06-27 10:17:00
tags:
- 题解
- Codeforces
- 贪心
categories:
- 题解
- 贪心
---

## Description

[link](https://www.luogu.com.cn/problem/CF1804D)

<!--more-->

## Solution

由于行与行之间独立，所以可以对每行分别求最大和最小值。

先考虑最小值。

先找出每段 $1$ 的长度，显然是尽量往里面放双人房，如果所需双人房个数 $>\dfrac{m}{4}$，那么就删掉一些双人房然后塞单人房即可。

然后是最大值。

设 $1$ 的个数为 $c$，那么答案就是 $c$ 减双人房中两个都是 $1$ 的房间个数。

考虑双人房中两个都是 $1$ 的最小房间个数怎么求，由于这个又等于 $\dfrac{m}{4}$ 减双人房中有至少一个为 $0$ 房间个数。

至少一个为 $0$ 的个数就从前往后扫，如果发现 $a_i+a_{i+1}<2$ 就用双人房，然后跳到 $i+2$ 继续搞。

这样做显然是对的，证明如下：

考虑把 $0$ 和他们两边的 $1$ 的区间最边上的 $1$ 合并成一个大区间 $[l_i,r_i]$，如果两个 $0$ 区间中间只隔了 $1$ 个 $1$ 那么把他们也合并了。

容易发现区间不会相交。上面那个操作就是在每个区间里找最多不相交的二连线段个数，显然从前往后扫是最优的。

至少一个为 $0$ 的个数如果大于 $\dfrac{m}{4}$ 就取到 $\dfrac{m}{4}$。

时间复杂度：$O(nm)$。

## Code

```cpp
#include <cstdio>
#include <iostream>

// #define int long long

const int kMaxN = 5e5 + 5;

int n, m;
int a[kMaxN], b[kMaxN];

int getmin(std::string s) {
  int cnt2 = m / 4, k = 0;
  for (int i = 1; i <= m; ++i)
    a[i] = s[i] - '0';
  int lst = 0;
  for (int i = 1; i <= m; ++i) {
    if (a[i]) ++lst;
    if (!a[i + 1] && lst) {
      b[++k] = lst, lst = 0;
    }
  }
  int sum = 0, tot = 0;
  for (int i = 1; i <= k; ++i) {
    sum += b[i] / 2;
    tot += b[i];
  }
  if (sum <= cnt2) return sum + tot - 2 * sum;
  else return cnt2 + tot - 2 * cnt2;
}

int getmax(std::string s) {
  int cnt2 = m / 4, k = 0, ret = 0;
  for (int i = 1; i <= m; ++i) {
    a[i] = s[i] - '0';
    ret += a[i];
  }
  for (int i = 1; i < m;) {
    if (!a[i] || !a[i + 1]) {
      ++k, i += 2;
    } else {
      ++i;
    }
  }
  return ret - (cnt2 - std::min(cnt2, k));
}

void dickdreamer() {
  int mi = 0, mx = 0;
  std::cin >> n >> m;
  for (int i = 1; i <= n; ++i) {
    std::string s;
    std::cin >> s;
    s = " " + s;
    mi += getmin(s), mx += getmax(s);
  }
  std::cout << mi << ' ' << mx << '\n';
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

