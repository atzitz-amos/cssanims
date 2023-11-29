class Solution:
    def solveEquation(self, equation: str) -> str:
        coeff = val = 0
        side = 1  # represent on which side of the = sign we are
        sgn = 1

        i = 0

        def getNumber():
            nonlocal i

            r = ""
            while i < len(equation) and equation[i] in "0123456789":
                r += equation[i]
                i += 1
            return int(r)

        while i < len(equation):
            c = equation[i]
            if c == "=":
                side = -side
            elif c == "x":
                coeff += side * sgn
            elif c == "+":
                sgn = 1
            elif c == "-":
                sgn = -1
            else:
                n = getNumber()
                if i == len(equation): break
                if equation[i] == "x":
                    # Number represent coefficient
                    coeff += n * side * sgn
                else:
                    # Number is a value
                    val += n * (-side) * sgn
                    i -= 1
            i += 1
        if coeff == 0:
            return "Infinite solutions" if val == 0 else "No solutions"
        print(val, coeff)
        return "x="+str(val // coeff)


print(Solution().solveEquation("x+x+x=x+1"))
