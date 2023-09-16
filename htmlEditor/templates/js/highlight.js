

async function highlight (lang, line) {
    const txt = line.text();

    var spans = await lang.generateSpans(txt);
    try {
        var text = spans.map(s=>`<span class="hl ${s[1].map(tag=>'hl-'+tag).join(' ')}">${escapeHTML(s[0])}</span>`).join("");
        line.element.innerHTML = text;
    } catch (e) {}
}


eventDispatcher.listen("writer/change", async function (line) {
    if (line == undefined) return;
    var lang = await Language.fromLang("css");  // TODO: change to tab language
    await highlight(lang, line);
});