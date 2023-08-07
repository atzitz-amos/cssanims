import os

from flask import Flask, Response, abort, render_template

path = r'./client/ressources'
allowed_files = []

for root, _, files in os.walk(path):
    for file in files:
        allowed_files.append(file)

print(allowed_files)

app = Flask(__name__)


@app.route("/res/<ctype>/<ressource>")
def res(ctype, ressource):
    if ressource not in allowed_files or ctype not in ["css", "image", "js"]:
        abort(403, description="You are not allowed to access this ressource.")
    with open(f"./client/ressources/{ctype}/{ressource}", "r", encoding="utf-8") as o:
        try:
            data = o.read()
        except UnicodeDecodeError:
            with open(f"./client/ressources/{ctype}/{ressource}", "rb") as ob:
                data = ob.read()

    content_type = "text/" + ctype
    if ctype == "js":
        content_type = "text/javascript"
    res = Response(data, 200)
    res.headers["Content-Type"] = "; ".join([content_type, "charset=utf-8"])
    return res


@app.route("/editor")
def editor():
    return render_template("editor.html")
