class ToushifTag extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define("toushif-tag", ToushifTag);

const touTag = new ToushifTag();
touTag.innerText = "Hey, there's another way to display content";
Object.assign(touTag.style, {
    color: "blue",
    display: "block",
});
const section = document.getElementsByTagName("section")[0];
section.insertBefore(touTag, section.firstElementChild);

//////////////////////////////
let PAGE_NUMBER = 0,
    DELAY = 500,
    controller = new AbortController(),
    signal = controller.signal,
    timer;

function callAbort(e) {
    console.log('Aborted!', e)
}
signal.onabort = callAbort

function search(e) {
    PAGE_NUMBER = 0;
    //Use settimeout coz onkeydown event still does not have the character untill the entire keypress event cycle happen. So set up a delay so the character registers by that time. Or use onkeyup if you dont want a settimeout.
    setTimeout(() => {
        debounce(e.value);
    });
}

function debounce(value) {
    if (timer) {
        clearTimeout(timer);
    }
    timer = setTimeout(() => {
        operation(value);
    }, DELAY);
}

function operation(value) {
    controller.abort();
    controller = new AbortController();
    signal = controller.signal;
    signal.onabort = callAbort;
    loadData(value);
}

async function loadData(query) {
    PAGE_NUMBER++;
    const res = await fetch(
        `http://openlibrary.org/search.json?q=${query}&page=${PAGE_NUMBER}`,
        { signal }
    ).catch(err => {
        console.log('err', err, err.name)
    });
    if(!res) return;
    const resJson = await res.json();
    console.log('RESPONSE', resJson);
    render(resJson.docs)
}

function render(res) {
    if(res.length) {
        for(let i = 0; i < res.length; i++) {
            const doc = res[i];
            if(doc.title && doc.author_name && !doc.title.includes('Undefined')) {
                const eleDiv = document.createElement('div')
                eleDiv.classList.add('article-wrapper')
                Object.assign(eleDiv.style, {
                    display: "block",
                    padding: '1rem',
                    backgroud: '#ddd',
                    border: '1px solid #333',
                    borderRadius: '4px'
                });
                const eleParId = document.createElement('p')
                eleParId.innerHTML = '<b>ID:</b> ' + (doc.cover_edition_key || doc.cover_i || '0')
                const eleParTitle = document.createElement('p')
                eleParTitle.innerHTML = '<b>Title:</b> ' + doc.title
                const eleParAuth = document.createElement('p')
                eleParAuth.innerHTML = '<b>Author(s):</b> ' + doc.author_name.toString();
                const eleParDate = document.createElement('p')
                eleParDate.innerHTML = '<b>Date publised:</b> ' + (doc.publish_date ? (doc.publish_date[0] + doc.publish_year ? (', ' + doc.publish_year[0]) : '') : 'Not found');
                const eleParPub = document.createElement('p')
                eleParPub.innerHTML = '<b>Publiser:</b> ' + (doc.publisher ? doc.publisher[0] : 'N/A');
                const eleParType = document.createElement('p')
                eleParType.innerHTML = '<b>Type:</b> ' + (doc.type || 'N/A');

                eleDiv.innerHTML += eleParId.outerHTML + eleParTitle.outerHTML + eleParAuth.outerHTML + eleParDate.outerHTML + eleParPub.outerHTML + eleParType.outerHTML;

                const parent = document.getElementById('wrapperArticles');
                parent.appendChild(eleDiv);
            }
        }
    }
}

window.onload = function (e) {
    loadData();
};
