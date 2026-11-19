"""Generate a site article from one Markdown file in content/blog."""

import argparse
import json
from pathlib import Path
import subprocess
import sys
import tempfile


BLOG_DIR = Path(__file__).resolve().parents[1] / "content" / "blog"
TEMPLATE = Path(__file__).with_name("blog-post.html.template")


def pandoc(text, *args):
    result = subprocess.run(
        ["pandoc", *args], input=text, capture_output=True, encoding="utf-8"
    )
    if result.returncode:
        raise ValueError(result.stderr.strip() or "Pandoc conversion failed")
    return result.stdout


def render(source):
    document = json.loads(pandoc(source.read_text(encoding="utf-8-sig"),
                                 "--from=markdown", "--to=json"))
    blocks = document["blocks"]
    if blocks and blocks[0]["t"] == "Header" and blocks[0]["c"][0] == 1:
        heading = blocks.pop(0)
    else:
        heading = {"t": "Header", "c": [1, ["", [], []],
                                        [{"t": "Str", "c": source.stem}]]}

    # A second H1 starts a new part (e.g. the Chinese version of the post).
    # Nest that part below the page title, including its subheadings.
    in_subpart = False
    for block in blocks:
        if block["t"] == "Header":
            level = block["c"][0]
            if level == 1:
                in_subpart = True
            if in_subpart:
                block["c"][0] = min(level + 1, 6)

    document["meta"]["title"] = {"t": "MetaInlines", "c": heading["c"][2]}
    document["meta"]["post-heading"] = {"t": "MetaBlocks", "c": [heading]}
    return pandoc(json.dumps(document), "--from=json", "--to=html5",
                  "--standalone", "--wrap=none", f"--template={TEMPLATE}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("markdown", type=Path, help="path to the Markdown file, e.g. ./content/blog/post.md")
    parser.add_argument("--stdout", action="store_true", help="print HTML without writing a file")
    args = parser.parse_args()
    source = args.markdown.resolve()
    if source.parent != BLOG_DIR or source.suffix.lower() != ".md" or not source.is_file():
        parser.error("select an existing .md file directly inside content/blog")

    try:
        html = render(source)
        if args.stdout:
            sys.stdout.write(html)
            return
        output = source.with_suffix(".html")
        with tempfile.TemporaryDirectory(dir=source.parent) as staging:
            temporary = Path(staging) / output.name
            temporary.write_text(html, encoding="utf-8")
            temporary.replace(output)
        print(output)
    except FileNotFoundError as error:
        if error.filename == "pandoc":
            parser.exit(1, "Pandoc is required. Install pandoc and retry.\n")
        parser.exit(1, f"{error}\n")
    except (OSError, ValueError) as error:
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
