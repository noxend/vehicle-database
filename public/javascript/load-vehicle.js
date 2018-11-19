const input = document.getElementById('search');
const form = document.getElementById('form');
const cardContainer = document.getElementById('cards-container');

console.log(cardContainer);


function createElement(tag, probs, ...children) {
    const element = document.createElement(tag);
    Object.keys(probs).forEach(key => {
      if (key === 'style') {
        Object.keys(probs[key]).forEach(i => {
          element.style[i] = probs.style[i];
        });
      } else {
        element[key] = probs[key];
      }
    });
  
    children.forEach(item => {
      if (typeof item === 'string') {
        element.innerText = item;
      } else {
        element.appendChild(item);
      }
    });
    return element;
  }

form.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.replace(`/search/${input.value}`);
});




function search() {
    input.addEventListener('keyup', (e) => {
        cardContainer.innerHTML = '';
        fetch('/api/vehicle/search', {
            method: 'post',
            headers: { 'Content-type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({data: e.target.value})
        }).then(function(response) {
            response.json().then(function(data) {
                data.forEach(el => {
                    let card = createElement('div', { className: 'col-xl-4 col-lg-4 col-md-6 col-sm-12 cardContent' },
                        createElement('div', { className: 'card1' },
                            createElement('a', { href: `/info/${el.id}` },
                                createElement('div', { className: 'dark' })
                            ),
                            createElement('div', { className: 'thumbnail', style: { backgroundImage: `url(${el.image})` } }),
                            createElement('div', { className: 'data'}, 
                                createElement('h5', {}, `${el.mark_name} ${el.model}`),
                                createElement('p', {}, `${el.year}`),
                                createElement('p', {}, `${el.country}`)
                            ),
                            createElement('div', { className: 'blur' }),
                            createElement('div', { className: 'bottom1' }, 
                                createElement('nav', { className: 'nav nav-pills nav-justified' },
                                    createElement('a', { className: 'nav-link', href: `/info/${el.id}` }, 'Більше'),
                                    createElement('a', { className: 'nav-link', href: `/info/${el.id}` }, 'Редагувати'),
                                )
                            )
                        )
                    );
                    cardContainer.appendChild(card);
                });
            });
        });  
    });
}

function main() {
    search();
}

main();
