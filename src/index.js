class ToushifTag extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define("toushif-tag", ToushifTag);

// const touTag = new ToushifTag();
// touTag.innerText = "Hey, there's another way to display content";
// Object.assign(touTag.style, {
//     color: "blue",
//     display: "block",
// });
// const section = document.getElementsByTagName("section")[0];
// section.insertBefore(touTag, section.firstElementChild);

//////////////////////////////
let PAGE_NUMBER = 0,
    DELAY = 500,
    QUERY = 'random',
    API = 'http://openlibrary.org/search.json', //not wokring over https network
    controller = new AbortController(),
    signal = controller.signal,
    parent = document.getElementById('wrapperArticles'),
    loading = false,
    timer;

const articleStyles = {
    width: '30rem',
    display: "block",
    padding: '1rem',
    background: '#ddd',
    border: '1px solid #333',
    borderRadius: '4px',
    marginBottom: '1rem',
    opacity: '0',
    transition: '0.5s'
}

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
    QUERY = value;
    loadData(true);
}

async function loadData(isSearch=false) {
    PAGE_NUMBER++;
    parent.style.opacity = '0.4'
    const res = await fetch(
        `${API}?q=${QUERY}&page=${PAGE_NUMBER}`,
        { signal }
    ).catch(err => {
        parent.innerHTML = ''
        parent.style.opacity = '1'
        console.log('err', err, err.name)
    });
    if(!res) return;
    const resJson = await res.json();
    // console.log('RESPONSE', resJson);
    isSearch ? parent.innerHTML = '' : ''
    parent.style.opacity = '1'
    render(resJson.docs)
    return Promise.resolve(true)
}

function render(res) {
    if(res.length) {
        const min = Math.min(res.length, 10)
        let count = 0;
        for(let i = 0; i < res.length; i++) {
            const doc = res[i];
            if(doc.title && doc.author_name && !doc.title.toLowerCase().includes('undefined') && count < min) {
                count++
                const eleDiv = document.createElement('div')
                eleDiv.classList.add('article-wrapper')
                Object.assign(eleDiv.style, articleStyles);
                if(count === min) {
                    eleDiv.style.marginBottom = '10rem'
                    intersectionObserve(eleDiv)
                }
                transition(eleDiv, count)
                
                const eleParId = document.createElement('p')
                eleParId.innerHTML = '<b>ID:</b> ' + (doc.cover_edition_key || doc.cover_i || Math.floor(Math.random()*Math.pow(10, 8)))
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

                parent.appendChild(eleDiv);
            }
        }
    }
}

function transition(ele, count) {
    setTimeout(() => {
        ele.style.transform = `translateX(${count%2 === 0 ? 35 : -35}%)`
        ele.style.opacity = '1'
    }, DELAY);
}

function intersectionObserve(ele) {
    const observer = new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting) {
            loadData().then(v => {
                observer.disconnect()
                ele.style.marginBottom = '1rem'
            })
        }
    })
    observer.observe(ele)
}

window.onload = function (e) {
    loadData();
};
