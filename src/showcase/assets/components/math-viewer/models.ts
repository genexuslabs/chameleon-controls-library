export const markdownReadmeModel = `\\begin{gather*}
    \\iint_V \mu(u,v) \,du\,dv
\\\\
    \\iiint_V \\mu(u,v,w) \\,du\\,dv\\,dw
\\end{gather*}

\\[
    \\oint_V f(s) \\,ds
\\]

Integral \\(\\int_{a}^{b} x^2 \\,dx\\) inside text

Hello \\[ \\prod_{i=a}^{b} f(i) \\] world

Hello \\( \\prod_{i=a}^{b} f(i) \\) world

Hello $$ \\prod_{i=a}^{b} f(i) $$ world

Hello $ \\prod_{i=a}^{b} f(i) $ world

\\textbf{Diffie-Hellman Key Exchange}

\\text{The Diffie-Hellman key exchange is a method used to securely exchange cryptographic keys over a public channel.}

\\textbf{Step-by-step Explanation}

\\text{1. Publicly agree on a prime number } p \\text{ and a primitive root } g.

\\text{2. Alice chooses a private key } a \\text{ and sends } A = g^a \\mod p \\text{ to Bob.}

\\text{3. Bob chooses a private key } b \\text{ and sends } B = g^b \\mod p \\text{ to Alice.}

\\text{4. Both compute the shared secret:}

\\text{Shared secret} = B^a \\mod p = A^b \\mod p

\\textbf{Mathematical Example}

\\begin{aligned}
p &= 23 \\\\
g &= 5 \\\\
a &= 6 \\quad (\\text{Alice's private key}) \\\\
b &= 15 \\quad (\\text{Bob's private key}) \\\\
A &= 5^6 \\mod 23 = 8 \\\\
B &= 5^{15} \\mod 23 = 2 \\\\
s &= B^a \\mod p = 2^6 \\mod 23 = 18 \\\\
  &= A^b \\mod p = 8^{15} \\mod 23 = 18
\\end{aligned}

\\text{Thus, both share the secret key } s = 18.
`;
