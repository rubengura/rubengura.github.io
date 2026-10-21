#!/usr/bin/env python3
"""Checks the built site in _site/ before publishing.

Run it after `bundle exec jekyll build`:

    python3 scripts/check_site.py              # internal checks only
    python3 scripts/check_site.py --external   # also request every external link

What it checks, for every HTML page:
  - internal links, images, stylesheets and icons point to files that exist
  - links to #fragments point to an id that exists on the target page
  - the page has a lang attribute, a <title>, a meta description and one <h1>
  - every <img> has an alt attribute (empty alt is fine for decorative images)
  - external links use https
It also checks that every URL in sitemap.xml exists.

Standard library only. Exits with status 1 if any error is found.
"""

from __future__ import annotations

import argparse
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urldefrag, urljoin, urlsplit

SKIP_SCHEMES = ("mailto:", "tel:", "data:", "javascript:")


@dataclass
class Page:
    path: Path
    url: str
    lang: str | None = None
    title: str = ""
    description: str | None = None
    h1_count: int = 0
    ids: set[str] = field(default_factory=set)
    refs: list[tuple[str, str]] = field(default_factory=list)  # (tag/attr, url)
    images_without_alt: int = 0


class PageParser(HTMLParser):
    def __init__(self, page: Page) -> None:
        super().__init__(convert_charrefs=True)
        self.page = page
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a and a["id"]:
            self.page.ids.add(a["id"])
        if tag == "html":
            self.page.lang = a.get("lang")
        elif tag == "title":
            self._in_title = True
        elif tag == "meta" and a.get("name") == "description":
            self.page.description = a.get("content")
        elif tag == "h1":
            self.page.h1_count += 1
        elif tag == "img" and "alt" not in a:
            self.page.images_without_alt += 1

        for attr in ("href", "src"):
            value = a.get(attr)
            if value and tag in ("a", "link", "img", "script", "source", "iframe"):
                self.page.refs.append((f"{tag}[{attr}]", value.strip()))

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.page.title += data


def url_for(site: Path, file: Path) -> str:
    rel = file.relative_to(site).as_posix()
    if rel.endswith("index.html"):
        rel = rel[: -len("index.html")]
    return "/" + rel


def resolve(site: Path, path: str) -> Path | None:
    """Maps a URL path to a file in _site/, the way GitHub Pages serves it."""
    candidate = site / path.lstrip("/")
    options = [candidate / "index.html"] if path.endswith("/") else [
        candidate, candidate.with_name(candidate.name + ".html"), candidate / "index.html"
    ]
    return next((o for o in options if o.is_file()), None)


def check_external(url: str) -> str | None:
    headers = {"User-Agent": "rubengura-site-check/1.0"}
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, method=method, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status < 400:
                    return None
        except urllib.error.HTTPError as exc:
            if method == "GET" or exc.code not in (403, 405, 501):
                return f"HTTP {exc.code}"
        except Exception as exc:  # noqa: BLE001 - report any network failure
            return type(exc).__name__
    return "no successful response"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--site", default="_site", help="build output folder (default: _site)")
    ap.add_argument("--site-url", default="https://rubengura.github.io")
    ap.add_argument("--external", action="store_true", help="also request external links")
    args = ap.parse_args()

    site = Path(args.site).resolve()
    if not site.is_dir():
        print(f"error: {site} not found. Run `bundle exec jekyll build` first.")
        return 1

    pages: dict[str, Page] = {}
    for file in sorted(site.rglob("*.html")):
        page = Page(path=file, url=url_for(site, file))
        PageParser(page).feed(file.read_text(encoding="utf-8"))
        pages[page.url] = page

    errors: list[str] = []
    warnings: list[str] = []
    external: dict[str, set[str]] = {}

    for page in pages.values():
        where = page.url
        if not page.lang:
            errors.append(f"{where}: <html> has no lang attribute")
        if not page.title.strip():
            errors.append(f"{where}: missing <title>")
        if not page.description:
            errors.append(f"{where}: missing meta description")
        if page.h1_count != 1:
            errors.append(f"{where}: expected one <h1>, found {page.h1_count}")
        if page.images_without_alt:
            errors.append(f"{where}: {page.images_without_alt} <img> without alt")

        for kind, ref in page.refs:
            if ref.startswith(SKIP_SCHEMES):
                continue
            absolute = urljoin(args.site_url + page.url, ref)
            target, fragment = urldefrag(absolute)
            if not absolute.startswith(args.site_url):
                if absolute.startswith("http://"):
                    warnings.append(f"{where}: insecure link {ref}")
                external.setdefault(target, set()).add(where)
                continue
            path = urlsplit(target).path or "/"
            file = resolve(site, path)
            if file is None:
                errors.append(f"{where}: broken {kind} -> {ref}")
                continue
            if fragment and file.suffix == ".html":
                target_page = pages.get(url_for(site, file))
                if target_page and fragment not in target_page.ids:
                    errors.append(f"{where}: missing #{fragment} on {target_page.url} ({ref})")

    sitemap = site / "sitemap.xml"
    if sitemap.is_file():
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for loc in ET.parse(sitemap).getroot().iterfind("sm:url/sm:loc", ns):
            path = urlsplit(loc.text or "").path or "/"
            if resolve(site, path) is None:
                errors.append(f"sitemap.xml: {loc.text} does not exist")
    else:
        warnings.append("sitemap.xml not found")

    if args.external:
        for url in sorted(external):
            problem = check_external(url)
            if problem:
                errors.append(f"external {url}: {problem} (linked from {', '.join(sorted(external[url]))})")

    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"error: {e}")
    checked = "checked" if args.external else "not checked (use --external)"
    print(
        f"\n{len(pages)} pages, {len(external)} external links {checked}: "
        f"{len(errors)} errors, {len(warnings)} warnings."
    )
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
