function ucFirst(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function renderFilters() {
  fetch('https://fakestoreapi.com/products/categories')
    .then(res => res.json())
    .then(categories => {

      let filters = '<ul>';

      categories.forEach((category) => {
        filters += `<li><input type="checkbox" name="filters" value="${category}" />${ucFirst(category)}</li>`;
      });

      document.getElementById('filter-list').innerHTML = filters + '</ul>';

      let modal = document.getElementById("filters-modal");

      document.getElementById("close-filters").onclick = function () {
        modal.style.display = "none";
      }

      window.onclick = function (event) {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      }

      modal.style.display = "block";
    });
}

function applyFilters() {
  const filters = document.getElementsByName('filters');

  for (let i = 0; i < filters.length; i++) {

    const filter = filters[i];

    if (filter.checked) {
      getProducts(1, 'asc', filter.value);
      renderAppliedFilter(filter.value);
      break;
    }
  }

  document.getElementById("filters-modal").style.display = "none";
}

function renderAppliedFilter(selectedFilter) {
  document.getElementById("applied-filters").innerHTML = `
    <div class="applied-filter">
      <p>Category: ${ucFirst(selectedFilter)}</p>
      <span class="clear-filter">&times;</span>
    </div>`;

  document.querySelector(".clear-filter").onclick = function () {
    clearFilters();
  }
}

function clearFilters() {
  document.getElementById("applied-filters").innerHTML = '';
  getProducts();
}

function getProducts(page = 1, sort = 'asc', category = '') {

  if (page < 1) {
    page = 1
  }

  let limit = 5

  let endpoint = 'https://fakestoreapi.com/products';

  if (category !== '') {
    endpoint += '/category/' + category
  }

  fetch(endpoint + '?sort=' + sort)
    .then(res => res.json())
    .then(products => {

      let maxPages = Math.ceil(products.length / limit)
      let from = page * limit - (limit - 1)
      let too = page * limit

      if (page > maxPages) {
        page = maxPages
      }

      if (too > products.length) {
        too = products.length
      }

      document.getElementsByClassName('totals')[0].innerHTML = `
           <p>${from}-${too} <span>of</span> ${products.length}</p>`

      document.getElementById('page').value = page
      document.getElementById('total-pages').innerHTML = (maxPages).toString()

      let tableData = ''

      products.slice((page - 1) * limit, page * limit).forEach((product) => {
        tableData += `
          <tr>
            <td><img src="${product.image}"  alt=""/></td>
            <td><a href="/">${product.title}</a></td>
            <td>${product.id}</td>
            <td>${ucFirst(product.category)}</td>
            <td>${product.rating.rate} (${product.rating.count})</td>
            <td>${Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP'}).format(product.price)}</td>
          </tr>`
      })

      document.getElementsByTagName('tbody')[0].innerHTML = tableData
      buildPagination(page, maxPages, sort, category);

      let arrowUp = document.querySelector('.icon-tabler-arrow-narrow-up');
      let arrowDown = document.querySelector('.icon-tabler-arrow-narrow-down')

      if (sort === 'asc') {
        arrowUp.style.display = 'none'
      } else {
        arrowDown.style.display = 'none'
      }

      arrowDown.onclick = function () {
        arrowDown.style.display = 'none'
        arrowUp.style.display = 'inline'
        getProducts(1, 'desc', category)
      }

      arrowUp.onclick = function () {
        arrowUp.style.display = 'none'
        arrowDown.style.display = 'inline'
        getProducts(1, 'asc', category)
      }
    })
}

function buildPagination(page, maxPages, sort, category) {
  document.getElementsByClassName('first')[0].classList.remove('grey-square')
  document.getElementsByClassName('previous')[0].classList.remove('grey-square')
  document.getElementsByClassName('last')[0].classList.remove('grey-square')
  document.getElementsByClassName('next')[0].classList.remove('grey-square')

  if (page === 1) {
    document.getElementsByClassName('first')[0].classList.add('grey-square')
    document.getElementsByClassName('previous')[0].classList.add('grey-square')
  }

  if (page === maxPages) {
    document.getElementsByClassName('last')[0].classList.add('grey-square')
    document.getElementsByClassName('next')[0].classList.add('grey-square')
  }

  if (page !== maxPages) {
    document.querySelector('.next').onclick = function () {
      getProducts(page + 1, sort, category)
    };

    document.querySelector('.last').onclick = function () {
      getProducts(maxPages, sort, category)
    };
  }

  document.querySelector('.previous').onclick = function () {
    getProducts(page - 1, sort, category)
  };

  document.querySelector('.first').onclick = function () {
    getProducts(1, sort, category)
  };

  document.getElementById('page').onblur = function () {
    getProducts(parseInt(this.value), sort, category)
  };
}

document.querySelector('.filters button').onclick = function () {
  renderFilters();
}

document.querySelector('.filter-footer button').onclick = function () {
  applyFilters();
}

getProducts();
