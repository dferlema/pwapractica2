// Clase para manejar el carrusel
class ImageCarousel {
    constructor() {
        // Elementos del DOM
        this.carouselInner = document.getElementById('carouselInner');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.indicators = document.querySelectorAll('.indicator');
        this.carouselItems = document.querySelectorAll('.carousel-item');
        
        // Variables de estado
        this.currentSlide = 0;
        this.totalSlides = this.carouselItems.length;
        this.isPlaying = true;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 4000; // 4 segundos
        
        // Inicializar el carrusel
        this.init();
    }
    
    // Método de inicialización
    init() {
        this.setupEventListeners();
        this.startAutoPlay();
        this.updateCarousel();
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Botones de navegación
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Control de reproducción
        this.playPauseBtn.addEventListener('click', () => this.toggleAutoPlay());
        this.resetBtn.addEventListener('click', () => this.resetCarousel());
        
        // Indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch/Swipe para dispositivos móviles
        this.setupTouchEvents();
        
        // Pausar auto-play cuando el mouse está sobre el carrusel
        this.carouselInner.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.carouselInner.addEventListener('mouseleave', () => {
            if (this.isPlaying) this.startAutoPlay();
        });
    }
    
    // Configurar eventos táctiles para dispositivos móviles
    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        const minSwipeDistance = 50;
        
        this.carouselInner.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.carouselInner.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const swipeDistance = Math.abs(endX - startX);
            
            if (swipeDistance > minSwipeDistance) {
                if (endX < startX) {
                    this.nextSlide(); // Swipe izquierda - siguiente
                } else {
                    this.prevSlide(); // Swipe derecha - anterior
                }
            }
        });
        
        // Prevenir el scroll durante el swipe
        this.carouselInner.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    // Navegación con teclado
    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case ' ':
                e.preventDefault();
                this.toggleAutoPlay();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;
        }
    }
    
    // Ir a la siguiente diapositiva
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }
    
    // Ir a la diapositiva anterior
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
    }
    
    // Ir a una diapositiva específica
    goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < this.totalSlides) {
            this.currentSlide = slideIndex;
            this.updateCarousel();
        }
    }
    
    // Actualizar la visualización del carrusel
    updateCarousel() {
        // Actualizar las clases de los elementos del carrusel
        this.carouselItems.forEach((item, index) => {
            item.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentSlide) {
                item.classList.add('active');
            } else if (index === (this.currentSlide - 1 + this.totalSlides) % this.totalSlides) {
                item.classList.add('prev');
            } else if (index === (this.currentSlide + 1) % this.totalSlides) {
                item.classList.add('next');
            }
        });
        
        // Actualizar los indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
        
        // Actualizar atributos de accesibilidad
        this.updateAccessibility();
    }
    
    // Actualizar atributos de accesibilidad
    updateAccessibility() {
        this.carouselItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                img.setAttribute('aria-hidden', index !== this.currentSlide);
            }
        });
        
        // Actualizar información del slide actual
        const currentInfo = `Imagen ${this.currentSlide + 1} de ${this.totalSlides}`;
        this.carouselInner.setAttribute('aria-label', currentInfo);
    }
    
    // Iniciar reproducción automática
    startAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }
    
    // Pausar reproducción automática
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    // Alternar reproducción automática
    toggleAutoPlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.startAutoPlay();
            this.playPauseBtn.textContent = 'Pausar';
            this.playPauseBtn.setAttribute('aria-label', 'Pausar reproducción automática');
        } else {
            this.pauseAutoPlay();
            this.playPauseBtn.textContent = 'Reproducir';
            this.playPauseBtn.setAttribute('aria-label', 'Iniciar reproducción automática');
        }
    }
    
    // Reiniciar carrusel
    resetCarousel() {
        this.goToSlide(0);
        if (!this.isPlaying) {
            this.toggleAutoPlay();
        }
    }
    
    // Destruir el carrusel (limpiar eventos y intervalos)
    destroy() {
        this.pauseAutoPlay();
        // Aquí podrías remover event listeners si fuera necesario
    }
}

// Utilidades adicionales
class CarouselUtils {
    // Precargar imágenes para mejor rendimiento
    static preloadImages(imageUrls) {
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }
    
    // Obtener URLs de las imágenes del carrusel
    static getImageUrls() {
        const images = document.querySelectorAll('.carousel-item img');
        return Array.from(images).map(img => img.src);
    }
    
    // Añadir indicadores de carga
    static addLoadingIndicator() {
        const carousel = document.querySelector('.carousel');
        const loader = document.createElement('div');
        loader.className = 'carousel-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        carousel.appendChild(loader);
        
        return loader;
    }
    
    // Remover indicador de carga
    static removeLoadingIndicator(loader) {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar indicador de carga
    const loader = CarouselUtils.addLoadingIndicator();
    
    // Precargar imágenes
    const imageUrls = CarouselUtils.getImageUrls();
    CarouselUtils.preloadImages(imageUrls);
    
    // Crear instancia del carrusel
    const carousel = new ImageCarousel();
    
    // Remover indicador de carga después de un breve delay
    setTimeout(() => {
        CarouselUtils.removeLoadingIndicator(loader);
    }, 1000);
    
    // Hacer el carrusel globalmente accesible para debugging
    window.carousel = carousel;
    
    // Manejar errores de carga de imágenes
    const images = document.querySelectorAll('.carousel-item img');
    images.forEach((img, index) => {
        img.addEventListener('error', () => {
            console.warn(`Error al cargar la imagen ${index + 1}`);
            // Podrías reemplazar con una imagen por defecto
            img.src = `https://via.placeholder.com/800x400/cccccc/666666?text=Imagen+${index + 1}`;
        });
    });
    
    // Información de ayuda en consola
    console.log('🎠 Carrusel de Imágenes Inicializado');
    console.log('⌨️  Controles de teclado:');
    console.log('   ← → : Navegar entre imágenes');
    console.log('   Espacio: Pausar/Reproducir');
    console.log('   Home/End: Ir al inicio/final');
    console.log('📱 En móviles: Desliza para navegar');
});

// Manejar visibilidad de la página para pausar/reanudar
document.addEventListener('visibilitychange', function() {
    if (window.carousel) {
        if (document.hidden) {
            window.carousel.pauseAutoPlay();
        } else if (window.carousel.isPlaying) {
            window.carousel.startAutoPlay();
        }
    }
});