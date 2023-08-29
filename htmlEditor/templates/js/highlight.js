

function highlight (lang, txt) {
    lang.label(txt);
}


eventDispatcher.listen("writer/change", async function (line) {
    if (line == undefined) return;
    var lang = await Language.fromLang("css");  // TODO: change to tab language
    highlight(lang, line.text());
});