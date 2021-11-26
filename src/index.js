class ToushifTag extends HTMLElement {
    constructor() {
        super()
    }
}

customElements.define('toushif-tag', ToushifTag)

const touTag = new ToushifTag()
touTag.innerText = 'Hey There another way to display content';
touTag.style.color = 'blue';
document.body.appendChild(touTag)
