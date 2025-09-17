from pathlib import Path
text = Path('src/pages/Auth.tsx').read_text(encoding='utf-8')
text = text.replace("interface AuthProps {\\n  mode?: 'default' | 'company';\\n}\\n\\nconst Auth = ({ mode = 'default' }: AuthProps) => {", "interface AuthProps {\n  mode?: 'default' | 'company';\n}\n\nconst Auth = ({ mode = 'default' }: AuthProps) => {")
text = text.replace("const navigate = useNavigate();\\n  const isCompanyMode = mode === 'company';\\n  const [companyIdFieldValue, setCompanyIdFieldValue] = useState('');", "const navigate = useNavigate();\n  const isCompanyMode = mode === 'company';\n  const [companyIdFieldValue, setCompanyIdFieldValue] = useState('');")
text = text.replace("const companyId = extractCompanyId(urlParams);\\n    setCompanyIdFieldValue(companyId ?? '');", "const companyId = extractCompanyId(urlParams);\n    setCompanyIdFieldValue(companyId ?? '');")
Path('src/pages/Auth.tsx').write_text(text, encoding='utf-8')
