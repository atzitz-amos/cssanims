import math
import re


def baseConverter(n, b):
    if n == 0:
        return [0]
    digits = []
    while n:
        digits.append(int(n % b))
        n //= b
    return digits[::-1]


class BigInt:
    __ZERO = None
    __ONE = None  # cache value for zeros and ones to improve performance
    MAX_DIGITS = 8

    def __init__(self, base, digits=None, powers=None):
        self.base = int(base)
        self.digits = [] if digits is None else digits
        self.powers = list(range(len(digits) - 1, -1, -1)) if powers is None else powers

        self.__repr = self.__str = None

    @classmethod
    def zero(cls):
        if not cls.__ZERO:
            cls.__ZERO = BigInt(1, digits=[0])
        return cls.__ZERO

    @classmethod
    def one(cls):
        if not cls.__ONE:
            cls.__ONE = BigInt(1, digits=[1])
        return cls.__ONE

    @staticmethod
    def of(n: int):
        if n == 0:
            return BigInt.zero()
        if n == 1:
            return BigInt.one()
        dig = int(math.log10(n)) + 1
        base = 10
        while dig > BigInt.MAX_DIGITS:
            base *= 10
            dig = int(math.log(n, base)) + 1
        if base == 10:
            return BigInt.fromDigits(1, [int(i) for i in str(n)])
        return BigInt.fromDigits(base, baseConverter(n, base), mapping=BigInt.of)

    @staticmethod
    def fromDigits(base, digits, mapping=lambda _: _):
        return BigInt(
            math.log10(base),
            [mapping(d) for d in digits if d != 0],
            [len(digits) - i - 1 for i in range(len(digits)) if digits[i] != 0]
        )

    @staticmethod
    def power10(p):
        base = math.floor(p / BigInt.MAX_DIGITS) + 1
        res = p % base
        return BigInt(base, [BigInt.power10(res) if res > 200 else BigInt.of(10 ** res)], [math.floor(p / base)])

    def __str__(self):
        if self.__str:
            return self.__str

        def stretch(x, width):
            return "0" * (width - len(x)) + x

        res = ""
        for i in range(max(self.powers), -1, -1):
            if i in self.powers:
                dig = str(self.digits[self.powers.index(i)])
            else:
                dig = "0"
            if i == max(self.powers):
                res += dig
            else:
                res += stretch(dig, self.base)

        return res

    def __repr__(self):
        length = len(self.digits)
        return self.__str__()

    def scirepr(self):
        """
            Return the scientific notation representation of the integer
            ! Warning might cause problems when having too many digits !
        """
        string = str(self)
        match = re.search("0+$", string)
        if match:
            start, end = match.span()
            return int(string[:start]), end - start
        return 1, int(string)

    def __mul__(self, other):
        if type(other) is int:
            other = BigInt.of(other)
        if other.base > self.base:
            return other.__mul__(self)
        digits = []
        for dig in self.digits:
            pass

    __rmul__ = __mul__

    def __gt__(self, other):
        return self.base ** max(self.powers) > other.base ** max(other.powers)

    def __ge__(self, other):
        return self.base ** max(self.powers) >= other.base ** max(other.powers)

    def __lt__(self, other):
        return self.base ** max(self.powers) < other.base ** max(other.powers)

    def __le__(self, other):
        return self.base ** max(self.powers) <= other.base ** max(other.powers)

    def __eq__(self, other):
        return sum(map(lambda x: self.base ** x[1] * x[0], zip(self.digits, self.powers))) == sum(
            map(lambda x: other.base ** x[1] * x[0], zip(other.digits, other.powers)))
