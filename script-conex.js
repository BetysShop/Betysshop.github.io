// Configuración de Supabase
const SUPABASE_URL = 'https://pjnpakaiixluyyiklwtw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqbnBha2FpaXhsdXl5aWtsd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODk4NzQsImV4cCI6MjA2NTM2NTg3NH0.cBchO1Z_rqTbhM8Ni82WaH9RDZKtiV5yJOgrAwIrlJE';

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables globales
let currentEditingProductId = null;

// Elementos del DOM
const productTableBody = document.getElementById('product-table-body');
const modal = document.getElementById('modal-product-form');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');
const btnAddProduct = document.getElementById('btn-add-product');
const modalCloseBtn = document.getElementById('modal-close-btn');
const formCancelBtn = document.getElementById('form-cancel-btn');
const imageInput = document.getElementById('product-image-file');
const imagePreview = document.getElementById('image-preview');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadProducts);
btnAddProduct.addEventListener('click', openAddProductModal);
modalCloseBtn.addEventListener('click', closeModal);
formCancelBtn.addEventListener('click', closeModal);
productForm.addEventListener('submit', handleFormSubmit);
imageInput.addEventListener('change', handleImagePreview);

// Cerrar modal al hacer click fuera de él
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Función para cargar productos desde Supabase
async function loadProducts() {
    try {
        const { data: products, error } = await supabase
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayProducts(products);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar los productos');
    }
}

// Función para mostrar productos en la tabla
function displayProducts(products) {
    productTableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                ${product.imagen_url ? 
                    `<img src="${product.imagen_url}" alt="${product.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">` : 
                    '<div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">Sin imagen</div>'
                }
            </td>
            <td>${product.nombre}</td>
            <td>$${product.precio.toLocaleString('es-MX')}</td>
            <td>
                <button onclick="editProduct(${product.id})" class="btn-edit" title="Editar producto">✏️</button>
                <button onclick="deleteProduct(${product.id})" class="btn-delete" title="Eliminar producto">🗑️</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

// Abrir modal para agregar producto
function openAddProductModal() {
    currentEditingProductId = null;
    modalTitle.textContent = 'Agregar Producto';
    productForm.reset();
    imagePreview.hidden = true;
    modal.style.display = 'flex';
}

// Abrir modal para editar producto
async function editProduct(productId) {
    try {
        const { data: product, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        currentEditingProductId = productId;
        modalTitle.textContent = 'Editar Producto';
        
        // Llenar el formulario con los datos del producto
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.nombre;
        document.getElementById('product-desc').value = product.descripcion;
        document.getElementById('product-details').value = product.detalles || '';
        document.getElementById('product-price').value = product.precio;
        
        // Mostrar imagen actual si existe
        if (product.imagen_url) {
            imagePreview.src = product.imagen_url;
            imagePreview.hidden = false;
        } else {
            imagePreview.hidden = true;
        }
        
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error al cargar producto:', error);
        alert('Error al cargar los datos del producto');
    }
}
//prueba del boton
if (typeof window.supabase === 'undefined') {
    console.error('Supabase no está cargado');
    alert('Error: No se pudo cargar Supabase. Verifica la conexión a internet.');
}

// Verificar si el botón existe
document.addEventListener('DOMContentLoaded', function() {
    const btnAddProduct = document.getElementById('btn-add-product');
    if (!btnAddProduct) {
        console.error('Botón btn-add-product no encontrado');
    } else {
        console.log('Botón encontrado, agregando event listener');
        btnAddProduct.addEventListener('click', function() {
            console.log('Botón clickeado');
            openAddProductModal();
        });
    }
});
// Eliminar producto
async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        alert('Producto eliminado exitosamente');
        loadProducts();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
    }
}

// Manejar envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    const productData = {
        nombre: formData.get('product-name'),
        descripcion: formData.get('product-desc'),
        detalles: formData.get('product-details'),
        precio: parseFloat(formData.get('product-price'))
    };

    // Validar datos
    if (!productData.nombre || !productData.descripcion || !productData.precio) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    try {
        let imageUrl = null;
        
        // Subir imagen si se seleccionó una
        const imageFile = formData.get('product-image-file');
        if (imageFile && imageFile.size > 0) {
            imageUrl = await uploadImage(imageFile, productData.nombre);
            if (imageUrl) {
                productData.imagen_url = imageUrl;
            }
        }

        if (currentEditingProductId) {
            // Actualizar producto existente
            const { error } = await supabase
                .from('productos')
                .update(productData)
                .eq('id', currentEditingProductId);

            if (error) throw error;
            alert('Producto actualizado exitosamente');
        } else {
            // Crear nuevo producto
            const { error } = await supabase
                .from('productos')
                .insert([productData]);

            if (error) throw error;
            alert('Producto agregado exitosamente');
        }

        closeModal();
        loadProducts();
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar el producto: ' + error.message);
    }
}

// Subir imagen a Supabase Storage
async function uploadImage(file, productName) {
    try {
        // Crear nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
        
        // Subir archivo al bucket 'productos'
        const { data, error } = await supabase.storage
            .from('productos')
            .upload(fileName, file);

        if (error) throw error;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('productos')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Error al subir imagen:', error);
        alert('Error al subir la imagen: ' + error.message);
        return null;
    }
}

// Vista previa de imagen
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.hidden = false;
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.hidden = true;
    }
}

// Cerrar modal
function closeModal() {
    modal.style.display = 'none';
    productForm.reset();
    imagePreview.hidden = true;
    currentEditingProductId = null;
}

// Hacer funciones globales para los botones onclick
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;