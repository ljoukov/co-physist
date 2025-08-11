#!/usr/bin/env python3
"""
factorial.py — compute the factorial of a non-negative integer.

Usage:
  python factorial.py 5          # prints 120
  python factorial.py            # prompts for an integer, then prints result

Notes:
- Uses Python's built-in big integers; very large results are supported (memory permitting).
- Exits with code 1 on invalid input.
"""

from __future__ import annotations
import argparse
import math
import sys


def parse_nonnegative_int(s: str) -> int:
    try:
        n = int(s, 10)
    except ValueError:
        raise argparse.ArgumentTypeError(f"Invalid integer: {s!r}")
    if n < 0:
        raise argparse.ArgumentTypeError("Input must be a non-negative integer")
    return n


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Compute factorial of a non-negative integer")
    parser.add_argument(
        "n",
        nargs="?",
        type=parse_nonnegative_int,
        help="non-negative integer (if omitted, will be prompted)",
    )
    args = parser.parse_args(argv)

    if args.n is None:
        try:
            user_in = input("Enter a non-negative integer: ").strip()
        except EOFError:
            print("No input provided", file=sys.stderr)
            return 1
        try:
            n = parse_nonnegative_int(user_in)
        except argparse.ArgumentTypeError as e:
            print(str(e), file=sys.stderr)
            return 1
    else:
        n = args.n

    try:
        result = math.factorial(n)
    except (OverflowError, ValueError) as e:
        print(f"Error computing factorial: {e}", file=sys.stderr)
        return 1

    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
