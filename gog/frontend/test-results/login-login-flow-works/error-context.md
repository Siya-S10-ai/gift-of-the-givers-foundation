# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e8]: GOG
    - heading "Sign in to your account" [level=2] [ref=e9]
    - paragraph [ref=e10]:
      - text: Or
      - link "create a new account" [ref=e11] [cursor=pointer]:
        - /url: /register
  - generic [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]: Login failed. Please try again.
      - generic [ref=e16]:
        - generic [ref=e17]: Email address
        - textbox "Email address" [ref=e19]: test@local
      - generic [ref=e20]:
        - generic [ref=e21]: Password
        - textbox "Password" [ref=e23]: Password123!
      - generic [ref=e24]:
        - generic [ref=e25]:
          - checkbox "Remember me" [ref=e26]
          - generic [ref=e27]: Remember me
        - link "Forgot your password?" [ref=e29] [cursor=pointer]:
          - /url: "#"
      - button "Sign in" [ref=e31] [cursor=pointer]
    - generic [ref=e32]:
      - generic [ref=e37]: Or continue with
      - generic [ref=e38]:
        - button "Google" [ref=e39] [cursor=pointer]:
          - img [ref=e40]
          - generic [ref=e45]: Google
        - button "Facebook" [ref=e46] [cursor=pointer]:
          - img [ref=e47]
          - generic [ref=e49]: Facebook
```