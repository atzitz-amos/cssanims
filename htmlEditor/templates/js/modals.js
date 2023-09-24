

class ModalColorPreview {
    id = ".modal-color-preview";

    content = `<div class="modal-color-preview-center"><div class="modal-color-preview-color-box"><div class="modal-color-preview-color" style="background:$0"></div></div></div>`;

    constructor (x, y, color) {
        this.element = document.querySelector(this.id);
        this.x = x;
        this.y = y;
        this.color = color;
    }

    render() {
        this.element.style.zIndex = 100;
        this.element.style.display = "flex";

        var x = this.x - this.element.clientWidth / 2;
        var y = this.y - this.element.clientHeight;
        if (y < 0) {
            y += 20 + this.element.clientHeight;
            this.element.setAttribute("upsidedown", "");
        } else {
            this.element.removeAttribute("upsidedown");
        }

        this.element.style.left = x + "px";
        this.element.style.top = y + "px";

        this.element.innerHTML = this.content.replaceAll("$0", this.color);
        return this;
    }

    destroy() {
        document.querySelector(".editor-modals").style.zIndex = "";
        this.element.innerHTML = "";
        this.element.style.display = "none";
    }
}

class ModalColorPicker {
    id = ".modal-color-picker"

    content = `
        <div class="modal-color-picker-top">
            <div class="modal-color-picker-gradient">
                <div class="bg1"></div>
                <div class="bg2"></div>
                <div class="modal-color-picker-selection" style="left: 10px; top: 10px;"></div>
            </div>
        </div>
        <div class="modal-color-picker-middle">
            <div class="modal-color-picker-preview-box">
                <svg>
                    <rect width="100%" height="100%" rx="50%" ry="50%" fill="url(#alpha)"></rect>
                </svg>
                <div class="modal-color-picker-preview">
                </div>
            </div>
            <div class="modal-color-picker-scales">
                <div class="modal-color-picker-rgb-scale"><div class="modal-color-picker-scale-selector"></div></div>
                <div class="modal-color-picker-alpha-scale">
                    <svg class="modal-color-picker-alpha-svg">
                        <pattern id="alpha" width="12" height="12" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="6" height="6" fill="#cccccc" stroke="#cccccc"></rect>
                            <rect x="6" y="0" width="6" height="6" fill="#fefefe" stroke="#fefefe"></rect>
                            <rect x="0" y="6" width="6" height="6" fill="#fefefe" stroke="#fefefe"></rect>
                            <rect x="6" y="6" width="6" height="6" fill="#cccccc" stroke="#cccccc"></rect>
                        </pattern>
                        <rect class="modal-color-picker-alpha-scale-inner" fill="url(#alpha)"></rect>
                    </svg>
                    <div class="modal-color-picker-alpha-scale-bg"></div>
                    <div class="modal-color-picker-scale-selector"></div>
                </div>
            </div>
        </div>
        <div class="modal-color-picker-bottom">
            <div class="modal-color-picker-value modal-color-picker-hex-value">
                <input type="text" class="modal-color-picker-value-input">
            </div>
        </div>
        `

    constructor (x, y, initialColor=undefined) {
        this.element = document.querySelector(this.id);
        this.x = x;
        this.y = y;
        this.initialColor = initialColor || "black";

        this.dragging = {alpha: false, rgb: false, gradient: false}
        this.alpha = 1.0;
        this.colors = {r: 0, g: 0, b: 0}
    }

    render() {
        this.element.style.display = "flex";
        this.element.style.setProperty("--current-color", this.initialColor)
        this.element.style.zIndex = 100;
        document.activeElement.blur()
        var x = this.x;
        var y = this.y;

        this.element.style.left = x + "px";
        this.element.style.top = y + "px";

        this.element.innerHTML = this.content;

        document.querySelector(".modal-color-picker-rgb-scale")
            .addEventListener("mousedown",
                e=>e.srcElement.className == "modal-color-picker-scale-selector"
                    ? this.handleScaleSelectorClick("rgb")
                    : this.handleScaleClick(e.layerX, "rgb")
            );
        document.querySelector(".modal-color-picker-alpha-scale")
            .addEventListener("mousedown",
                e=>e.srcElement.className == "modal-color-picker-scale-selector"
                    ? this.handleScaleSelectorClick("alpha")
                    : this.handleScaleClick(e.layerX, "alpha")
            );
        document.body.addEventListener("mouseup", e=>this.handleScaleSelectorUp());
        document.body.addEventListener("mousemove", e=>this.handleMouseMove(e))

        document.querySelector(".modal-color-picker-gradient")
            .addEventListener("mousedown",
                e=>e.srcElement.className=="modal-color-picker-selection"
                    ? this.handleGradientSelectorClick()
                    : this.handleGradientClick(e.layerX, e.layerY)
            );

        return this;
    }

    handleScaleClick(x, scale) {
        var selector = document.querySelector(`.modal-color-picker-${scale}-scale .modal-color-picker-scale-selector`);
        x -= selector.clientWidth / 2;

        var w = document.querySelector(`.modal-color-picker-${scale}-scale`).clientWidth
        var p = x / w + selector.clientWidth / (2 * w);
        if (p > 1) {x = w - selector.clientWidth / 2; p = 1;}
        else if (p < 0) {p = 0; x = -selector.clientWidth/2;}

        selector.style.left = x + "px";

        switch (scale) {
            case "alpha":
                this.handleScaleAlphaClick(p);
                break;
            case "rgb":
                this.handleScaleRGBClick(p);
                break;
        }

        this.handleScaleSelectorClick(scale);
    }

    handleScaleRGBClick(p) {
        var r = 0, g = 0, b = 0;
        if (p < 1/6) {
            // from #f00 to #f0f
            r = 255;
            b = p * 6 * 255;
        } else if (p < 2/6) {
            // from #f0f to #00f
            b = 255;
            r = (2/6 - p) * 6 * 255;
        } else if (p < 3/6) {
            // from #00f to #0ff
            b = 255;
            g = (p - 2/6) * 6 * 255;
        } else if (p < 4/6) {
            // from #0ff to #0f0
            g = 255;
            b = (4/6 - p) * 6 * 255;
        } else if (p < 5/6) {
            // from #0f0 to #ff0
            g = 255;
            r = (p - 4/6) * 6 * 255;
        } else {
            // from #ff0 to #f00
            r = 255;
            g = (1 - p) * 6 * 255;
        }
        document.querySelector(".modal-color-picker-gradient").style.setProperty("--slider-rgb-color", `rgb(${r},${g},${b})`);
        this.colors = {r: r, g: g, b: b};
        this.updateCurrentColor();
    }

    handleScaleAlphaClick(p) {
        this.alpha = p;
        this.updateCurrentColor();
    }

    handleScaleSelectorClick(scale) {
        this.dragging[scale] = true;
        document.body.style.cursor = "ew-resize";
    }

    handleScaleSelectorUp(e) {
        this.dragging["rgb"] = false;
        this.dragging["alpha"] = false;
        this.dragging["gradient"] = false;
        document.body.style.cursor = "";
    }

    handleMouseMove(e) {
        var x = e.x - document.querySelector(".modal-color-picker-rgb-scale").getBoundingClientRect().x;
        if (this.dragging["rgb"]) {
            return this.handleScaleClick(x, "rgb");
        } else if (this.dragging["alpha"]) {
            return this.handleScaleClick(x, "alpha");
        } else if (this.dragging["gradient"]) {
            var rect = document.querySelector(".modal-color-picker-gradient").getBoundingClientRect();
            return this.handleGradientClick(e.x - rect.x, e.y - rect.y)
        }
    }

    handleGradientClick(x, y) {
        var el = document.querySelector(".modal-color-picker-selection");
        var gradient = document.querySelector(".modal-color-picker-gradient");
        x -= el.clientWidth / 2
        y -= el.clientHeight / 2

        if (x < 0) {x=-4;}
        if (y < 0) {y=-4;}
        if (x + el.clientWidth > gradient.clientWidth) {x = gradient.clientWidth-4;}
        if (y + el.clientHeight > gradient.clientHeight) {y = gradient.clientHeight-4;}

        el.style.left = x + "px";
        el.style.top = y + "px";

        this.handleGradientSelectorClick();
        this.updateCurrentColor();
    }

    handleGradientSelectorClick() {
        this.dragging["gradient"] = true;
        document.body.style.setProperty("cursor", "move", "important");
    }

    updateCurrentColor() {
        var el = document.querySelector(".modal-color-picker-selection");
        var gradient = document.querySelector(".modal-color-picker-gradient");
        var x = el.offsetLeft+4, y = el.offsetTop+4;

        var px = x / gradient.clientWidth, py = y / gradient.clientHeight;
        var r = this.colors.r, g = this.colors.g, b = this.colors.b;
        var nr = 255 + (r - 255) * px, ng = 255+(g - 255) * px, nb = 255+(b - 255) * px
        nr = nr * (1 - py), ng = ng * (1 - py), nb = nb * (1 - py);
        document.querySelector(".modal-color-picker").style.setProperty("--current-color", `rgba(${nr}, ${ng}, ${nb}, ${this.alpha})`);
        document.querySelector(".modal-color-picker").style.setProperty("--current-color-no-alpha", `rgb(${nr}, ${ng}, ${nb})`);

        nr = Math.round(nr), ng = Math.round(ng), nb = Math.round(nb);
        var alpha = Math.round(this.alpha * 255);

        var _ = d=>d.length==1 ? "0"+d : d

        var hex = _(nr.toString(16).toUpperCase()) + _(ng.toString(16).toUpperCase()) + _(nb.toString(16).toUpperCase());
        console.log(nr, ng, nb, nr.toString(16).toUpperCase(), ng.toString(16).toUpperCase(), nb.toString(16).toUpperCase());
        if (alpha != 255) {
            hex += _(alpha.toString(16).toUpperCase());
        }
        document.querySelector(".modal-color-picker-value-input").value = "#"+hex;
    }
}

window.addEventListener("load", e=>{
    document.querySelector(".tab-editor").innerHTML = "";
    new ModalColorPicker(200, 200, "red").render();
}, false);

