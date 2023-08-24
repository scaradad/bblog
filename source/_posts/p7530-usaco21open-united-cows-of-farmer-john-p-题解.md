---
title: P7530 [USACO21OPEN] United Cows of Farmer John P 题解
date: 2023-08-24 18:53:32
updated: 2023-08-24 18:53:32
tags:
  - 题解
  - 数据结构
  - 线段树
categories:
  - 数据结构
  - 线段树
comments: true
---
## Description

给定一个长度为 $n$ 的数组 $a$，求其中数对 $(l,r,x)$ 的个数，满足 $1\leq l<x<r\leq n$ 且 $\[l,r]$ 中 $a_l,a_r,a_x$ 均只出现了一次。

$1\leq n\leq 2\times 10^5$。

[link](https://www.luogu.com.cn/problem/P7530)

## Solution

考虑枚举 $r$，用线段树维护每个 $l$ 所对应的答案。

设 $L_i$ 表示上一个 $a_i$ 出现的位置 $+1$，$R_i$ 表示下一个 $a_i$ 出现的位置 $-1$。

容易发现 $L_x\leq l\leq x-1$ 且 $r\leq R	_l$。

用线段树维护对于每个 $l$，满足条件的 $x$ 的个数，显然这个东西跟 $r$ 无关，只要满足 $L_x\leq l\leq x-1$ 即可，所以每次只要在 $\[L_x,x-1]$ 这个区间里加 $1$ 即可。

然而光求这个是不行的，因为还要满足 $L_r\leq l\leq r-2$ 和 $r\leq R_l$。前面那个很好求，只要求区间的和即可。

由于 $r$ 是从小到大枚举的，所以一个 $l$ 在当前不满足 $r\leq R_l$ 时，之后的每个 $r$ 都不会满足，所以可以把它删掉。于是用一个 vector 维护 $R_l=r$ 的所有 $l$ 即可，询问完删除。

然而线段树中是不支持删除操作的，所以可以维护一个带系数 $0/1$ 的线段树，初始时每个点的系数为 $1$，每次单点删除 $k$ 的操作就把 $k$ 对应的节点系数置为 $0$，然后删除 $k$ 作为 $x$ 对答案的贡献即可。

具体实现细节见代码。

时间复杂度：$O(n\log n)$。

## Code

```cpp
#include <algorithm>
#include <cstdio>
#include <iostream>
#include <vector>

// #define int int64_t

using i64 = int64_t;

const int kMaxN = 2e5 + 5;

int n;
int b[kMaxN], L[kMaxN], R[kMaxN], lst[kMaxN];
i64 sum[kMaxN << 2], val[kMaxN << 2], w[kMaxN << 2], tag[kMaxN << 2];
std::vector<int> v[kMaxN];

void pushup(int x) {
  sum[x] = sum[x << 1] + sum[x << 1 | 1];
  val[x] = val[x << 1] + val[x << 1 | 1];
  w[x] = w[x << 1] + w[x << 1 | 1];
}

void addtag(int x, int l, int r, int v) {
  tag[x] += v, val[x] += 1ll * w[x] * v, sum[x] += 1ll * (r - l + 1) * v;
}

void pushdown(int x, int l, int r) {
  if (!tag[x]) return;
  int mid = (l + r) >> 1;
  addtag(x << 1, l, mid, tag[x]), addtag(x << 1 | 1, mid + 1, r, tag[x]);
  tag[x] = 0;
}

void update1(int x, int l, int r, int ql, int qr, int v) {
  if (l > qr || r < ql) {
    return;
  } else if (l >= ql && r <= qr) {
    return addtag(x, l, r, v);
  }
  pushdown(x, l, r);
  int mid = (l + r) >> 1;
  update1(x << 1, l, mid, ql, qr, v), update1(x << 1 | 1, mid + 1, r, ql, qr, v);
  pushup(x);
}

void update2(int x, int l, int r, int ql, int v) {
  if (l == r) {
    w[x] = v, val[x] = sum[x] * v;
    return;
  }
  pushdown(x, l, r);
  int mid = (l + r) >> 1;
  if (ql <= mid) update2(x << 1, l, mid, ql, v);
  else update2(x << 1 | 1, mid + 1, r, ql, v);
  pushup(x);
}

int query(int x, int l, int r, int ql, int qr) {
  if (l > qr || r < ql) {
    return 0;
  } else if (l >= ql && r <= qr) {
    return val[x];
  }
  pushdown(x, l, r);
  int mid = (l + r) >> 1;
  return query(x << 1, l, mid, ql, qr) + query(x << 1 | 1, mid + 1, r, ql, qr);
}

void dickdreamer() {
  std::cin >> n;
  for (int i = 1; i <= n; ++i) {
    std::cin >> b[i];
    L[i] = lst[b[i]] + 1;
    lst[b[i]] = i;
  }
  std::fill_n(lst + 1, n, n + 1);
  for (int i = n; i; --i) {
    R[i] = lst[b[i]] - 1;
    lst[b[i]] = i;
    v[R[i]].emplace_back(i);
  }
  for (int i = 1; i <= n; ++i)
    update2(1, 1, n, i, 1);
  i64 ans = 0;
  for (int i = 1; i <= n; ++i) {
    ans += query(1, 1, n, L[i], i - 2);
    update1(1, 1, n, L[i], i - 1, 1);
    for (auto x : v[i]) {
      update1(1, 1, n, L[x], x - 1, -1);
      update2(1, 1, n, x, 0);
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