---
title: P7987 [USACO21DEC] Paired Up G 题解
date: 2023-08-22 20:29:34
tags:
- 题解
- USACO
- DP
categories:
- 题解
- DP
---

## Description

数轴上总计有 $N$（$1\le N\le 10^5$）头奶牛。第 $i$ 头奶牛的位置为 $x_i$（$0 \leq x_i \leq 10^9$），而第 $i$ 头奶牛的重量为 $y_i$（$1 \leq y_i \leq 10^4$）。

根据 Farmer John 的信号，某些奶牛会组成对，使得

- 每一对包含位置相差不超过 $K$ 的两头不同的奶牛 $a$ 和 $b$（$1\le K\le 10^9$）；也就是说，$|x_a-x_b|\le K$。

- 每一头奶牛要么包含在恰好一对中，要么不属于任何一对。

- **配对是极大的**；也就是说，没有两头未配对的奶牛可以组成对。

你需要求出未配对的奶牛的重量之和的可能的范围。具体地说，

- 如果 $T=1$，计算未配对的奶牛的最小重量和。
- 如果 $T=2$，计算未配对的奶牛的最大重量和。

[link](https://www.luogu.com.cn/problem/P7987)

<!--more-->

## Solution

先把位置排个序，如果是问最大值那么就每个数乘 $-1$，最后取反即可。

注意到如果把所有没有配对的奶牛删掉，剩下的奶牛一定满足相邻的位置差 $\leq k$。

考虑 DP。

设 $f_{i,0/1}$ 表示已经处理了 $1\sim i$ 这些奶牛，删掉了 偶数/奇数 头奶牛，删掉的奶牛的总和最小值，$l$ 表示位置 $< x_i-k$ 的位置最大的奶牛，$j=i\bmod 2$。

然后就是分类讨论：

1. $1\sim i-1$ **剩下**偶数个

   - $i$ 删掉

     那么 $1\sim i$ 仍然剩下偶数个，并且上一个删掉的一定在 $l$ 之前，所以 $f_{i,j}\leftarrow f_{l,1-j}+y_i$。

   - $i$ 不删

     那么 $1\sim i$ 剩下奇数个，并且要满足 $x_{i+1}-x_{i}\leq k$，因为这时候 $i$ 是剩下的编号为奇数的奶牛，要和 $i+1$ 之后的奶牛进行配对，一定要满足这个条件。所以 $f_{i,1-j}\leftarrow f_{i-1,1-j}$。

2. $1\sim i-1$ **剩下**奇数个

   - $i$ 删掉

     上一个删掉的一定在 $l$ 之前，并且这时 $i-1$ 要和 $i+1$ 之后的奶牛进行配对，所以要满足 $x_{i+1}-x_{i-1}\leq k$。那么 $f_{i,1-j}\leftarrow f_{l,j}+y_i$。

   - $i$ 不删

     那么 $1\sim i$ 剩下偶数个，并且 $i$ 和 $i-1$ 及之前的要配对，所以满足 $x_{i}-x_{i-1}\leq k$ 才可以转移，则 $f_{i,j}\leftarrow f_{i-1,j}$。

时间复杂度：$O(n)$。

---

其实仔细思考会发现上面状态转移的条件只是**必要**的，不够**充分**，下面证明下各个转移的条件放到一起为啥就对了。

先假设 $1\sim i-1$ 的条件都是正确的，那么 2,2 里面如果不满足 $x_i-x_{i-1}\leq k$，显然 $i$ 前面那个没被删的就找不到和他配对的了。满足了 $x_{i}-x_{i-1}\leq k$，状态就相当于转化为“$1\sim i-1$，**剩下**了奇数个奶牛”，也就是状态 1.2 和 2.1，1.2 的条件满足了 $i-1$ 不删的情况。2.1 由于 $x_l<x_{i-1}-k$，所以 $l+1\sim i-2$ 都没删，所以 $1\sim i-1$ 那个编号最大的没删的一定是 $i-2$，所以 $i-2$ 要与 $i$ 配对，条件就派上了用场。

然后是 1.2，如果不满足 $x_{i+1}-x_i\leq k$，$i$ 就找不到他后面的奶牛了，显然不行。满足了 $x_{i+1}-x_i\leq k$，相当于钦定 $i$ 能找到后面的，那么 $f_{i-1,1-j}$ 就可以直接转移了。

最后是 2.1，由 2.2 的分析可知 $1\sim i$ 里面最后的一个没删的奶牛一定是 $i-1$，钦定他能找到后面的，就可以直接转移。

综上所述，1.2 和 2.1 相当于钦定后面满足的条件，然后 2.2 的条件刚好符合 1.2 和 2.1 所钦定的条件，即可转移得万无一失。

## Code

```cpp
#include <bits/stdc++.h>

#define int int64_t

const int kMaxN = 1e5 + 5;

int t, n, k, op = 1;
int f[kMaxN][2];
std::pair<int, int> a[kMaxN];

void dickdreamer() {
  std::cin >> t >> n >> k;
  if (t == 2) op = -1;
  for (int i = 1; i <= n; ++i) {
    std::cin >> a[i].first >> a[i].second;
    a[i].second *= op;
  }
  std::sort(a + 1, a + 1 + n);
  memset(f, 0x3f, sizeof(f));
  f[0][0] = 0;
  a[0].first = -1e12, a[n + 1].first = 1e12;
  int lst = 0;
  for (int i = 1; i <= n; ++i) {
    for (; a[lst + 1].first < a[i].first - k; ++lst) {}
    int j = (i & 1);
    f[i][j] = std::min(f[i][j], f[lst][j ^ 1] + a[i].second);
    if (a[i + 1].first - a[i].first <= k) f[i][j ^ 1] = std::min(f[i][j ^ 1], f[i - 1][j ^ 1]);
    if (a[i + 1].first - a[i - 1].first <= k) f[i][j ^ 1] = std::min(f[i][j ^ 1], f[lst][j] + a[i].second);
    if (a[i].first - a[i - 1].first <= k) f[i][j] = std::min(f[i][j], f[i - 1][j]);
  }
  std::cout << f[n][n & 1] * op << '\n';
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

