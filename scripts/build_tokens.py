import json
from os import listdir, path
import sys
import yaml

TOKEN_KEYS_MAPPING = { "addr": "addr", "decimals": "decimals", "symbol": "name" }
def make_listing_entry(defn):
    token = { dst_key: defn[src_key] for (src_key, dst_key) in TOKEN_KEYS_MAPPING.items() }
    if "__FORKDELTA_CUSTOM_SYMBOL" in defn:
        token["name"] = defn["__FORKDELTA_CUSTOM_SYMBOL"]
    return token

GUIDE_HTML_TEMPLATE = """<blockquote>
  <p>{description_html}</p>
  <footer>{website_href}</footer>
</blockquote>\n"""
DESCRIPTION_HTML_JOINER = "</p>\n  <p>" # With spaces to keep indentation consistent
WEBSITE_HREF_TEMPLATE = '<a href="{url}" target="_blank">{url}</a>'
def make_description_html(defn):
    description = defn.get("description", "")
    description_html = "</p>\n  <p>".join(description.split("\n"))

    website = dict([(key,d[key]) for d in defn["links"] for key in d]).get("Website", "")
    if website:
        website_href = WEBSITE_HREF_TEMPLATE.format(url=website)
    else:
        website_href = ""

    if not description_html and not website_href:
        return "" # No guide to write

    return GUIDE_HTML_TEMPLATE.format(description_html=description_html, website_href=website_href)

def main(tokenbase_path):
    tokens_dir = path.join(tokenbase_path, "tokens")
    token_file_filter = lambda fname: fname.startswith("0x") and fname.endswith(".yaml")

    tokens = []
    for defn_fname in filter(token_file_filter, listdir(tokens_dir)):
        with open(path.join(tokens_dir, defn_fname)) as f:
            defn = yaml.safe_load(f)

        listing_entry = make_listing_entry(defn)
        guide = make_description_html(defn)

        print(json.dumps(listing_entry))
        if guide:
            with open("tokenGuides/{}.ejs".format(listing_entry["name"]), "w") as f:
                f.write(guide)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: build_tokens.py <tokenbase working copy path>")
        exit()
    main(sys.argv[1])
