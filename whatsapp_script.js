// Verificar que Supabase se cargó correctamente
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase no se cargó correctamente');
    showProductNotFound();
} else {
    console.log('✅ Supabase cargado correctamente en detalles');
}

// Configuración de Supabase (misma que en productos)
const SUPABASE_URL = 'https://pjnpakaiixluyyiklwtw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqbnBha2FpaXhsdXl5aWtsd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODk4NzQsImV4cCI6MjA2NTM2NTg3NH0.cBchO1Z_rqTbhM8Ni82WaH9RDZKtiV5yJOgrAwIrlJE';

// Inicializar cliente de Supabase
let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Cliente de Supabase inicializado para detalles');
} catch (error) {
    console.error('❌ Error al inicializar Supabase:', error);
    showProductNotFound();
}

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
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

// Cargar producto desde Supabase
async function loadProductFromSupabase(productId) {
    if (!supabase || !productId) {
        console.warn('⚠️ Supabase no disponible o ID de producto faltante');
        showProductNotFound();
        return null;
    }
    
    try {
        console.log('📥 Cargando producto desde Supabase con ID:', productId);
        const { data: product, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.warn('⚠️ Producto no encontrado');
                showProductNotFound();
                return null;
            }
            throw error;
        }

        console.log('✅ Producto cargado desde Supabase:', product);
        
        // Transformar datos de Supabase al formato esperado
        const transformedProduct = {
            id: product.id,
            name: product.nombre,
            description: product.descripcion,
            price: product.precio,
            image: product.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen',
            rating: product.rating || 5,
            details: product.detalles || 'No hay detalles adicionales para este producto.'
        };
        
        return transformedProduct;
    } catch (error) {
        console.error('❌ Error al cargar producto:', error);
        showError('Error al cargar el producto. Por favor, recarga la página.');
        return null;
    }
}

// Cargar comentarios desde Supabase
async function loadCommentsFromSupabase(productId) {
    if (!supabase || !productId) {
        return [];
    }
    
    try {
        console.log('📥 Cargando comentarios desde Supabase para producto:', productId);
        const { data: comments, error } = await supabase
            .from('comentarios')
            .select('*')
            .eq('producto_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('✅ Comentarios cargados desde Supabase:', comments.length);
        
        // Transformar datos de Supabase al formato esperado
        const transformedComments = comments.map(comment => ({
            author: comment.autor,
            rating: comment.rating,
            text: comment.comentario,
            date: comment.created_at
        }));
        
        return transformedComments;
    } catch (error) {
        console.error('❌ Error al cargar comentarios:', error);
        return [];
    }
}

// Guardar comentario en Supabase
async function saveCommentToSupabase(productId, comment) {
    if (!supabase || !productId) {
        alert('Error: No se puede guardar el comentario en este momento.');
        return false;
    }
    
    try {
        console.log('💾 Guardando comentario en Supabase');
        const { data, error } = await supabase
            .from('comentarios')
            .insert([{
                producto_id: productId,
                autor: comment.author,
                rating: comment.rating,
                comentario: comment.text
            }]);

        if (error) throw error;

        console.log('✅ Comentario guardado en Supabase');
        return true;
    } catch (error) {
        console.error('❌ Error al guardar comentario:', error);
        alert('Error al guardar el comentario. Por favor, inténtalo de nuevo.');
        return false;
    }
}

function sendWhatsAppMessage(productName, productPrice, productImage, quantity) {
    const phoneNumber = '5219811083628'; 
    
    // Crear el mensaje
    let message = `¡Hola! Me interesa consultar la disponibilidad de:\n\n`;
    message += `📦 *Producto:* ${productName}\n`;
    message += `💰 *Precio:* $${productPrice.toLocaleString('es-MX')} MXN\n`;
    message += `🔢 *Cantidad:* ${quantity} unidad${quantity > 1 ? 'es' : ''}\n\n`;
    message += `🖼️ *Imagen del producto:* ${productImage}\n\n`;
    message += `¿Está disponible para entrega? ¡Gracias!`;
    
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
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
        showProductNotFound();
        return;
    }
    
    document.title = `${product.name} - Bety's Shop`;
    document.getElementById('product-image').src = product.image;
    document.getElementById('product-image').alt = 'Imagen de ' + product.name;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-price').textContent = `$${product.price.toLocaleString('es-MX')} MXN`;
    
    const detailsEl = document.getElementById('product-details');
    detailsEl.textContent = product.details;
}

function showProductNotFound() {
    document.querySelector('main.container').innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <h1 style="color: #d32f2f; margin-bottom: 1rem;">Producto no encontrado</h1>
            <p style="color: #666; margin-bottom: 2rem;">El producto que buscas no está disponible o no existe.</p>
            <a href="productos.html" style="background: #000; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none;">
                Ver todos los productos
            </a>
        </div>
    `;
}

function showError(message) {
    document.querySelector('main.container').innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <p style="color: #d32f2f; font-size: 1.2rem; margin-bottom: 1rem;">${message}</p>
            <button onclick="location.reload()" style="background: #000; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
                Reintentar
            </button>
        </div>
    `;
}

// Variable global para almacenar la información del producto actual
let currentProduct = null;

// Event listeners
document.getElementById('add-to-cart-form').addEventListener('submit', e => {
    e.preventDefault();
    const qtyInput = document.getElementById('quantity-input');
    const quantity = parseInt(qtyInput.value, 10);
    
    if (isNaN(quantity) || quantity < 1) {
        alert('Por favor, ingresa una cantidad válida (1 o más).');
        return;
    }
    
    // Verificar que tenemos la información del producto
    if (!currentProduct) {
        alert('Error: No se pudo obtener la información del producto.');
        return;
    }
    
    // Enviar mensaje de WhatsApp
    sendWhatsAppMessage(
        currentProduct.name,
        currentProduct.price,
        currentProduct.image,
        quantity
    );
});

document.getElementById('comment-form').addEventListener('submit', async e => {
    e.preventDefault();
    const author = e.target['comment-author'].value.trim();
    const rating = parseInt(e.target['comment-rating'].value, 10);
    const text = e.target['comment-text'].value.trim();
    
    if (!author || !rating || !text) {
        alert('Por favor, completa todos los campos antes de enviar tu comentario.');
        return;
    }
    
    const newComment = {
        author, 
        rating, 
        text, 
        date: new Date().toISOString()
    };
    
    // Guardar en Supabase
    const saved = await saveCommentToSupabase(productId, newComment);
    if (saved) {
        // Recargar comentarios después de guardar
        const updatedComments = await loadCommentsFromSupabase(productId);
        renderComments(updatedComments);
        e.target.reset();
        alert('¡Comentario enviado exitosamente!');
    }
});

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM cargado, inicializando página de detalles');
    
    const productId = getQueryParam('id');
    if (!productId) {
        console.warn('⚠️ No se proporcionó ID de producto');
        showProductNotFound();
        return;
    }
    
    // Cargar producto
    const product = await loadProductFromSupabase(productId);
    if (product) {
        currentProduct = product; // Guardar referencia global
        renderProduct(product);
        
        // Cargar comentarios
        const comments = await loadCommentsFromSupabase(productId);
        renderComments(comments);
    }
});

// Variable global para usar en el form de comentarios
let productId = getQueryParam('id');

// Función global para debugging
window.reloadProduct = async () => {
    const productId = getQueryParam('id');
    const product = await loadProductFromSupabase(productId);
    if (product) {
        currentProduct = product;
        renderProduct(product);
        const comments = await loadCommentsFromSupabase(productId);
        renderComments(comments);
    }
};