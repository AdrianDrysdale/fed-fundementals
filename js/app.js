function getProducts(page) {

  if (page < 1) {
    page = 1
  }

  let limit = 5

  let tableData =  `
        <tr>
          <th>Image</th>
          <th>Title</th>
          <th>Product ID <i class="i-sort-desc"></i></th>
          <th>Category</th>
          <th>Rating</th>
          <th>Price</th>
        </tr>`

  fetch('https://fakestoreapi.com/products')
    .then(res=>res.json())
    .then(products=> {

      let maxPages =  products.length / limit

      if (page > maxPages) {
        page = maxPages
      }

      document.getElementsByClassName('totals')[0].innerHTML = `
           <p>${page * limit - 4}-${page * limit} <span>of</span> ${products.length}</p>`

      document.getElementById('page').value = page
      document.getElementById('total-pages').innerHTML = (maxPages).toString()

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

      document.querySelector('.next').onclick = function (){
        getProducts(page + 1)
      };

      document.querySelector('.previous').onclick = function (){
        getProducts(page - 1)
      };

      document.querySelector('.first').onclick = function (){
        getProducts(1)
      };

      document.querySelector('.last').onclick = function (){
        getProducts(maxPages)
      };

      document.getElementById('page').onblur = function (){
        getProducts(parseInt(this.value))
      };

      products.slice((page - 1) * limit, page * limit).forEach((product) => {
        tableData += `
          <tr>
            <td><img src="${product.image}" /></td>
            <td><a href="/">${product.title}</a></td>
            <td>${product.id}</td>
            <td>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
            <td>${product.rating.rate} (${product.rating.count})</td>
            <td>${Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP'}).format(product.price)}</td>
          </tr>`;
      });

      document.getElementById('table').innerHTML = tableData
    })
}

getProducts(1)
