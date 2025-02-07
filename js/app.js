async function renderFilters() {

  const modal = document.getElementById("filters-modal");
  const filterList = document.getElementById('filter-list');

  if (filterList.innerHTML) {
    modal.style.display = "block";
    return;
  }

  try {

    const response = await fetch('https://fakestoreapi.com/products/categories');
    const categories = await response.json();

    let filters = '';

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

    filterList.innerHTML = '<ul>' + filters + '</ul>';
    modal.style.display = "block";

    document.querySelector('.filter-footer button').onclick = () => applyFilters();
    document.getElementById("close-filters").onclick = () => modal.style.display = "none";

    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error loading filters:", error);
  }
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

async function applyFilters() {

  const applyFiltersButton = document.querySelector(".filter-footer button");
  applyFiltersButton.disabled = true;

  try {

    const selectedFilters = getSelectedFilters();

    await getProducts(1, 'asc', selectedFilters);

    document.getElementById("filter-chips").innerHTML = '';

    selectedFilters.forEach((selectedFilter) => {
      renderAppliedFilter(selectedFilter);
    });

    if (selectedFilters.length > 1) {
      renderClearFilters();
    }

    document.getElementById("filters-modal").style.display = "none";
  } catch (error) {
    console.error("Error applying filters:", error);
  }

  applyFiltersButton.disabled = false;
}

function renderAppliedFilter(selectedFilter) {
  document.getElementById("filter-chips").innerHTML += `
    <div class="chip" id="filter-${selectedFilter}">
      <p>Category: <span class="categorized-chip">${ucFirst(selectedFilter)}</span></p>
      <span onclick="clearFilter('${selectedFilter.replace(/'/g, "\\'")}')" id="filter-close-${selectedFilter}" class="clear-filter">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
      </span>
    </div>`;
}

function clearFilter(selectedFilter) {
  const selectedFilters = getSelectedFilters();

  const index = selectedFilters.indexOf(selectedFilter);
  selectedFilters.splice(index, 1);

  getProducts(1, 'asc', selectedFilters);
  document.getElementById("filter-" + selectedFilter).remove();

  document.querySelectorAll("[name='filters']:checked").forEach(checkbox => {
    if (ucFirst(checkbox.value) === ucFirst(selectedFilter)) {
      checkbox.checked = false;
    }
  });
}

function renderClearFilters() {
  document.getElementById("filter-chips").innerHTML += '<a onclick="clearFilters()">Clear all</a>';
}

function clearFilters()
{
  document.getElementById("filter-chips").innerHTML = '';

  document.querySelectorAll("[name='filters']:checked").forEach(checkbox => {
      checkbox.checked = false;
  });

  getProducts();
}

async function fetchProducts(sort = 'asc', category = '') {
  try {
    let endpoint = 'https://fakestoreapi.com/products';

    if (category !== '') {
      endpoint += '/category/' + category
    }

    endpoint = endpoint + '?sort=' + sort;

    const response = await fetch(endpoint);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return null;
  }
}

async function getProducts(page = 1, sort = 'asc', category = []) {

  if (page < 1) {
    page = 1
  }

  const limit = 5

  let products = [];

  if (category.length > 0) {
    const fetchPromises = category.map(catItem => fetchProducts(sort, catItem));
    const resultsArray = await Promise.all(fetchPromises);
    products = resultsArray.flat();
  } else {
    products = await fetchProducts(sort);
  }

  if (sort === 'asc') {
    products = products.sort(function(a,b){
      return a.id - b.id;
    })
  }

  if (sort === 'dsc') {
    products = products.sort(function(a,b){
      return a.id + b.id;
    })
  }

  const maxPages = Math.ceil(products.length / limit);

  if (page > maxPages) {
    page = maxPages;
  }

  let from = page * limit - (limit - 1);
  let too = page * limit;

  if (too > products.length) {
    too = products.length;
  }

  document.getElementsByClassName('totals')[0].innerHTML = `
         <p>${from}-${too} <span>of</span> ${products.length}</p>`;

  document.getElementById('page').value = page;
  document.getElementById('total-pages').innerHTML = (maxPages).toString();

  let tableData = '';

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
  });

  document.getElementsByTagName('tbody')[0].innerHTML = tableData;
  buildPagination(page, maxPages, sort, category);

  const arrowUp = document.querySelector('.icon-tabler-arrow-narrow-up');
  const arrowDown = document.querySelector('.icon-tabler-arrow-narrow-down');

  if (sort === 'asc') {
    arrowUp.style.display = 'none';
  } else {
    arrowDown.style.display = 'none';
  }

  arrowDown.onclick = () => {
    arrowDown.style.display = 'none';
    arrowUp.style.display = 'inline';
    getProducts(1, 'desc', category);
  }

  arrowUp.onclick = () => {
    arrowUp.style.display = 'none';
    arrowDown.style.display = 'inline';
    getProducts(1, 'asc', category);
  }
}

function buildPagination(page, maxPages, sort, category) {

  const first = document.querySelector('.first');
  const next = document.querySelector('.next');
  const last = document.querySelector('.last');
  const previous = document.querySelector('.previous');

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
getSelectedFilters = () => Array.from(document.querySelectorAll("[name='filters']:checked")).map(filter => filter.value);

getProducts();
document.querySelector('.filters button').onclick = () => renderFilters();

