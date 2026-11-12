import sys, numpy as np
import plates as P
name=sys.argv[1]
f=getattr(P,name)
for yy in np.arange(20,630,14.):
    line=''
    for xx in np.arange(4,516,8.):
        v=float(np.ravel(f(np.array([xx]),np.array([yy])))[0])
        line+='#' if v>0.6 else ('+' if v>0.25 else ('.' if v>0.06 else ' '))
    print(line)
