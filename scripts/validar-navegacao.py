"""Valida destinos locais, âncoras e scripts das páginas do site sem iniciar a API."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / "FRONTEND"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.refs, self.ids, self.scripts, self.placeholders = path, [], set(), [], []
        self.feed(path.read_text(encoding="utf-8-sig"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"])
        for attr in ("href", "src", "action"):
            value = attrs.get(attr, "")
            if value:
                self.refs.append((attr, value))


pages = {p.resolve(): Page(p.resolve()) for p in ROOT.rglob("*.html")}
errors = []
refs = 0
for path, page in pages.items():
    label = path.relative_to(ROOT)
    for script, count in Counter(page.scripts).items():
        if count > 1:
            errors.append(f"{label}: script duplicado: {script}")
    for attr, value in page.refs:
        url = urlsplit(value)
        if url.scheme or url.netloc:
            continue
        # Logout é tratado pelo script compartilhado.
        if value == "#":
            continue
        refs += 1
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        if not target.exists():
            errors.append(f"{label}: {attr} inexistente: {value}")
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f"{label}: âncora inexistente: {value}")
if errors:
    raise SystemExit("\n".join(errors))
print(f"OK: {len(pages)} páginas, {refs} referências locais, sem destinos quebrados ou scripts duplicados.")
