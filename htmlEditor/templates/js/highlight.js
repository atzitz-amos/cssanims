

async function highlight (line) {
    const txt = line.text();
    const lang = await Language.current();

    var spans = await lang.generateSpans(txt);
    try {
        var text = spans.map(s=>`<span class="hl ${s[1].map(tag=>'hl-'+tag).join(' ')}">${escapeHTML(s[0])}</span>`).join("");
        line.element.innerHTML = text;
    } catch (e) {}
}


eventDispatcher.listen("writer/change", function (line) {
    if (line == undefined) return;
    eventDispatcher.dispatch("highlight/start", line);
    highlight(line);
    eventDispatcher.dispatch("highlight/done", line);
});