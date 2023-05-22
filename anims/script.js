
customElements.define("extendable-box",
  class extends HTMLElement {
    constructor(){
      super();
      this.attachShadow({mode: "open"});
      var link = document.createElement("link"); link.setAttribute("href", "style.css"); link.setAttribute("rel", "stylesheet");
      this.shadowRoot.append(link);
    }
    connectedCallback(){
      this.setAttribute("theme", "black");

      var card = document.createElement("div");
      card.className = "extendable-box-card";
      card.setAttribute("design", "flat");
      this.shadowRoot.append(card);
      card.removeAttribute("theme");

      var content_div = document.createElement("div");
      content_div.className = "extendable-box-content";
      content_div.innerHTML = this.innerHTML;

      var svg_icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg_icon.setAttribute("class", "extendable-box-svg");
      switch(this.getAttribute("icon")){
        case "triangle":
          var content = '<polygon points="0,0 15,0 7.5,12"/>'
          break;
        default:
          var content = '<polygon points="0,0 15,0 7.5,12"/>'
      }
      svg_icon.innerHTML = content;
      svg_icon.addEventListener("click", (e)=>{
        if(this.hasAttribute("open")){
          this.removeAttribute("open");
        }
        else{
          this.setAttribute("open", "");
        }
      });
      card.appendChild(svg_icon);
      card.appendChild(content_div);
    }
});

class Trigger {
    constructor(name) {
        this.trigger = name;
    }
}

class AnimCall {
    constructor(node) {
        this.node = node;
        this.anim = node.getAttribute("name");
        switch(this.anim) {
            case "anim-1":
                break;
            case "anim-2":
                break;
        }
    }
}

function load_trigger(node) {
    return new Trigger(node.getAttribute("name"));
}

function load_call(node) {
    return new AnimCall(node)
}

function create_collapsable_div(content) {
    return document.createElement("extendable-box");
}

class AnimationProcessor {
    animations = [];
    loaded = false;

    play_animation(anim_id) {
        console.log(anim_id);
    }

    pause_animation(anim_id) {
        console.log("stop", anim_id);
    }

    _create_debug_callbacks(){
        document.querySelectorAll(".debug_action_play").forEach(btn => {
            btn.addEventListener("click", (e)=>{
                btn.parentElement.parentElement.parentElement.removeAttribute("stopped");
                this.play_animation(btn.dataset.animId);
            })
        })
        document.querySelectorAll(".debug_action_pause").forEach(btn => {
            btn.addEventListener("click", (e)=>{
                btn.parentElement.parentElement.parentElement.setAttribute("stopped", "");
                this.pause_animation(btn.dataset.animId);
            })
        })
    }

    enable_debug() {
        while (!this.loaded){}
        var debug = document.createElement("div");
        var debug_content = document.createElement("div");
        debug.id = "debug";
        debug_content.id = "debug-content";

        var animations_container = document.createElement("table");
        animations_container.id = "debug-animations";
        var thead = document.createElement("thead");
        thead.innerHTML = "<tr><th id='debug_table_col_id'>ID</th><th id='debug_table_col_trigger'>Trigger</th><th id='debug_table_col_calls'>Effects</th><th id='debug_table_col_actions'>Actions</th></tr>"
        var tbody = document.createElement("tbody");

        this.animations.forEach(anim => {
            var row = document.createElement("tr");
            row.setAttribute("stopped", "");
            row.id = anim.id;
            row.innerHTML = "<td>" + anim.id + "</td><td>" + anim.trigger.trigger + "</td>";

            var effects_td = document.createElement("td");
            effects_td.className = "debug_table_effects";
            var effects_container = create_collapsable_div();
            var effects_sub = "<br>";
            anim.calls.forEach(effect => {
                effects_sub += "<li>" + effect.anim + "</li>";
            })
            effects_container.innerHTML = "Effects" + "<ol class='debug_table_effects_sub'>" + effects_sub + "</ol>";

            var actions_td = document.createElement("td");
            var actions_container = document.createElement("div");
            actions_td.className = "debug_table_actions";
            actions_container.className = "debug_table_actions_container";
            actions_container.innerHTML = `
                <button class="debug_action_play" data-anim-id="${anim.id}"><svg class='debug_action_play_svg'><polygon fill='green' points="0,0 15,0 7.5,12"/></svg></button>
                <button class="debug_action_pause" data-anim-id="${anim.id}"><svg class='debug_action_pause_svg'><path fill='red' d="M 0.5 0.5 a 0.5 0.5 0 0 1 0.5 0.5 v 8 a 0.5 0.5 0 0 1 -1 0 V 1 a 0.5 0.5 0 0 1 0.5 -0.5 z m 4 0 a 0.5 0.5 0 0 1 0.5 0.5 v 8 a 0.5 0.5 0 0 1 -1 0 V 1 a 0.5 0.5 0 0 1 0.5 -0.5 z"/></svg></button>`

            effects_td.appendChild(effects_container);
            row.appendChild(effects_td);
            actions_td.appendChild(actions_container);
            row.appendChild(actions_td);
            tbody.appendChild(row);
        })

        animations_container.appendChild(thead);
        animations_container.appendChild(tbody);
        debug_content.appendChild(animations_container);
        debug.appendChild(debug_content);
        document.body.appendChild(debug);

        this._create_debug_callbacks();
    }
    load() {
        document.querySelectorAll("anim").forEach(anim => {
            var type = anim.getAttribute("type");
            var trigger = null;
            var calls = [];
            anim.childNodes.forEach(node => {
                switch (node.nodeName) {
                    case "TRIGGER":
                        trigger = load_trigger(node);
                        break;
                    case "CALL":
                        calls.push(load_call(node));
                        break;
                }
            });
            this.animations.push(new AnimationImage(anim.id, type, trigger, calls));
        })
        this.loaded = true;
    }
}


class AnimationImage {
    constructor(id, type, trigger, calls) {
        this.id = id;
        this.type = type;
        this.trigger = trigger;
        this.calls = calls;

    }
    execute(){
        this.calls.forEach(call => {

        });
    }
}

anim_processor = null;

function initialize() {
    console.log("initialize");
    anim_processor = new AnimationProcessor();
    anim_processor.load();
}

window.onload = initialize;


function enable_debug() {
    setTimeout(() => {window.anim_processor.enable_debug()}, 200);
}