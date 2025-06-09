 const STORAGE_KEY = 'bolsasDama-products';
  const productGrid = document.querySelector('.product-grid');

  function renderStars(rating) {
    rating = Math.min(Math.max(parseInt(rating) || 0, 0), 5);
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
    starsHtml += `
      <svg class="star${i <= rating ? ' filled' : ''}" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20" aria-hidden="true" width="18" height="18">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.49 7.91l6.566-.955L10 1.5l2.944 5.456 6.566.955-4.755 4.635 1.123 6.545z"/>
      </svg>`;
  }
  return starsHtml;
  }

  function loadProducts() {
    const storedProducts = localStorage.getItem(STORAGE_KEY);
    if(!storedProducts) return [];
    try {
      return JSON.parse(storedProducts);
    } catch {
      return [];
    }
  }

  function renderProducts(products) {
    if(!products.length) {
      productGrid.innerHTML = '<p style="color:#999; grid-column: 1 / -1; text-align:center;">No hay productos disponibles.</p>';
      return;
    }
    productGrid.innerHTML = '';
    products.forEach(({id, name, description, price, image, rating}) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-labelledby', `product-${id}-name`);
      card.setAttribute('aria-describedby', `product-${id}-desc product-${id}-price product-${id}-rating`);
      card.innerHTML = `
        <a href="producto-detallado.html?id=${encodeURIComponent(id)}" class="product-link" aria-label="Ver detalles de ${name}">
          <img class="product-image" src="${image}" alt="Imagen de ${name}" />
          <div class="product-info">
            <h3 class="product-name" id="product-${id}-name">${name}</h3>
            <p class="product-desc" id="product-${id}-desc">${description}</p>
            <div class="star-rating" aria-label="Valoración: ${rating || 0} de 5 estrellas" id="product-${id}-rating">${renderStars(rating)}</div>
            <p class="product-price" id="product-${id}-price">$${price.toLocaleString('es-MX')} MXN</p>
          </div>
        </a>
      `;
      productGrid.appendChild(card);
    });
  }

  const products = loadProducts();
  renderProducts(products);