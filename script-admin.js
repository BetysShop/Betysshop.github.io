 const STORAGE_KEY = 'bolsasDama-products';
  const defaultProducts = [
    {
      id: 'p1',
      name: 'Bolsa Clásica Negra',
      description: 'Bolsa de cuero genuino con acabado suave y diseño atemporal.',
      details: 'Material: Cuero genuino\nTamaño: 30cm x 20cm x 10cm\nColores disponibles: Negro, marrón, beige\nGarantía: 12 meses contra defectos de fabricación',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      rating: 4
    },
  ];

  const productTableBody = document.getElementById('product-table-body');
  const modalOverlay = document.getElementById('modal-product-form');
  const modalTitle = document.getElementById('modal-title');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const btnAddProduct = document.getElementById('btn-add-product');
  const form = document.getElementById('product-form');
  const formSubmitBtn = document.getElementById('form-submit-btn');
  const formCancelBtn = document.getElementById('form-cancel-btn');

  const inputId = document.getElementById('product-id');
  const inputName = document.getElementById('product-name');
  const inputDesc = document.getElementById('product-desc');
  const inputDetails = document.getElementById('product-details');
  const inputPrice = document.getElementById('product-price');
  const inputImageFile = document.getElementById('product-image-file');
  const imagePreview = document.getElementById('image-preview');

  function loadProducts() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [...defaultProducts];
      }
    }
    return [...defaultProducts];
  }

  function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  let products = loadProducts();

  function generateId() {
    return 'p' + Math.random().toString(36).substr(2, 9);
  }

  function renderProducts() {
    productTableBody.innerHTML = '';
    if (products.length === 0) {
      const row = document.createElement('tr');
      const td = document.createElement('td');
      td.setAttribute('colspan', 4);
      td.style.textAlign = 'center';
      td.style.padding = '2rem';
      td.style.color = '#999';
      td.textContent = 'No hay productos disponibles.';
      row.appendChild(td);
      productTableBody.appendChild(row);
      return;
    }
    products.forEach(product => {
      const tr = document.createElement('tr');
      const tdImage = document.createElement('td');
      const img = document.createElement('img');
      img.src = product.image;
      img.alt = `Imagen de ${product.name}`;
      img.className = 'thumbnail';
      tdImage.appendChild(img);
      tr.appendChild(tdImage);

      const tdName = document.createElement('td');
      tdName.textContent = product.name;
      tdName.className = 'product-name';
      tr.appendChild(tdName);

      const tdPrice = document.createElement('td');
      tdPrice.textContent = `$${product.price.toLocaleString('es-MX')} MXN`;
      tdPrice.className = 'product-price';
      tr.appendChild(tdPrice);

      const tdActions = document.createElement('td');
      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn-edit';
      btnEdit.setAttribute('aria-label', `Editar ${product.name}`);
      btnEdit.title = 'Editar';
      btnEdit.innerHTML = '&#9998;';
      btnEdit.addEventListener('click', () => openEditModal(product.id));
      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn-delete';
      btnDelete.setAttribute('aria-label', `Eliminar ${product.name}`);
      btnDelete.title = 'Eliminar';
      btnDelete.innerHTML = '&#128465;';
      btnDelete.addEventListener('click', () => confirmDelete(product.id));
      tdActions.appendChild(btnEdit);
      tdActions.appendChild(btnDelete);
      tr.appendChild(tdActions);

      productTableBody.appendChild(tr);
    });
  }

  function openAddModal() {
    modalTitle.textContent = 'Agregar Producto';
    form.reset();
    inputId.value = '';
    inputDetails.value = '';
    clearImagePreview();
    formSubmitBtn.textContent = 'Agregar';
    showModal();
  }

  function setImagePreview(src) {
    if (src) {
      imagePreview.src = src;
      imagePreview.hidden = false;
    } else {
      clearImagePreview();
    }
  }
  function clearImagePreview() {
    imagePreview.src = '';
    imagePreview.hidden = true;
  }

  function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    modalTitle.textContent = 'Editar Producto';
    inputId.value = product.id;
    inputName.value = product.name;
    inputDesc.value = product.description;
    inputDetails.value = product.details || '';
    inputPrice.value = product.price;
    clearImagePreview();
    setImagePreview(product.image);
    inputImageFile.value = '';
    formSubmitBtn.textContent = 'Guardar cambios';
    showModal();
  }

  function showModal() {
    modalOverlay.classList.add('active');
    inputName.focus();
    trapFocus(modalOverlay);
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    releaseFocusTrap();
    btnAddProduct.focus();
  }

  function confirmDelete(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const confirmed = confirm(`¿Estás seguro que deseas eliminar "${product.name}"? Esto no se puede deshacer.`);
    if (confirmed) {
      products = products.filter(p => p.id !== id);
      saveProducts(products);
      renderProducts();
    }
  }

  inputImageFile.addEventListener('change', () => {
    const file = inputImageFile.files[0];
    if (!file) {
      clearImagePreview();
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Por favor, seleccione una imagen PNG o JPEG válida.');
      inputImageFile.value = '';
      clearImagePreview();
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      setImagePreview(e.target.result);
      inputImageFile.dataset.base64 = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const id = inputId.value;
    const name = inputName.value.trim();
    const description = inputDesc.value.trim();
    const details = inputDetails.value.trim();
    const price = Number(inputPrice.value);
    let image = null;
    if (inputImageFile.files.length > 0 && inputImageFile.dataset.base64) {
      image = inputImageFile.dataset.base64;
    } else if (inputId.value) {
      image = imagePreview.src || '';
    }

    if (!name || !description || price < 0 || !image) {
      alert('Por favor, completa todos los campos correctamente e incluye una imagen.');
      return;
    }

    const defaultRating = 0;

    if (id) {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], id, name, description, details, price, image };
      }
    } else {
      const newProduct = { id: generateId(), name, description, details, price, image, rating: defaultRating };
      products.push(newProduct);
    }
    saveProducts(products);
    renderProducts();
    closeModal();
  });

  formCancelBtn.addEventListener('click', () => closeModal());
  modalCloseBtn.addEventListener('click', () => closeModal());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
  });
  btnAddProduct.addEventListener('click', () => openAddModal());

  let focusedElementBeforeModal = null;
  function trapFocus(modal) {
    focusedElementBeforeModal = document.activeElement;
    const focusableElements = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;
    let firstElement = focusableElements[0];
    let lastElement = focusableElements[focusableElements.length - 1];
    function handleFocus(event) {
      if (event.key !== 'Tab') return;
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
    modal.addEventListener('keydown', handleFocus);
    modal.dataset.handleFocus = handleFocus;
  }
  function releaseFocusTrap() {
    if (!modalOverlay.dataset.handleFocus) return;
    modalOverlay.removeEventListener('keydown', modalOverlay.dataset.handleFocus);
    modalOverlay.dataset.handleFocus = null;
    if (focusedElementBeforeModal) focusedElementBeforeModal.focus();
  }

  renderProducts();