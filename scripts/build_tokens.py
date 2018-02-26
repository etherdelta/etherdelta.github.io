import json
from os import listdir, path
import sys
import yaml

TOKEN_KEYS_MAPPING = { "addr": "addr", "symbol": "name", "decimals": "decimals" }
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

def inject_tokens(config_filename, tokens):
    with open(config_filename) as f:
        config = f.readlines()

    config_iterator = iter(config)
    prefix = []
    for line in config_iterator:
        if line == '  "tokens": [\n':
            prefix.append(line)
            break
        prefix.append(line)

    suffix = []
    suffix_started = False
    for line in config_iterator:
        if line == '  ],\n':
            suffix_started = True
        if suffix_started:
            suffix.append(line)

    json_tokens = [ # Keep the silly format, you filthy animals
        json.dumps(token_entry).replace('{', '{ ').replace('}', ' }')
        for token_entry in tokens
    ]
    formatted_tokens = ["    {},\n".format(json_token) for json_token in json_tokens]
    formatted_tokens[-1] = formatted_tokens[-1].rstrip("\n,") + "\n"

    return prefix + formatted_tokens + suffix

CONFIG_FILE = "config/main.json"
ETH_TOKEN = { "addr": "0x0000000000000000000000000000000000000000", "name": "ETH", "decimals": 18 }
def main(tokenbase_path):
    tokens_dir = path.join(tokenbase_path, "tokens")
    token_file_filter = lambda fname: fname.startswith("0x") and fname.endswith(".yaml")

    symbols = set("ETH")
    tokens = [ETH_TOKEN, ]
    for defn_fname in sorted(map(lambda s: s.lower(), filter(token_file_filter, listdir(tokens_dir)))):
        with open(path.join(tokens_dir, defn_fname), encoding="utf8") as f:
            print(defn_fname)
            defn = yaml.safe_load(f)

        listing_entry = make_listing_entry(defn)
        if listing_entry["name"] in symbols:
            find_symbol = lambda t: t["name"] == listing_entry["name"]
            previous_assignment = next(filter(find_symbol, tokens), None)
            print("ERROR: Duplicate token symbol", listing_entry["name"],
                    "({})".format(listing_entry["addr"]),
                    "previously assigned to", previous_assignment["addr"])
            exit(2)

        symbols.add(listing_entry["name"])
        tokens.append(listing_entry)

        guide = make_description_html(defn)
        if guide:
            with open("tokenGuides/{}.ejs".format(listing_entry["name"]), "w", encoding="utf8") as f:
                f.write(guide)

    new_config = inject_tokens("config/main.json", tokens)
    with open(CONFIG_FILE, "w") as f:
        f.writelines(new_config)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: build_tokens.py <tokenbase working copy path>")
        exit()
    main(sys.argv[1])
