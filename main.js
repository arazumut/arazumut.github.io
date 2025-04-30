// Performans İyileştirmeleri - Değişkenleri önbelleğe alma
const DOM = {
    sidebar: document.querySelector("[data-sidebar]"),
    sidebarBtn: document.querySelector("[data-sidebar-btn]"),
    navigationLinks: document.querySelectorAll('[data-nav-link]'),
    pages: document.querySelectorAll('[data-page]'),
    socialLinks: document.querySelectorAll('.social-link'),
    projectCards: document.querySelectorAll('.project-card'),
    loaderContainer: document.querySelector('.loader-container'),
    activePage: document.querySelector('[data-page].active')
};

// Sayfa yükleme ve önbelleğe alma stratejisi
function prefetchResources() {
    // Kritik kaynakların önden yüklenmesi
    const criticalResources = [
        'IMG_6762.jpg',
        'style.css',
        'main.js'
    ];
    
    // Daha az kritik olan kaynaklar için gecikmeli yükleme
    const nonCriticalResources = [
        'fotis-fotopoulos-DuHKoV44prg-unsplash.jpg',
        'markus-spiske-1LLh8k2_YFk-unsplash.jpg',
        'programming-background-with-person-working-with-codes-computer.jpg',
        'caspar-camille-rubin-89xuP-XmyrA-unsplash.jpg',
        '7076118.jpg'
    ];
    
    if ('caches' in window) {
        caches.open('portfolio-critical').then(cache => {
            criticalResources.forEach(url => {
                cache.add(url).catch(() => {
                    console.log('Kritik kaynak önbelleğe alma hatası:', url);
                });
            });
        });
        
        // İkincil kaynakları gecikmeli olarak yükle
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                caches.open('portfolio-secondary').then(cache => {
                    nonCriticalResources.forEach(url => {
                        cache.add(url).catch(() => {
                            console.log('İkincil kaynak önbelleğe alma hatası:', url);
                        });
                    });
                });
            }, { timeout: 2000 });
        } else {
            setTimeout(() => {
                caches.open('portfolio-secondary').then(cache => {
                    nonCriticalResources.forEach(url => cache.add(url).catch(() => {}));
                });
            }, 1000);
        }
    }
}

// Performans optimizasyonu için debounce fonksiyonu
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Lazy Load fonksiyonu - görseller için
function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Yüklemeyi tetikle
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // IntersectionObserver desteklenmiyor, fallback
        lazyImages.forEach(img => {
            img.src = img.src; // Hemen yükle
        });
    }
}

// İlk görünüm için kritik CSS'i yükle
document.addEventListener("DOMContentLoaded", function() {
    // DOM içeriği yüklendiğinde kritik olmayan kaynak yüklemesini geciktir
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            prefetchResources();
        }, { timeout: 1000 });
    } else {
        setTimeout(prefetchResources, 1000);
    }
    
    // Animasyonlu başlık efekti
    animateHeadings();
    
    // Performans için event delegation kullan
    setupEventDelegation();
});

// Sayfa tam yüklendikten sonra
window.addEventListener('load', function() {
    // Loader'ı kaldır ve içeriği göster
    setTimeout(function() {
        if (DOM.loaderContainer) {
            DOM.loaderContainer.classList.add('loaded');
        }
        
        // Sadece görünür alandaki içerik için animasyonları başlat
        initVisibleAnimations();
        
        // Lazyload görüntüleri başlat
        lazyLoadImages();
        
        // Gereksiz kaynakları temizle
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                if (window.gc) window.gc();
            });
        }
    }, 600);
    
    // Performans için animasyonları optimize et
    optimizeAnimations();
});

// Event delegation kullanarak performansı artır
function setupEventDelegation() {
    // Sidebar toggle için tek olay dinleyici
    if (DOM.sidebarBtn) {
        DOM.sidebarBtn.addEventListener("click", function() {
            DOM.sidebar.classList.toggle("active");
        });
    }
    
    // Sidebar hover efekti
    if (DOM.sidebar) {
        DOM.sidebar.addEventListener('mouseenter', () => {
            if (!DOM.sidebar.classList.contains('active')) {
                DOM.sidebar.classList.add('sidebar-hover');
            }
        });
        
        DOM.sidebar.addEventListener('mouseleave', () => {
            DOM.sidebar.classList.remove('sidebar-hover');
        });
    }
    
    // Sayfa navigasyonu için tek bir event listener
    document.querySelector('.navbar-list')?.addEventListener('click', function(e) {
        const navLink = e.target.closest('[data-nav-link]');
        if (!navLink) return;
        
        handlePageNavigation(navLink);
    });
    
    // Sosyal medya ikonları için tek bir event listener
    document.querySelector('.social-list')?.addEventListener('mouseenter', function(e) {
        if (e.target.closest('.social-link')) {
            e.target.closest('.social-link').classList.add('social-pulse');
        }
    }, true);
    
    document.querySelector('.social-list')?.addEventListener('mouseleave', function(e) {
        if (e.target.closest('.social-link')) {
            e.target.closest('.social-link').classList.remove('social-pulse');
        }
    }, true);
    
    // Proje kartları için performans optimizasyonlu olay dinleyicileri
    const projectsContainer = document.querySelector('.projects-list');
    if (projectsContainer) {
        projectsContainer.addEventListener('mousemove', function(e) {
            const card = e.target.closest('.project-card');
            if (card) {
                handleCardMove(e, card);
            }
        });
        
        projectsContainer.addEventListener('mouseleave', function(e) {
            const card = e.target.closest('.project-card');
            if (card) {
                handleCardLeave(card);
            }
        });
    }
}

// Sayfa geçiş işlemlerini yönet
function handlePageNavigation(clickedLink) {
    // Mevcut aktif sayfayı bul
    const currentPage = document.querySelector('[data-page].active');
    if (!currentPage) return;
    
    // Geçiş animasyonunu başlat
    currentPage.classList.add('page-exit');
    
    // Temizleme ve yeni sayfayı gösterme zamanlaması
    setTimeout(() => {
        currentPage.classList.remove('page-exit');
        currentPage.classList.remove('active');
        
        const clickedPageName = clickedLink.textContent.toLowerCase();
        const pages = DOM.pages;
        const navLinks = DOM.navigationLinks;
        
        for (let j = 0; j < pages.length; j++) {
            const pageDataAttr = pages[j].dataset.page;
            
            if (clickedPageName === pageDataAttr) {
                pages[j].classList.add('page-enter');
                pages[j].classList.add('active');
                navLinks[j].classList.add('active');
                window.scrollTo(0, 0);
                
                setTimeout(() => {
                    pages[j].classList.remove('page-enter');
                    
                    // Sayfaya özgü animasyonları başlat - performans için lazy
                    if (pageDataAttr === 'hakkımda') {
                        requestAnimationFrame(() => {
                            animateSkillBars();
                            animateServiceItems();
                        });
                    } else if (pageDataAttr === 'deneyimler') {
                        requestAnimationFrame(() => {
                            animateTimeline();
                        });
                    } else if (pageDataAttr === 'projeler') {
                        requestAnimationFrame(() => {
                            animateProjects();
                        });
                    }
                    
                    // Başlık animasyonunu göster
                    showHeadingAnimation(pages[j]);
                }, 500);
            } else {
                pages[j].classList.remove('active');
                navLinks[j].classList.remove('active');
            }
        }
    }, 400);
}

// Beceri çubuklarını sadece görünür olduklarında animasyonla göster
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skills-progress-fill');
    if (!skillBars.length) return;

    // IntersectionObserver kullanarak performansı artır
    if ('IntersectionObserver' in window) {
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    // Önce genişliği sıfırla
                    bar.style.width = '0';
                    
                    // requestAnimationFrame ile animasyonu optimize et
                    requestAnimationFrame(() => {
                        // Hedef genişliğe animasyonla getir
                        setTimeout(() => {
                            const targetWidth = bar.dataset.width || bar.getAttribute('style')?.match(/width:\s*(\d+)%/)?.[1] + '%' || '0%';
                            bar.style.width = targetWidth;
                        }, 50);
                    });
                    
                    skillObserver.unobserve(bar);
                }
            });
        }, {threshold: 0.2});
        
        skillBars.forEach(bar => {
            skillObserver.observe(bar);
        });
    } else {
        // Fallback - observer desteklenmiyorsa
        skillBars.forEach((bar, index) => {
            bar.style.width = '0';
            
            setTimeout(() => {
                const targetWidth = bar.dataset.width || bar.getAttribute('style')?.match(/width:\s*(\d+)%/)?.[1] + '%' || '0%';
                bar.style.width = targetWidth;
            }, 100 + (index * 200));
        });
    }
}

// Servis öğelerini optimizasyonlu animasyonla göster
function animateServiceItems() {
    const serviceItems = document.querySelectorAll('.service-item');
    if (!serviceItems.length) return;
    
    if ('IntersectionObserver' in window) {
        const serviceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-service');
                    serviceObserver.unobserve(entry.target);
                }
            });
        }, {threshold: 0.1});
        
        serviceItems.forEach(item => {
            serviceObserver.observe(item);
        });
    } else {
        // Fallback
        serviceItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate-service');
            }, 100 * index);
        });
    }
}

// Zaman çizelgesi animasyonu - performans optimizasyonlu
function animateTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const educationItems = document.querySelectorAll('.education-item');
    
    if ('IntersectionObserver' in window) {
        // Timeline observer
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const content = entry.target.querySelector('.timeline-content');
                    if (content) {
                        content.style.opacity = '1';
                        timelineObserver.unobserve(entry.target);
                    }
                }
            });
        }, {threshold: 0.15});
        
        // Education observer
        const educationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    educationObserver.unobserve(entry.target);
                }
            });
        }, {threshold: 0.15});
        
        // Observe elements
        timelineItems.forEach(item => timelineObserver.observe(item));
        educationItems.forEach(item => educationObserver.observe(item));
    } else {
        // Fallback
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                const content = item.querySelector('.timeline-content');
                if (content) content.style.opacity = '1';
            }, 150 * index);
        });
        
        educationItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
            }, 200 * index);
        });
    }
}

// Projeleri optimize edilmiş animasyonla göster
function animateProjects() {
    const projectItems = document.querySelectorAll('.project-card');
    
    if ('IntersectionObserver' in window) {
        const projectObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const project = entry.target;
                    project.style.opacity = '0';
                    project.style.transform = 'translateY(30px)';
                    
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            project.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                            project.style.opacity = '1';
                            project.style.transform = 'translateY(0)';
                        }, 50);
                    });
                    
                    projectObserver.unobserve(project);
                }
            });
        }, {threshold: 0.1});
        
        projectItems.forEach(item => {
            projectObserver.observe(item);
        });
    } else {
        // Fallback
        projectItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
}

// 3D Kart Efekti - optimize edilmiş
function handleCardMove(e, card) {
    const cardRect = card.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const cardHeight = cardRect.height;
    
    // Kartın merkezinden imleç pozisyonuna göre hareket hesaplama
    const cardCenterX = cardRect.left + cardWidth / 2;
    const cardCenterY = cardRect.top + cardHeight / 2;
    const mouseX = e.clientX - cardCenterX;
    const mouseY = e.clientY - cardCenterY;
    
    // -10 ile 10 derece arasında döndürme
    const rotateY = 10 * (mouseX / (cardWidth / 2));
    const rotateX = -10 * (mouseY / (cardHeight / 2));
    
    // requestAnimationFrame ile daha verimli render
    requestAnimationFrame(() => {
        // CSS transform uygulama
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'transform 0.1s ease';
        
        // Kart üzerindeki gölgeyi dinamik olarak güncelleme
        const shadowX = 5 * (mouseX / (cardWidth / 2));
        const shadowY = 5 * (mouseY / (cardHeight / 2));
        card.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(0, 0, 0, 0.4)`;
    });
}

function handleCardLeave(card) {
    // Kart normal haline döndüğünde
    requestAnimationFrame(() => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
        card.style.boxShadow = 'var(--shadow2)';
    });
}

// Animasyonlu başlık efekti - daha hafif versiyonu
function animateHeadings() {
    const headings = document.querySelectorAll('.article-title');
    
    headings.forEach(heading => {
        // Başlık içerik kopyasını al ve temizle
        const text = heading.textContent;
        heading.textContent = '';
        
        // 10ms chunk'larda asenkron işlem yaparak tarayıcı blokajını önle
        const addLettersAsync = (index = 0) => {
            // Her seferde 3 harf ekleyerek performansı artır
            const chunkSize = 3;
            const endIndex = Math.min(index + chunkSize, text.length);
            
            for (let i = index; i < endIndex; i++) {
                const letterSpan = document.createElement('span');
                letterSpan.textContent = text[i];
                letterSpan.style.display = 'inline-block';
                letterSpan.style.opacity = '0';
                letterSpan.style.transform = 'translateY(20px)';
                letterSpan.style.transition = `opacity 0.5s ease, transform 0.5s ease ${i * 0.03}s`;
                heading.appendChild(letterSpan);
            }
            
            if (endIndex < text.length) {
                setTimeout(() => addLettersAsync(endIndex), 10);
            }
        };
        
        // Başlat
        addLettersAsync();
    });
}

// Görünür sayfadaki başlık animasyonunu başlat
function showHeadingAnimation(page) {
    const heading = page.querySelector('.article-title');
    if (!heading) return;
    
    const letters = heading.querySelectorAll('span');
    if (!letters.length) return;
    
    // Animasyon yükünü dağıtmak için grup halinde işleme
    const processLettersInBatches = (batchSize = 5, delay = 5) => {
        for (let i = 0; i < letters.length; i += batchSize) {
            setTimeout(() => {
                const end = Math.min(i + batchSize, letters.length);
                for (let j = i; j < end; j++) {
                    letters[j].style.opacity = '1';
                    letters[j].style.transform = 'translateY(0)';
                }
            }, delay * (i / batchSize));
        }
    };
    
    processLettersInBatches();
}

// Sadece görünür alandaki içerik için animasyonları başlat
function initVisibleAnimations() {
    // Aktif sayfayı kontrol et
    const activePage = document.querySelector('[data-page].active');
    if (activePage) {
        const pageId = activePage.dataset.page;
        
        // Sayfa tipine göre uygun animasyonları başlat
        switch(pageId) {
            case 'hakkımda':
                animateSkillBars();
                animateServiceItems();
                break;
            case 'projeler':
                animateProjects();
                break;
            case 'deneyimler':
                animateTimeline();
                break;
        }
        
        // Başlık animasyonunu göster
        showHeadingAnimation(activePage);
    }
}

// Animasyonları optimize et - gereksiz animasyonları devre dışı bırak
function optimizeAnimations() {
    // Düşük performanslı cihazları algıla
    const isLowEndDevice = window.navigator.hardwareConcurrency < 4 || 
                          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Partikül efektlerini sadece güçlü cihazlarda çalıştır
    if (!isLowEndDevice && window.innerWidth >= 768) {
        // Dekoratif animasyonları gecikmeli başlat
        setTimeout(() => {
            createParticleCanvas();
            createCursorGlowEffect();
        }, 1000);
    }
    
    // Düşük performanslı cihazlar için animasyonları sınırla
    if (isLowEndDevice) {
        // CSS değişkeni ekleyerek animasyonları devre dışı bırak
        document.documentElement.style.setProperty('--reduce-motion', 'reduce');
        
        // Gereksiz stil kurallarını devre dışı bırak
        const style = document.createElement('style');
        style.textContent = `
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Minimal partikül efekti - optimize edilmiş
function createParticleCanvas() {
    // Mobil cihazlarda devre dışı bırak veya düşük ayar kullan
    const particleCount = window.innerWidth < 768 ? 10 : 20;
    
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.3';
    document.body.prepend(canvas);
    
    initParticlesMinimal(canvas, particleCount);
}

// Minimal partikül sistemi - düşük kaynak kullanımı
function initParticlesMinimal(canvas, count) {
    const ctx = canvas.getContext('2d');
    
    // Canvas boyutlandırma - performans için throttle edilmiş
    const resizeThrottled = debounce(function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, 100);
    
    resizeThrottled();
    window.addEventListener('resize', resizeThrottled);
    
    // Basit renk paleti
    const colors = ['hsla(45, 100%, 72%, 0.2)', 'hsla(330, 100%, 70%, 0.2)'];
    
    // Optimize edilmiş partikül dizisi
    const particles = Array.from({length: count}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.3 + 0.1,
        directionX: Math.random() * 2 - 1,
        directionY: Math.random() * 2 - 1
    }));
    
    // Animasyon karesini sınırlı FPS ile çalıştır
    let lastTime = 0;
    const fps = 30; // 30 FPS yeterli
    const fpsInterval = 1000 / fps;
    
    function animate(timestamp) {
        // FPS sınırlama
        if (timestamp - lastTime < fpsInterval) {
            requestAnimationFrame(animate);
            return;
        }
        lastTime = timestamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            particle.x += particle.directionX * particle.speed;
            particle.y += particle.directionY * particle.speed;
            
            if (particle.x < 0 || particle.x > canvas.width) {
                particle.directionX = -particle.directionX;
            }
            
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.directionY = -particle.directionY;
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
}

// Basitleştirilmiş imleç efekti
function createCursorGlowEffect() {
    // Sadece masaüstü cihazlarında çalıştır
    if (window.matchMedia('(max-width: 768px)').matches) {
        return;
    }
    
    const cursorGlow = document.createElement('div');
    cursorGlow.classList.add('cursor-glow');
    document.body.appendChild(cursorGlow);
    
    // Performans optimizasyonu için throttled fare takibi
    const updateCursorPosition = debounce((e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    }, 5);
    
    document.addEventListener('mousemove', updateCursorPosition);
    
    // Event delegation - tek bir olay dinleyicisiyle tüm etkileşimli öğeleri ele al
    document.addEventListener('mouseenter', function(e) {
        const element = e.target.closest('.project-card, .service-item, .social-link, .navbar-link');
        if (element) {
            cursorGlow.classList.add('cursor-active');
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        const element = e.target.closest('.project-card, .service-item, .social-link, .navbar-link');
        if (element) {
            cursorGlow.classList.remove('cursor-active');
        }
    }, true);
}
