  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function loadProducts() {
    const stored = localStorage.getItem('bolsasDama-products');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  function renderStars(rating) {
    rating = Math.min(Math.max(parseInt(rating) || 0, 0), 5);
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<svg class="star${i <= rating ? ' filled' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true" width="20" height="20" fill="${i <= rating ? '#f59e0b' : '#cbd5e1'}"><path d="M10 15l-5.878 3.09 1.123-6.545L.49 7.91l6.566-.955L10 1.5l2.944 5.456 6.566.955-4.755 4.635 1.123 6.545z"/></svg>`;
    }
    return starsHtml;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('es-ES', {year:'numeric', month:'long', day:'numeric'});
  }

  function loadComments(productId) {
    const stored = localStorage.getItem(`comments-${productId}`);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  function saveComments(productId, comments) {
    localStorage.setItem(`comments-${productId}`, JSON.stringify(comments));
  }

  function renderComments(comments) {
    const commentList = document.getElementById('comment-list');
    if (!comments.length) {
      commentList.innerHTML = `<li style="text-align:center; color:#999;">No hay comentarios aún. ¡Sé el primero en comentar!</li>`;
      return;
    }
    let html = '';
    comments.forEach(({author, rating, text, date}) => {
      html += `
      <li class="comment-item">
        <div class="comment-header">
          <span class="comment-author">${author}</span>
          <span class="comment-date">${formatDate(date)}</span>
        </div>
        <div class="stars" aria-label="Valoración: ${rating} de 5 estrellas">${renderStars(rating)}</div>
        <p class="comment-text">${text}</p>
      </li>`;
    });
    commentList.innerHTML = html;
  }

  function renderProduct(product) {
    if (!product) {
      document.querySelector('main.container').innerHTML = "<p style='text-align:center; font-size:1.5rem; color:#999;'>Producto no encontrado.</p>";
      return;
    }
    document.getElementById('product-image').src = product.image;
    document.getElementById('product-image').alt = 'Imagen de ' + product.name;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-price').textContent = `$${product.price.toLocaleString('es-MX')} MXN`;
    const detailsEl = document.getElementById('product-details');

    detailsEl.textContent = product.details || 'No hay detalles adicionales para este producto.';
  }

  document.getElementById('add-to-cart-form').addEventListener('submit', e => {
    e.preventDefault();
    const qtyInput = document.getElementById('quantity-input');
    const quantity = parseInt(qtyInput.value,10);
    if (isNaN(quantity) || quantity < 1) {
      alert('Por favor, ingresa una cantidad válida (1 o más).');
      return;
    }
    const productName = document.getElementById('product-name').textContent;
    alert(`Has agregado ${quantity} unidad${quantity>1?'es':''} de "${productName}" al carrito.`);
  });

  document.getElementById('comment-form').addEventListener('submit', e => {
    e.preventDefault();
    const author = e.target['comment-author'].value.trim();
    const rating = parseInt(e.target['comment-rating'].value, 10);
    const text = e.target['comment-text'].value.trim();
    if (!author || !rating || !text) {
      alert('Por favor, completa todos los campos antes de enviar tu comentario.');
      return;
    }
    const newComment = {
      author, rating, text, date: new Date().toISOString()
    };
    const comments = loadComments(productId);
    comments.unshift(newComment);
    saveComments(productId, comments);
    renderComments(comments);
    e.target.reset();
  });

  const productId = getQueryParam('id');
  const products = loadProducts();
  const product = products.find(p => p.id === productId);
  renderProduct(product);

  const comments = productId ? loadComments(productId) : [];
  renderComments(comments);