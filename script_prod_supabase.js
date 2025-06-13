// Verificar que Supabase se cargó correctamente
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase no se cargó correctamente');
    // Mostrar productos de ejemplo si no hay conexión
    showFallbackProducts();
} else {
    console.log('✅ Supabase cargado correctamente');
}

// Configuración de Supabase (misma que en admin)
const SUPABASE_URL = 'https://pjnpakaiixluyyiklwtw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqbnBha2FpaXhsdXl5aWtsd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODk4NzQsImV4cCI6MjA2NTM2NTg3NH0.cBchO1Z_rqTbhM8Ni82WaH9RDZKtiV5yJOgrAwIrlJE';

// Inicializar cliente de Supabase
let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Cliente de Supabase inicializado para productos');
} catch (error) {
    console.error('❌ Error al inicializar Supabase:', error);
    showFallbackProducts();
}

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

// Cargar productos desde Supabase
async function loadProductsFromSupabase() {
    if (!supabase) {
        console.warn('⚠️ Supabase no disponible, mostrando productos de ejemplo');
        showFallbackProducts();
        return;
    }
    
    try {
        console.log('📥 Cargando productos desde Supabase...');
        const { data: products, error } = await supabase
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('✅ Productos cargados desde Supabase:', products.length);
        
        // Transformar datos de Supabase al formato esperado por renderProducts
        const transformedProducts = products.map(product => ({
            id: product.id,
            name: product.nombre,
            description: product.descripcion,
            price: product.precio,
            image: product.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen',
            rating: product.rating || 5, // Rating por defecto si no existe
            details: product.detalles // Para usar en la página de detalle
        }));
        
        renderProducts(transformedProducts);
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        showError('Error al cargar los productos. Por favor, recarga la página.');
    }
}

// Productos de ejemplo para cuando no hay conexión a Supabase
function showFallbackProducts() {
    console.log('📦 Mostrando productos de ejemplo');
    const fallbackProducts = [
        {
            id: 'ejemplo-1',
            name: 'Bolsa Elegante Negro',
            description: 'Bolsa elegante de cuero sintético en color negro, perfecta para ocasiones especiales.',
            price: 450,
            image: 'https://via.placeholder.com/400x300?text=Bolsa+Elegante',
            rating: 5
        },
        {
            id: 'ejemplo-2', 
            name: 'Cartera Casual Café',
            description: 'Cartera casual en tono café, ideal para el día a día con múltiples compartimentos.',
            price: 320,
            image: 'https://via.placeholder.com/400x300?text=Cartera+Casual',
            rating: 4
        },
        {
            id: 'ejemplo-3',
            name: 'Bolso Deportivo Rosa',
            description: 'Bolso deportivo en color rosa, perfecto para actividades al aire libre.',
            price: 280,
            image: 'https://via.placeholder.com/400x300?text=Bolso+Deportivo',
            rating: 5
        }
    ];
    renderProducts(fallbackProducts);
}

function renderProducts(products) {
    if (!products.length) {
        productGrid.innerHTML = '<p style="color:#999; grid-column: 1 / -1; text-align:center; font-size: 1.2rem; padding: 3rem;">No hay productos disponibles en este momento.</p>';
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
                <img class="product-image" src="${image}" alt="Imagen de ${name}" loading="lazy" />
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

function showError(message) {
    productGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <p style="color: #d32f2f; font-size: 1.2rem; margin-bottom: 1rem;">${message}</p>
            <button onclick="location.reload()" style="background: #000; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
                Reintentar
            </button>
        </div>
    `;
}

// Cargar productos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando carga de productos');
    loadProductsFromSupabase();
});

// Función global para recargar productos (útil para debugging)
window.reloadProducts = loadProductsFromSupabase;