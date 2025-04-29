
// Önbelleğe alma fonksiyonu - sayfa performansını artırır
function prefetchResources() {
    const resources = [
        'IMG_6762.jpg',
        'fotis-fotopoulos-DuHKoV44prg-unsplash.jpg',
        'markus-spiske-1LLh8k2_YFk-unsplash.jpg',
        'programming-background-with-person-working-with-codes-computer.jpg',
        'caspar-camille-rubin-89xuP-XmyrA-unsplash.jpg',
        '7076118.jpg',
        'caspar-camille-rubin-89xuP-XmyrA-unsplash.jpg',
        '7076118.jpg',
        'caspar-camille-rubin-89xuP-XmyrA-unsplash.jpg',
    ];
    
    if ('caches' in window) {
        caches.open('portfolio-assets').then(cache => {
            resources.forEach(url => {
                cache.add(url).catch(() => {
                    console.log('Önbelleğe alma hatası:', url);
                });
            });
        });
    }
}

// Sayfa içeriğinin önden yüklenmesi için
document.addEventListener("DOMContentLoaded", function() {
    // Önemli görselleri önden yükle
    const importantImages = [
        'IMG_6762.jpg',
        'fotis-fotopoulos-DuHKoV44prg-unsplash.jpg',
        'markus-spiske-1LLh8k2_YFk-unsplash.jpg',
        'programming-background-with-person-working-with-codes-computer.jpg',
        'caspar-camille-rubin-89xuP-XmyrA-unsplash.jpg',
        '7076118.jpg',
        'caspar-camille-rubin-89xuP-XmyrA-unsplash.jpg',
    ];
    
    // Görüntüleri önbelleğe alarak yükleme performansını artırır
    importantImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // İleri düzey önbelleğe alma
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            prefetchResources();
        });
    } else {
        setTimeout(prefetchResources, 1000);
    }
});

// Sayfa Yükleme Animasyonu - daha hızlı yükleme süresi
window.addEventListener('load', function() {
    setTimeout(function() {
        document.querySelector('.loader-container').classList.add('loaded');
        
        // Hakkımda sayfası aktif ise, skill çubuklarını animasyonla göster
        if (document.querySelector('.about.active')) {
            animateSkillBars();
        }
        
        // Sayfanın tamamen yüklenmesinden sonra kullanılmayan kaynakları temizle
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Belleği temizle
                if (window.gc) window.gc();
            });
        }
    }, 600); // Yükleme süresini 1000ms'den 600ms'ye düşürdük
});

//Opening or closing side bar
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

sidebarBtn.addEventListener("click", function() {elementToggleFunc(sidebar); })

// Enabling Page Navigation 
const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

for(let i = 0; i < navigationLinks.length; i++) {
navigationLinks[i].addEventListener('click', function() {
// Menü öğesinin içeriğini küçük harfe çevir, Türkçe karakterleri koruyarak
const clickedPage = this.innerHTML.toLowerCase();

for(let j = 0; j < pages.length; j++) {
    // Data-page özniteliğini al
    const pageDataAttr = pages[j].dataset.page;
    
    // Menü öğesine ait sayfayı bul
    if(clickedPage === pageDataAttr) {
        pages[j].classList.add('active');
        navigationLinks[i].classList.add('active');
        window.scrollTo(0, 0);
        
        // Hakkımda sayfasına geçildiğinde animasyonları başlat
        if (pageDataAttr === 'hakkımda') {
            setTimeout(function() {
                animateSkillBars();
            }, 200); // 300'den 200'e düşürdük
        }
        
        // Deneyimler sayfasına geçildiğinde zaman çizelgesi animasyonunu başlat
        if (pageDataAttr === 'deneyimler') {
            setTimeout(function() {
                animateTimeline();
            }, 200); // 300'den 200'e düşürdük
        }
    } else {
        pages[j].classList.remove('active');
        navigationLinks[j].classList.remove('active');
    }
}
});
}

// Yetenek çubuklarını animasyonla göster
function animateSkillBars() {
const skillBars = document.querySelectorAll('.skills-progress-fill');

skillBars.forEach((bar, index) => {
// Önce genişliği sıfırla
bar.style.width = '0';

// Sonra doğru genişliğe animasyonla getir
setTimeout(() => {
    const width = bar.style.width || bar.getAttribute('style')?.match(/width:\s*(\d+)%/)?.[1] + '%' || '0%';
    bar.style.width = width;
}, 100 + (index * 200)); // Animasyon süresini 300'den 200'e düşürdük
});
}

// Zaman çizelgesi animasyonu
function animateTimeline() {
const timelineItems = document.querySelectorAll('.timeline-item');
const educationItems = document.querySelectorAll('.education-item');

// Timeline öğelerini sırayla görünür yap
timelineItems.forEach((item, index) => {
setTimeout(() => {
    item.querySelector('.timeline-content').style.opacity = '1';
}, 150 * index); // 200'den 150'ye düşürdük
});

// Eğitim öğelerini sırayla görünür yap
educationItems.forEach((item, index) => {
setTimeout(() => {
    item.style.opacity = '1';
}, 200 * index); // 300'den 200'e düşürdük
});
}
