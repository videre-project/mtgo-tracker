import sys
import re

def getArgv(arg, default=0):
    def get_args(self):
        self = re.compile('--([\w\-]+) ').split(" ".join(self))
        for i in range(len(self)): self[i:i+1] = re.compile(' -').split(self[i])
        return self[1:]

    def assign_arg(self, arg):
        pos = self.index(arg)
        self.remove(arg)
        return self[pos]

    if len(sys.argv) > 1:
        self = get_args(sys.argv)
        if arg in self:
            match = assign_arg(self, arg)
            return str(match).strip()
    return default
