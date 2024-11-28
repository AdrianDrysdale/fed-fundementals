function renderFilters() {

  let modal = document.getElementById("filters-modal");
  let filterList = document.getElementById('filter-list')

  if (document.getElementById('filter-list').innerHTML) {
    modal.style.display = "block";
    return;
  }

  fetch('https://fakestoreapi.com/products/categories')
    .then(res => res.json())
    .then(categories => {

      let filters = '<ul>';

      categories.forEach((category) => {
        filters += `
          <li>
            <label class="checkbox">
              <input onclick="displayFilterButton()" type="checkbox" name="filters" value="${category}" />
              ${ucFirst(category)}
              <span class="checkmark" />
            </label>
          </li>
        `;
      });

      document.getElementById('filter-list').innerHTML = filters + '</ul>';

      document.getElementById("close-filters").onclick = () => modal.style.display = "none";

      window.onclick = function (event) {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      }

      modal.style.display = "block";
    });

  document.querySelector('.filter-footer button').onclick = () => applyFilters();
}


function displayFilterButton() {

  const filters = document.getElementsByName('filters');
  const applyFiltersButton = document.querySelector(".filter-footer button");

  let buttonDisabled = true;

  for (const filter of filters) {
    if (filter.checked) {
      buttonDisabled = false;
      break;
    }
  }

  applyFiltersButton.disabled = buttonDisabled;
  applyFiltersButton.classList.toggle("primary", !buttonDisabled);
}


function applyFilters() {

  const filters = document.getElementsByName('filters');

  for (const filter of filters) {
    if (filter.checked) {
      getProducts(1, 'asc', filter.value);
      renderAppliedFilter(filter.value);
    }
  }

  document.getElementById("filters-modal").style.display = "none";
}

function renderAppliedFilter(selectedFilter) {
  document.getElementById("filter-chips").innerHTML += `
    <div class="chip">
      <p>Category: <span class="categorized-chip">${ucFirst(selectedFilter)}</span></p>
      <span class="clear-filter">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
      </span>
    </div>`;

  document.querySelector(".clear-filter").onclick = () => clearFilters();
}

function clearFilters() {
  document.getElementById("filter-chips").innerHTML = '';
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

      if (page > maxPages) {
        page = maxPages
      }

      let from = page * limit - (limit - 1)
      let too = page * limit

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

      arrowDown.onclick = () => {
        arrowDown.style.display = 'none'
        arrowUp.style.display = 'inline'
        getProducts(1, 'desc', category)
      }

      arrowUp.onclick = () => {
        arrowUp.style.display = 'none'
        arrowDown.style.display = 'inline'
        getProducts(1, 'asc', category)
      }
    })
}

function buildPagination(page, maxPages, sort, category) {

  let first = document.querySelector('.first');
  let next = document.querySelector('.next');
  let last = document.querySelector('.last');
  let previous = document.querySelector('.previous');

  first.classList.remove('grey-square');
  previous.classList.remove('grey-square');
  last.classList.remove('grey-square');
  next.classList.remove('grey-square');

  if (page === 1) {
    first.classList.add('grey-square');
    previous.classList.add('grey-square');
  }

  if (page === maxPages) {
    last.classList.add('grey-square');
    next.classList.add('grey-square');
  }

  next.onclick = () => getProducts(page + 1, sort, category);
  previous.onclick = () => getProducts(page - 1, sort, category);
  last.onclick = () => getProducts(maxPages, sort, category);
  first.onclick = () => getProducts(1, sort, category);

  document.getElementById('page').onblur = function () {
    getProducts(parseInt(this.value), sort, category);
  };
}

ucFirst = (word) => word.charAt(0).toUpperCase() + word.slice(1);

getProducts();
document.querySelector('.filters button').onclick = () => renderFilters();

