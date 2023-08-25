---
title: "[AGC060C] Large Heap 题解"
date: 2023-08-25 20:53:54
tags:
  - 题解
  - AtCoder
  - 数学
  - 概率论
  - DP
categories:
  - 题解
  - 数学
  - 概率论
comments: true
---
## Description

考虑 $(1,2,...,2^N-1)$ 的一个排列 $P=(P_1,P_2,...,P_{2^N-1})$。称 $P$ **像堆**当且仅当 $P_i \lt P_{2i}$ 和 $P_i \lt P_{2i+1}$ 对 $1 \le i \le 2^{N-1}-1$ 成立。

给定正整数 $A$ 和 $B$。令 $U=2^A$，$V=2^{B+1}-1$。在所有**像堆**的排列中任取一个，求 $P_U \lt P_V$ 的概率。模 $998244353$。
<!--more-->


## Solution

容易发现 $U$ 和 $V$ 分别是小根堆里面第 $A$ 行最左边的一个和第 $B$ 行最右边的一个，因此 $U$ 相当于从根一直往左跳的结果，$V$ 相当于从根一直往右跳的结果。

又因为求的是概率，所以我们就只需要关心从根往左和往右跳的路径上的数的大小关系。

考虑从小到大往两条路径上加数，然后 dp。

设 $f_{i,j,0/1}$ 表示当前左边加到了第 $i$ 行，右边加到了第 $j$ 行，且最后一次是加到了左边/右边的概率，初始值是 $f_{0,0,0}=1$。

由于左右边的概率不定，所以要求出往左边加和往右边的概率。

设 $i+1$ 为根的子树大小为 $x$，$j+1$ 为根的子树大小为 $y$。那么这 $x+y$ 个数的最小值是 $i+1$ 的概率就是 $\displaystyle\frac{\binom{x+y-1}{x-1}}{\binom{x+y}{x}}=\frac{x}{x+y}$，所以下一步加到左边的概率就是 $\displaystyle\frac{x}{x+y}$，加到右边的概率就是 $\displaystyle\frac{y}{x+y}$。

所以：

$$f_{i+1,j,0}\leftarrow\left(f_{i,j,0}+f_{i,j,1}\right)\cdot \frac{x}{x+y}\\ f_{i,j+1,1}\leftarrow\left(f_{i,j,0}+f_{i,j,1}\right)\cdot \frac{y}{x+y}$$

第 $i$ 行对应点的子树大小很好求，就是 $2^{n-i}-1$。

---

最后就是最终答案。

考虑枚举左边**第一次**到达 $A$ 时右边的位置，假设为 $k$，那么到达这个状态后，之后怎么加都会满足 $P_U<P_V$，所以贡献就是 $f_{A,i,0}$。

所以结果为：$\displaystyle\sum_{i=1}^{B-1}{f_{A,i,0}}$。

时间复杂度：$O(n^2\log \text{MOD})$。

（那个 $\log\text{MOD}$ 是在转移过程中求逆元的 $\log$）

## Code

```cpp
#include <bits/stdc++.h>

// #define int int64_t

using i64 = int64_t;

const int kMaxN = 5005, kMod = 998244353;

int n, A, B;
int f[kMaxN][kMaxN][2], s[kMaxN];

int qpow(int bs, int idx = kMod - 2) {
  int ret = 1;
  for (; idx; idx >>= 1, bs = (i64)bs * bs % kMod)
    if (idx & 1)
      ret = (i64)ret * bs % kMod;
  return ret;
}

void dickdreamer() {
  std::cin >> n >> A >> B;
  s[n - 1] = 1;
  for (int i = n - 2; ~i; --i)
    s[i] = (2ll * s[i + 1] + 1) % kMod;
  f[0][0][0] = 1;
  for (int i = 0; i <= A; ++i) {
    for (int j = 0; j <= B; ++j) {
      int p = (i64)s[i + 1] * qpow((s[i + 1] + s[j + 1]) % kMod) % kMod;
      f[i + 1][j][0] = (f[i + 1][j][0] + (i64)p * (f[i][j][0] + f[i][j][1]) % kMod) % kMod;
      f[i][j + 1][1] = (f[i][j + 1][1] + (i64)(kMod + 1 - p) % kMod * (f[i][j][0] + f[i][j][1]) % kMod) % kMod;
    }
  }
  int ans = 0;
  for (int i = 0; i < B; ++i)
    ans = (ans + f[A][i][0]) % kMod;
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
