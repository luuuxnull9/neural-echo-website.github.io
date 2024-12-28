// 初始化 Supabase 客户端
const supabaseUrl = 'https://tsemmtxfaehjaldwaxiy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZW1tdHhmYWVoamFsZHdheGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNjg5NjMsImV4cCI6MjA1MDg0NDk2M30.MAG1KV5bfotfZs3jDBan2AQfuUaI5EsFvW_M80l1Ghk'
const { createClient } = supabase
const supabaseClient = createClient(supabaseUrl, supabaseKey)

// 配置
const NEWS_PER_PAGE = 6; // 每页显示的新闻数量
let currentPage = 1;
let currentCategory = 'all';

// 新闻项目模板
function createNewsItem(news) {
    // 确保图片URL存在，否则使用默认图片
    const imageUrl = news.image_url || 'images/default-news.jpg';
    
    return `
        <div class="news-item">
            <div class="news-image" style="background-image: url('${imageUrl}')"></div>
            <div class="news-content">
                <h3><a href="news-detail.html?id=${news.id}" class="news-title-link">${news.title}</a></h3>
                <p>${news.summary}</p>
                <div class="news-meta">
                    <div class="meta-left">
                        <span class="date">${formatDate(news.created_at)}</span>
                        <span class="tag">${news.category}</span>
                    </div>
                    <a href="news-detail.html?id=${news.id}" class="view-more">阅读更多</a>
                </div>
            </div>
        </div>
    `;
}

// 格式化日期
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 显示加载状态
function showLoading() {
    const newsGrid = document.querySelector('.news-grid');
    newsGrid.innerHTML = '<div class="loading">加载中...</div>';
}

// 显示错误信息
function showError(message) {
    const newsGrid = document.querySelector('.news-grid');
    newsGrid.innerHTML = `<div class="error">${message}</div>`;
}

// 加载新闻数据
async function loadNews(category = 'all', page = 1) {
    showLoading();
    
    try {
        // 计算分页范围
        const from = (page - 1) * NEWS_PER_PAGE;
        const to = from + NEWS_PER_PAGE - 1;

        let query = supabaseClient
            .from('news')
            .select(`
                *
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        const newsGrid = document.querySelector('.news-grid');
        
        if (!data || data.length === 0) {
            newsGrid.innerHTML = '<div class="no-results">暂无相关新闻</div>';
            return;
        }

        newsGrid.innerHTML = data.map(news => createNewsItem(news)).join('');
        
        // 更新分页
        updatePagination(count, page);

    } catch (error) {
        console.error('加载新闻失败:', error);
        showError('加载新闻失败，请稍后重试'+error.message);
    }
}

// 更新分页控件
function updatePagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE);
    const paginationContainer = document.querySelector('.pagination');
    
    if (!paginationContainer) return;
    
    let paginationHTML = '';
    
    if (totalPages > 1) {
        paginationHTML = `
            <button class="page-btn prev" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
            <span class="page-info">${currentPage} / ${totalPages}</span>
            <button class="page-btn next" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
        `;
    }
    
    paginationContainer.innerHTML = paginationHTML;
    
    // 添加分页事件监听
    setupPaginationListeners(totalPages);
}

// 设置分页按钮事件
function setupPaginationListeners(totalPages) {
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadNews(currentCategory, currentPage);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadNews(currentCategory, currentPage);
            }
        });
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 创建分页容器
    const newsSection = document.querySelector('.news-list .container');
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    newsSection.appendChild(paginationDiv);
    
    // 初始加载新闻
    loadNews();

    // 添加分类按钮点击事件
    const filterButtons = document.querySelectorAll('.tag-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 重置分页并加载新闻
            currentPage = 1;
            currentCategory = button.dataset.category || 'all';
            loadNews(currentCategory, currentPage);
        });
    });
}); 