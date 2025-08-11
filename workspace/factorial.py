#!/usr/bin/env python3
"""
Factorial calculator

Usage:
  python factorial.py 5
  # prints: 120

Notes:
- Accepts a single non-negative integer n and prints n!.
- Uses an iterative implementation (no recursion) and supports arbitrarily large n (limited by memory/time).
"""

import argparse
from typing import Any


def factorial(n: int) -> int:
    """Return n! for a non-negative integer n.

    Raises ValueError if n < 0.
    """
    if n < 0:
        raise ValueError("n must be a non-negative integer")
    result = 1
    # Iterative multiply to avoid recursion depth issues
    for k in range(2, n + 1):
        result *= k
    return result


def main(argv: list[str] | None = None) -> Any:
    parser = argparse.ArgumentParser(description="Compute n! for a non-negative integer n")
    parser.add_argument("n", type=int, help="non-negative integer")
    args = parser.parse_args(argv)

    if args.n < 0:
        parser.error("n must be non-negative")

    print(factorial(args.n))


if __name__ == "__main__":
    main()
