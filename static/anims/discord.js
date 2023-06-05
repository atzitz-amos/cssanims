
var style= document.createElement("style");
style.innerHTML = `body {  background-color: #300808;  margin: 0;}.fire {  font-size: 24px;  filter: blur(0.02em);  -webkit-filter: blur(0.02em);  margin: 3em auto 0 auto;  position: relative;  width: 10em;  height: 12em;}.particle {  animation: rise 1s ease-in infinite;  background-image: radial-gradient(#ff5000 20%, rgba(255, 80, 0, 0) 70%);  border-radius: 50%;  mix-blend-mode: screen;  opacity: 0;  position: absolute;  bottom: 0;  width: 5em;  height: 5em;}.particle:nth-of-type(1) {  animation-delay: 0.215272891s;  left: calc((100% - 5em) * 0);}.particle:nth-of-type(2) {  animation-delay: 0.8721721715s;  left: calc((100% - 5em) * 0.02);}.particle:nth-of-type(3) {  animation-delay: 0.5070539797s;  left: calc((100% - 5em) * 0.04);}.particle:nth-of-type(4) {  animation-delay: 0.3840595284s;  left: calc((100% - 5em) * 0.06);}.particle:nth-of-type(5) {  animation-delay: 0.5770481152s;  left: calc((100% - 5em) * 0.08);}.particle:nth-of-type(6) {  animation-delay: 0.3978873396s;  left: calc((100% - 5em) * 0.1);}.particle:nth-of-type(7) {  animation-delay: 0.6489540913s;  left: calc((100% - 5em) * 0.12);}.particle:nth-of-type(8) {  animation-delay: 0.052602843s;  left: calc((100% - 5em) * 0.14);}.particle:nth-of-type(9) {  animation-delay: 0.2632812511s;  left: calc((100% - 5em) * 0.16);}.particle:nth-of-type(10) {  animation-delay: 0.6396774697s;  left: calc((100% - 5em) * 0.18);}.particle:nth-of-type(11) {  animation-delay: 0.8385534804s;  left: calc((100% - 5em) * 0.2);}.particle:nth-of-type(12) {  animation-delay: 0.673960187s;  left: calc((100% - 5em) * 0.22);}.particle:nth-of-type(13) {  animation-delay: 0.4778220782s;  left: calc((100% - 5em) * 0.24);}.particle:nth-of-type(14) {  animation-delay: 0.3007818788s;  left: calc((100% - 5em) * 0.26);}.particle:nth-of-type(15) {  animation-delay: 0.2966470319s;  left: calc((100% - 5em) * 0.28);}.particle:nth-of-type(16) {  animation-delay: 0.5169156355s;  left: calc((100% - 5em) * 0.3);}.particle:nth-of-type(17) {  animation-delay: 0.5141791553s;  left: calc((100% - 5em) * 0.32);}.particle:nth-of-type(18) {  animation-delay: 0.0484846033s;  left: calc((100% - 5em) * 0.34);}.particle:nth-of-type(19) {  animation-delay: 0.1781144617s;  left: calc((100% - 5em) * 0.36);}.particle:nth-of-type(20) {  animation-delay: 0.5776010751s;  left: calc((100% - 5em) * 0.38);}.particle:nth-of-type(21) {  animation-delay: 0.1480968819s;  left: calc((100% - 5em) * 0.4);}.particle:nth-of-type(22) {  animation-delay: 0.8968868955s;  left: calc((100% - 5em) * 0.42);}.particle:nth-of-type(23) {  animation-delay: 0.4314792212s;  left: calc((100% - 5em) * 0.44);}.particle:nth-of-type(24) {  animation-delay: 0.0697870136s;  left: calc((100% - 5em) * 0.46);}.particle:nth-of-type(25) {  animation-delay: 0.9402350949s;  left: calc((100% - 5em) * 0.48);}.particle:nth-of-type(26) {  animation-delay: 0.79051131s;  left: calc((100% - 5em) * 0.5);}.particle:nth-of-type(27) {  animation-delay: 0.7077885481s;  left: calc((100% - 5em) * 0.52);}.particle:nth-of-type(28) {  animation-delay: 0.9546330412s;  left: calc((100% - 5em) * 0.54);}.particle:nth-of-type(29) {  animation-delay: 0.4710817102s;  left: calc((100% - 5em) * 0.56);}.particle:nth-of-type(30) {  animation-delay: 0.1573088528s;  left: calc((100% - 5em) * 0.58);}.particle:nth-of-type(31) {  animation-delay: 0.7575197409s;  left: calc((100% - 5em) * 0.6);}.particle:nth-of-type(32) {  animation-delay: 0.121743903s;  left: calc((100% - 5em) * 0.62);}.particle:nth-of-type(33) {  animation-delay: 0.8279291229s;  left: calc((100% - 5em) * 0.64);}.particle:nth-of-type(34) {  animation-delay: 0.0962499168s;  left: calc((100% - 5em) * 0.66);}.particle:nth-of-type(35) {  animation-delay: 0.202591836s;  left: calc((100% - 5em) * 0.68);}.particle:nth-of-type(36) {  animation-delay: 0.1541469958s;  left: calc((100% - 5em) * 0.7);}.particle:nth-of-type(37) {  animation-delay: 0.3839603365s;  left: calc((100% - 5em) * 0.72);}.particle:nth-of-type(38) {  animation-delay: 0.2109495333s;  left: calc((100% - 5em) * 0.74);}.particle:nth-of-type(39) {  animation-delay: 0.5045460861s;  left: calc((100% - 5em) * 0.76);}.particle:nth-of-type(40) {  animation-delay: 0.6596290031s;  left: calc((100% - 5em) * 0.78);}.particle:nth-of-type(41) {  animation-delay: 0.4950750991s;  left: calc((100% - 5em) * 0.8);}.particle:nth-of-type(42) {  animation-delay: 0.838171885s;  left: calc((100% - 5em) * 0.82);}.particle:nth-of-type(43) {  animation-delay: 0.9669219884s;  left: calc((100% - 5em) * 0.84);}.particle:nth-of-type(44) {  animation-delay: 0.720373315s;  left: calc((100% - 5em) * 0.86);}.particle:nth-of-type(45) {  animation-delay: 0.9667144593s;  left: calc((100% - 5em) * 0.88);}.particle:nth-of-type(46) {  animation-delay: 0.6932459259s;  left: calc((100% - 5em) * 0.9);}.particle:nth-of-type(47) {  animation-delay: 0.4930789749s;  left: calc((100% - 5em) * 0.92);}.particle:nth-of-type(48) {  animation-delay: 0.7659274715s;  left: calc((100% - 5em) * 0.94);}.particle:nth-of-type(49) {  animation-delay: 0.2372903674s;  left: calc((100% - 5em) * 0.96);}.particle:nth-of-type(50) {  animation-delay: 0.0381705725s;  left: calc((100% - 5em) * 0.98);}@keyframes rise {  from {    opacity: 0;    transform: translateY(0) scale(1);  }  25% {    opacity: 1;  }  to {    opacity: 0;    transform: translateY(-10em) scale(0);  }}`
// document.head.appendChild(style);

function createFire(element, width){
    var fire = document.createElement('div');
    fire.className = 'fire';

    fire.style.setProperty('--width', width);

    for (var i = 0; i < 50; i++) {
        let div = document.createElement('div');
        div.className ='particle';
        fire.appendChild(div);
    }
    element.parentNode.appendChild(fire);
    return fire;
}

function getTextWidth(text, font) {
  // re-use canvas object for better performance
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
  const fontSize = getCssStyle(el, 'font-size') || '16px';
  const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}

function burnText(element){
    width = getTextWidth(element.innerText, getCanvasFont(element)) *0.7;
    var fire = createFire(element, width+"px");
    fire.style.position="absolute";
    fire.style.left = element.getBoundingClientRect().x - width / 1.7 + "px";
    fire.style.top = element.getBoundingClientRect().y - width * 2.7 + "px";
}

var node = document.querySelector('ol');

observer = new MutationObserver(function(mutations, observer) {
    let x = mutations[1];
    if(x.type =="childList") {
        let msg_container = x.addedNodes[0];
        let container = document.querySelector(`#${msg_container.id} .messageContent-2t3eCI`);
        let message = container.innerText;
        if(message.endsWith("\\anim")){
            message = message.replace(/\\anim/, "");
            container.innerText = message;
            let pos = container.getBoundingClientRect();
            let pos_X = window.innerWidth / 2 - pos.x;
            let pos_Y =window.innerHeight / 2 - pos.y + pos.height / 2;
            console.log(pos_X, pos_Y);
            container.style.zIndex = 1000;
            container.style.transform = "translateY("+pos_Y+"px) translateX("+pos_X+"px)";
            container.style.fontSize = "2em;"
            createFire(container);
        }
    }
})

observer.observe(node, {characterData: false, childList: true, subtree: false, attributes: false});