from pathlib import Path
text = Path('src/pages/Auth.tsx').read_text(encoding='utf-8')
old = "interface AuthProps \\\n  mode?: 'default' | 'company';\\n}\\n\\nconst Auth = ({ mode = 'default' }: AuthProps) => {"
new = "interface AuthProps {\n  mode?: 'default' | 'company';\n}\n\nconst Auth = ({ mode = 'default' }: AuthProps) => {"
if old not in text:
    raise SystemExit('old block not found')
text = text.replace(old, new, 1)
old2 = "const navigate = useNavigate();\\n  const isCompanyMode = mode === 'company';\\n  const [companyIdFieldValue, setCompanyIdFieldValue] = useState('');"
new2 = "const navigate = useNavigate();\n  const isCompanyMode = mode === 'company';\n  const [companyIdFieldValue, setCompanyIdFieldValue] = useState('');"
text = text.replace(old2, new2, 1)
Path('src/pages/Auth.tsx').write_text(text, encoding='utf-8')
