// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 监听核心技术图片的滚动
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up observers');
    
    const options = {
        root: null,
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0]
    };

    const observer = new IntersectionObserver((entries) => {
        console.log('Intersection observed:', entries);
        entries.forEach(entry => {
            requestAnimationFrame(() => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        });
    }, options);

    const images = document.querySelectorAll('.core-tech-image');
    console.log('Found images:', images.length);
    
    images.forEach(img => {
        observer.observe(img);
    });
});

// 处理联系表单提交
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    // 创建反馈元素
    const feedback = document.createElement('div');
    feedback.className = 'form-feedback';
    document.body.appendChild(feedback);

    // 显示反馈信息的函数
    const showFeedback = (message, type) => {
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    };

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    access_key: this.querySelector('[name="access_key"]').value,
                    name: this.querySelector('[name="name"]').value,
                    email: this.querySelector('[name="email"]').value,
                    phone: this.querySelector('[name="phone"]').value,
                    message: this.querySelector('[name="message"]').value,
                    botcheck: this.querySelector('[name="botcheck"]').value
                })
            });

            // 只要请求完成就认为是成功的
            submitBtn.textContent = '提交成功！';
            this.reset();
            showFeedback('提交成功！我们会尽快与您联系', 'success');
            setTimeout(() => {
                submitBtn.textContent = '提交';
                submitBtn.disabled = false;
            }, 3000);
        } catch (error) {
            submitBtn.textContent = '提交失败，请重试';
            showFeedback('提交失败，请稍后重试', 'error');
            setTimeout(() => {
                submitBtn.textContent = '提交';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
} 

// 语言切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取当前语言
    let currentLang = localStorage.getItem('language') || 'zh';
    
    // 初始化页面语言
    updateLanguage(currentLang);
    
    // 为所有语言切换按钮添加事件监听
    const langSwitchers = document.querySelectorAll('.lang-switch');
    langSwitchers.forEach(switcher => {
        // 更新按钮文本
        updateSwitcherText(switcher, currentLang);
        
        switcher.addEventListener('click', function(e) {
            e.preventDefault();
            // 切换语言
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            localStorage.setItem('language', currentLang);
            
            // 更新所有语言切换按钮的文本
            langSwitchers.forEach(s => updateSwitcherText(s, currentLang));
            
            // 更新页面文本
            updateLanguage(currentLang);
        });
    });
});

// 更新语言切换按钮文本
function updateSwitcherText(switcher, lang) {
    switcher.textContent = lang === 'zh' ? 'CN/EN' : 'EN/CN';
    switcher.setAttribute('data-lang', lang);
}

// 更新页面语言
function updateLanguage(lang) {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key, lang);
        if (translation) {
            element.textContent = translation;
        }
    });

    // 更新所有带有 data-i18n-placeholder 属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getTranslation(key, lang);
        if (translation) {
            element.placeholder = translation;
        }
    });

    // 更新页面语言标记
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}

// 获取翻译文本
function getTranslation(key, lang) {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            console.warn(`Translation not found for key: ${key} in language: ${lang}`);
            return null;
        }
    }
    
    return value;
} 