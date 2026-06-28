const STORAGE_KEY = 'bookmarks';
const CATEGORY_STORAGE_KEY = 'categoryOrder';
const BG_STORAGE_KEY = 'backgroundStyle';

const CONFIG = {
    enableImportExport: true
};

const bgPresets = [
    { id: 'gradient1', label: '紫蓝渐变', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', label: '日落橙', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'gradient3', label: '深海蓝', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'gradient4', label: '森林绿', css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'gradient5', label: '暗夜紫', css: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { id: 'gradient6', label: '极光', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
    { id: 'grassland', label: '若尔盖', css: 'Zoigê.JPG', thumb: 'Zoigê - mini.JPG' }
];

let currentBgStyle = null;

const defaultBookmarks = [
    { id: 1, name: '我的微博', url: 'https://weibo.com', icon: '📱', category: '常用' },
    { id: 2, name: '我的GitHub', url: 'https://github.com', icon: '👨‍💻', category: '常用' },
    { id: 3, name: 'Google', url: 'https://www.google.com', icon: '🔍', category: '搜索引擎' },
    { id: 4, name: 'GitHub', url: 'https://github.com', icon: '💻', category: '开发工具' },
    { id: 5, name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '❓', category: '社区论坛' },
    { id: 6, name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '📖', category: '学习资源' },
    { id: 7, name: 'Vue.js', url: 'https://vuejs.org', icon: '💚', category: '开发工具' },
    { id: 8, name: 'React', url: 'https://react.dev', icon: '⚛️', category: '开发工具' },
    { id: 9, name: 'TypeScript', url: 'https://www.typescriptlang.org', icon: '📘', category: '开发工具' },
    { id: 10, name: '掘金', url: 'https://juejin.cn', icon: '⛏️', category: '社区论坛' },
    { id: 11, name: 'SegmentFault', url: 'https://segmentfault.com', icon: '💡', category: '社区论坛' },
    { id: 12, name: 'CSDN', url: 'https://www.csdn.net', icon: '📝', category: '社区论坛' },
    { id: 13, name: 'LeetCode', url: 'https://leetcode.cn', icon: '🧮', category: '学习资源' },
    { id: 14, name: '百度', url: 'https://www.baidu.com', icon: '🅱️', category: '搜索引擎' },
    { id: 15, name: 'npm', url: 'https://www.npmjs.com', icon: '📦', category: '开发工具' },
    { id: 16, name: 'Docker', url: 'https://www.docker.com', icon: '🐳', category: '开发工具' }
];

let defaultCategories = ['常用', '开发工具', '搜索引擎', '学习资源', '社区论坛', '其他'];
let categories = ['全部', ...defaultCategories];
let bookmarks = [];
let currentCategory = '常用';
let draggedItem = null;
let currentSearchEngine = 'bookmarks';

const searchEngines = {
    bookmarks: { name: '书签', icon: '⭐', url: '' },
    google: { name: 'Google', icon: '🔍', url: 'https://www.google.com/search?q=' },
    baidu: { name: '百度', icon: '🔍', url: 'https://www.baidu.com/s?wd=' },
    bing: { name: '必应', icon: '🅱️', url: 'https://www.bing.com/search?q=' },
    duckduckgo: { name: 'DuckDuckGo', icon: '🦆', url: 'https://duckduckgo.com/?q=' }
};

function openBookmark(url) {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: url });
    } else {
        window.open(url, '_blank');
    }
}

function truncateUrl(url) {
    const maxLength = 20;
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

function loadCategoryOrder() {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(CATEGORY_STORAGE_KEY, (result) => {
                if (result[CATEGORY_STORAGE_KEY]) {
                    defaultCategories = result[CATEGORY_STORAGE_KEY];
                }
                resolve();
            });
        } else {
            const saved = localStorage.getItem(CATEGORY_STORAGE_KEY);
            if (saved) {
                try {
                    defaultCategories = JSON.parse(saved);
                } catch {
                    defaultCategories = ['常用', '开发工具', '搜索引擎', '学习资源', '社区论坛', '其他'];
                }
            }
            resolve();
        }
    });
}

function loadBookmarks() {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(STORAGE_KEY, (result) => {
                if (result[STORAGE_KEY]) {
                    bookmarks = result[STORAGE_KEY].map((item, index) => ({
                        ...item,
                        order: item.order !== undefined ? item.order : index
                    }));
                    bookmarks.sort((a, b) => a.order - b.order);
                } else {
                    bookmarks = defaultBookmarks.map((item, index) => ({
                        ...item,
                        order: index
                    }));
                }
                resolve();
            });
        } else {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                bookmarks = JSON.parse(stored);
            } else {
                bookmarks = defaultBookmarks.map((item, index) => ({
                    ...item,
                    order: index
                }));
            }
            resolve();
        }
    });
}

function saveBookmarks() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [STORAGE_KEY]: bookmarks });
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
}

function toggleSearchEngineDropdown() {
    document.getElementById('searchEngineDropdown').classList.toggle('active');
}

function selectSearchEngine(engine) {
    currentSearchEngine = engine;
    const engineInfo = searchEngines[engine];
    document.getElementById('currentEngineIcon').textContent = engineInfo.icon;
    document.getElementById('currentEngineName').textContent = engineInfo.name;
    document.querySelectorAll('.search-dropdown-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector('[data-engine="' + engine + '"]').classList.add('selected');
    document.getElementById('searchEngineDropdown').classList.remove('active');
    const input = document.getElementById('searchInput');
    if (input.value.trim()) {
        performSearch(input.value.trim());
    }
}

function searchBookmarks(query) {
    const lowerQuery = query.toLowerCase();
    return bookmarks.filter(bookmark =>
        bookmark.name.toLowerCase().includes(lowerQuery) ||
        bookmark.url.toLowerCase().includes(lowerQuery) ||
        bookmark.description && bookmark.description.toLowerCase().includes(lowerQuery) ||
        bookmark.category.toLowerCase().includes(lowerQuery)
    );
}

function performSearch(query) {
    const results = searchBookmarks(query);
    const resultsContainer = document.getElementById('searchResults');

    if (results.length === 0) {
        resultsContainer.innerHTML =
            '<div class="search-no-results">未找到匹配的书签</div>' +
            '<div class="search-suggestions">' +
            '<div class="suggestion-title">在搜索引擎中搜索</div>' +
            '<div class="suggestion-item" data-action="search-engine" data-engine="bing" data-query="' + query + '">' +
            '<span class="search-icon">🅱️</span>' +
            '<span class="text">必应搜索 "' + query + '"</span>' +
            '</div>' +
            '<div class="suggestion-item" data-action="search-engine" data-engine="baidu" data-query="' + query + '">' +
            '<span class="search-icon">🔍</span>' +
            '<span class="text">百度搜索 "' + query + '"</span>' +
            '</div>' +
            '</div>';
    } else {
        resultsContainer.innerHTML = results.map(function(bookmark) {
            return '<div class="search-result-item" data-action="open-bookmark" data-url="' + bookmark.url + '">' +
                '<div class="icon">' + bookmark.icon + '</div>' +
                '<div class="info">' +
                '<div class="name">' + bookmark.name + '</div>' +
                '<div class="url">' + truncateUrl(bookmark.url) + '</div>' +
                '</div>' +
                '<span class="category">' + bookmark.category + '</span>' +
                '</div>';
        }).join('');
    }
}

function performEnterSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();
    if (query) {
        if (currentSearchEngine === 'bookmarks') {
            const results = searchBookmarks(query);
            if (results.length > 0) {
                openBookmark(results[0].url);
            } else {
                const firstEngine = Object.keys(searchEngines).find(function(key) { return key !== 'bookmarks'; });
                if (firstEngine) {
                    window.open(searchEngines[firstEngine].url + encodeURIComponent(query), '_blank');
                }
            }
        } else {
            window.open(searchEngines[currentSearchEngine].url + encodeURIComponent(query), '_blank');
        }
        document.getElementById('searchResults').innerHTML = '';
        input.value = '';
    }
}

function updateCategories() {
    const allCategories = [...new Set(bookmarks.map(function(b) { return b.category; }))];
    const defaultCats = defaultCategories.filter(function(cat) { return cat !== '其他'; });
    const sortedCategories = [...defaultCats];
    const customCategories = allCategories.filter(function(cat) { return !defaultCats.includes(cat) && cat !== '其他'; });
    customCategories.sort();
    sortedCategories.push(...customCategories);
    if (allCategories.includes('其他') || !sortedCategories.includes('其他')) {
        sortedCategories.push('其他');
    }
    categories = ['全部', ...sortedCategories];
    renderCategories();
    updateCategorySelect();
}

function updateCategorySelect() {
    const select = document.getElementById('categoryInput');
    const currentValue = select.value;
    select.innerHTML = categories
        .filter(function(c) { return c !== '全部'; })
        .map(function(c) { return '<option value="' + c + '">' + c + '</option>'; })
        .join('') + '<option value="__new__">+ 添加新分类</option>';
    if (categories.includes(currentValue)) {
        select.value = currentValue;
    }
}

function renderCategories() {
    const filter = document.getElementById('categoryFilter');
    filter.innerHTML = categories.map(function(cat) {
        return '<button class="category-tag ' + (cat === currentCategory ? 'active' : '') + '" data-category="' + cat + '">' + cat + '</button>';
    }).join('');
}

function filterByCategory(category) {
    currentCategory = category;
    renderCategories();
    renderBookmarks();
}

function renderBookmarks() {
    const content = document.getElementById('bookmarkContent');

    if (bookmarks.length === 0) {
        content.innerHTML = '<div class="empty-state"><h3>暂无书签</h3><p>点击上方按钮添加您的第一个书签</p></div>';
        return;
    }

    const grouped = bookmarks.reduce(function(groups, bookmark) {
        if (!groups[bookmark.category]) {
            groups[bookmark.category] = [];
        }
        groups[bookmark.category].push(bookmark);
        return groups;
    }, {});

    let displayCategories;
    if (currentCategory === '全部') {
        const defaultCats = defaultCategories.filter(function(cat) { return cat !== '其他' && Object.keys(grouped).includes(cat); });
        displayCategories = Object.keys(grouped).sort(function(a, b) {
            if (a === '其他') return 1;
            if (b === '其他') return -1;
            const indexA = defaultCats.indexOf(a);
            const indexB = defaultCats.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
    } else {
        displayCategories = [currentCategory];
    }

    content.innerHTML = displayCategories.map(function(category) {
        const items = grouped[category] || [];
        return '<div class="bookmark-section">' +
            '<div class="section-header"><h2>' + category + '</h2><span class="count">' + items.length + '</span></div>' +
            '<div class="bookmark-grid">' +
            (items.length > 0 ? items.map(function(bookmark) {
                return '<div class="bookmark-card" draggable="true" data-id="' + bookmark.id + '">' +
                    '<div class="card-click-area" data-action="open-bookmark" data-url="' + bookmark.url + '">' +
                    '<div class="icon">' + bookmark.icon + '</div>' +
                    '<h3>' + bookmark.name + '</h3>' +
                    '</div>' +
                    '<p>' + truncateUrl(bookmark.url) + '</p>' +
                    (bookmark.description ? '<p class="description">' + bookmark.description + '</p>' : '') +
                    '<span class="category-badge">' + bookmark.category + '</span>' +
                    '<div class="actions">' +
                    '<button class="edit-btn" data-action="edit" data-id="' + bookmark.id + '">编辑</button>' +
                    '<button class="delete-btn" data-action="delete" data-id="' + bookmark.id + '">删除</button>' +
                    '</div>' +
                    '</div>';
            }).join('') :
            '<div class="bookmark-card add-card" data-action="add-with-category" data-category="' + category + '">' +
            '<div class="add-icon">+</div><h3>添加书签</h3><p>点击添加新书签</p></div>') +
            '</div></div>';
    }).join('');
}

function setupBookmarkEvents() {
    var content = document.getElementById('bookmarkContent');

    content.addEventListener('click', function(e) {
        var clickArea = e.target.closest('.card-click-area');
        if (clickArea) {
            e.preventDefault();
            openBookmark(clickArea.dataset.url);
            return;
        }
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.dataset.action;
        if (action === 'edit') {
            e.stopPropagation();
            openEditModal(parseInt(target.dataset.id));
        } else if (action === 'delete') {
            e.stopPropagation();
            deleteBookmark(parseInt(target.dataset.id));
        } else if (action === 'add-with-category') {
            openAddModalWithCategory(target.dataset.category);
        }
    });

    content.addEventListener('dragstart', function(e) {
        var card = e.target.closest('.bookmark-card');
        if (!card) return;
        draggedItem = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.id);
    });

    content.addEventListener('dragend', function(e) {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        document.querySelectorAll('.bookmark-card').forEach(function(card) {
            card.classList.remove('drag-over');
        });
        draggedItem = null;
    });

    content.addEventListener('dragover', function(e) {
        if (!draggedItem) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('.bookmark-card').forEach(function(card) {
            if (card !== draggedItem) card.classList.remove('drag-over');
        });
        var card = e.target.closest('.bookmark-card');
        if (card) card.classList.add('drag-over');
    });

    content.addEventListener('drop', function(e) {
        if (!draggedItem) return;
        e.preventDefault();
        var draggedId = parseInt(draggedItem.dataset.id);
        var dropTarget = e.target.closest('.bookmark-card');
        if (!dropTarget || draggedId === parseInt(dropTarget.dataset.id)) return;
        var dropId = parseInt(dropTarget.dataset.id);
        var draggedIndex = bookmarks.findIndex(function(b) { return b.id === draggedId; });
        var dropIndex = bookmarks.findIndex(function(b) { return b.id === dropId; });
        if (draggedIndex !== -1 && dropIndex !== -1) {
            var draggedItemData = bookmarks.splice(draggedIndex, 1)[0];
            bookmarks.splice(dropIndex, 0, draggedItemData);
            bookmarks.forEach(function(bookmark, index) { bookmark.order = index; });
            saveBookmarks();
            renderBookmarks();
        }
    });
}

let formDirty = false;
function setFormDirty() { formDirty = true; }
function clearFormDirtyFlag() { formDirty = false; }
function hasUnsavedChanges() { return formDirty; }

function openAddModal() {
    clearFormDirtyFlag();
    document.getElementById('modalTitle').textContent = '添加书签';
    document.getElementById('editId').value = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('urlInput').value = '';
    document.getElementById('descriptionInput').value = '';
    document.getElementById('categoryInput').value = currentCategory === '全部' ? '常用' : currentCategory;
    document.getElementById('newCategoryGroup').style.display = 'none';
    document.getElementById('modalOverlay').classList.add('active');
}

function openAddModalWithCategory(category) {
    clearFormDirtyFlag();
    document.getElementById('modalTitle').textContent = '添加书签';
    document.getElementById('editId').value = '';
    document.getElementById('nameInput').value = '';
    document.getElementById('urlInput').value = '';
    document.getElementById('descriptionInput').value = '';
    document.getElementById('categoryInput').value = category;
    document.getElementById('newCategoryGroup').style.display = 'none';
    document.getElementById('modalOverlay').classList.add('active');
}

function openEditModal(id) {
    clearFormDirtyFlag();
    const bookmark = bookmarks.find(function(b) { return b.id === id; });
    if (bookmark) {
        document.getElementById('modalTitle').textContent = '编辑书签';
        document.getElementById('editId').value = id;
        document.getElementById('nameInput').value = bookmark.name;
        document.getElementById('urlInput').value = bookmark.url;
        document.getElementById('descriptionInput').value = bookmark.description || '';
        document.getElementById('categoryInput').value = bookmark.category;
        document.getElementById('newCategoryGroup').style.display = 'none';
        document.getElementById('modalOverlay').classList.add('active');
    }
}

function closeModal(force) {
    if (!force && hasUnsavedChanges()) {
        if (!confirm('您有未保存的更改，确定要退出吗？')) return;
    }
    document.getElementById('modalOverlay').classList.remove('active');
    clearFormDirtyFlag();
}

function saveBookmark() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('nameInput').value.trim();
    let url = document.getElementById('urlInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    let category = document.getElementById('categoryInput').value;

    if (!name || !url) {
        alert('请填写完整信息');
        return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    if (category === '__new__') {
        const newCategory = document.getElementById('newCategoryInput').value.trim();
        if (!newCategory) {
            alert('请输入新分类名称');
            return;
        }
        category = newCategory;
    }

    const icons = ['🌟', '⭐', '🔥', '💎', '🎯', '🎨', '🚀', '💡', '🎯', '⚡', '🌈', '🎪', '🎭', '🎬', '🎨'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    if (id) {
        bookmarks = bookmarks.map(function(b) {
            return b.id === parseInt(id) ? Object.assign({}, b, { name: name, url: url, description: description, category: category }) : b;
        });
    } else {
        const newId = bookmarks.length > 0 ? Math.max(...bookmarks.map(function(b) { return b.id; })) + 1 : 1;
        bookmarks.push({ id: newId, name: name, url: url, icon: randomIcon, category: category, order: bookmarks.length });
    }

    saveBookmarks();
    updateCategories();
    renderBookmarks();
    closeModal(true);
}

function deleteBookmark(id) {
    if (confirm('确定要删除这个书签吗？')) {
        bookmarks = bookmarks.filter(function(b) { return b.id !== id; });
        bookmarks.forEach(function(bookmark, index) { bookmark.order = index; });
        saveBookmarks();
        renderBookmarks();
    }
}

function openCategoryModal() {
    document.getElementById('categoryModalOverlay').classList.add('active');
    renderCategoryList();
}

function closeCategoryModal() {
    document.getElementById('categoryModalOverlay').classList.remove('active');
    document.getElementById('newCatName').value = '';
}

let draggedCategory = null;

function renderCategoryList() {
    const allCategories = [...new Set(bookmarks.map(function(b) { return b.category; }))];
    const sortedCategories = [];
    const defaultCats = defaultCategories.filter(function(cat) { return cat !== '其他'; });

    sortedCategories.push(...defaultCats);
    const customCategories = allCategories.filter(function(cat) { return !defaultCats.includes(cat) && cat !== '其他'; });
    customCategories.sort();
    sortedCategories.push(...customCategories);
    if (!sortedCategories.includes('其他')) {
        sortedCategories.push('其他');
    }

    const list = document.getElementById('categoryList');
    list.innerHTML = sortedCategories.map(function(cat) {
        const count = bookmarks.filter(function(b) { return b.category === cat; }).length;
        const isDefault = defaultCats.includes(cat);
        return '<div class="category-item" draggable="true" data-category="' + cat + '">' +
            '<div><span class="category-name">📁 ' + cat + '</span><span class="category-count">(' + count + '个书签)</span></div>' +
            '<div class="category-actions">' +
            '<button class="category-btn rename" data-action="rename-category" data-category="' + cat + '">重命名</button>' +
            (!isDefault ? '<button class="category-btn delete" data-action="delete-category" data-category="' + cat + '">删除</button>' : '<button class="category-btn disabled" disabled>默认</button>') +
            '</div></div>';
    }).join('');
}

function setupCategoryModalEvents() {
    const categoryList = document.getElementById('categoryList');
    categoryList.addEventListener('click', function(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        e.stopPropagation();
        const action = target.dataset.action;
        const cat = target.dataset.category;
        if (action === 'rename-category') {
            renameCategory(cat);
        } else if (action === 'delete-category') {
            deleteCategory(cat);
        }
    });

    categoryList.addEventListener('dragstart', function(e) {
        const item = e.target.closest('.category-item');
        if (!item) return;
        draggedCategory = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.category);
    });

    categoryList.addEventListener('dragend', function(e) {
        if (draggedCategory) draggedCategory.classList.remove('dragging');
        document.querySelectorAll('.category-item').forEach(function(item) {
            item.classList.remove('drag-over');
        });
        draggedCategory = null;
    });

    categoryList.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('.category-item').forEach(function(item) {
            if (item !== draggedCategory) item.classList.remove('drag-over');
        });
        const item = e.target.closest('.category-item');
        if (item) item.classList.add('drag-over');
    });

    categoryList.addEventListener('drop', function(e) {
        e.preventDefault();
        const draggedCat = e.dataTransfer.getData('text/plain');
        const dropTarget = e.target.closest('.category-item');
        if (!dropTarget || draggedCat === dropTarget.dataset.category) return;
        const dropCat = dropTarget.dataset.category;
        const allCats = [...new Set(bookmarks.map(function(b) { return b.category; }))];
        const defaultCats = defaultCategories.filter(function(cat) { return cat !== '其他'; });
        const sortedCats = [];
        defaultCats.forEach(function(cat) { if (allCats.includes(cat)) sortedCats.push(cat); });
        const customCats = allCats.filter(function(cat) { return !defaultCats.includes(cat) && cat !== '其他'; });
        customCats.sort();
        sortedCats.push(...customCats);
        if (allCats.includes('其他')) sortedCats.push('其他');

        const draggedIndex = sortedCats.indexOf(draggedCat);
        const dropIndex = sortedCats.indexOf(dropCat);
        if (draggedIndex !== -1 && dropIndex !== -1) {
            const newCategories = [...sortedCats];
            newCategories.splice(draggedIndex, 1);
            newCategories.splice(dropIndex, 0, draggedCat);
            const newDefaultCategories = newCategories.filter(function(cat) { return defaultCats.includes(cat) || cat === '其他'; });
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ [CATEGORY_STORAGE_KEY]: newCategories });
            } else {
                localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(newCategories));
            }
            defaultCategories.length = 0;
            defaultCategories.push(...newDefaultCategories);
            updateCategories();
            renderBookmarks();
            renderCategoryList();
        }
    });
}

function addCategory() {
    const name = document.getElementById('newCatName').value.trim();
    if (!name) { alert('请输入分类名称'); return; }
    if (bookmarks.some(function(b) { return b.category === name; })) { alert('该分类已存在'); return; }
    bookmarks.push({
        id: bookmarks.length > 0 ? Math.max(...bookmarks.map(function(b) { return b.id; })) + 1 : 1,
        name: name, url: '#', icon: '📁', category: name, order: bookmarks.length
    });
    saveBookmarks();
    updateCategories();
    document.getElementById('newCatName').value = '';
    renderCategoryList();
}

function renameCategory(oldName) {
    const newName = prompt('请输入新的分类名称:', oldName);
    if (!newName || newName.trim() === '') return;
    if (bookmarks.some(function(b) { return b.category === newName.trim(); })) { alert('该分类已存在'); return; }
    bookmarks = bookmarks.map(function(b) {
        return b.category === oldName ? Object.assign({}, b, { category: newName.trim() }) : b;
    });
    const index = defaultCategories.indexOf(oldName);
    if (index !== -1) defaultCategories[index] = newName.trim();
    saveBookmarks();
    updateCategories();
    renderCategoryList();
    renderBookmarks();
}

function deleteCategory(name) {
    if (confirm('确定要删除分类 "' + name + '" 吗？该分类下的所有书签将被移到"其他"分类。')) {
        bookmarks = bookmarks.map(function(b) {
            return b.category === name ? Object.assign({}, b, { category: '其他' }) : b;
        });
        const index = defaultCategories.indexOf(name);
        if (index !== -1) defaultCategories.splice(index, 1);
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ [CATEGORY_STORAGE_KEY]: defaultCategories });
        } else {
            localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(defaultCategories));
        }
        saveBookmarks();
        updateCategories();
        renderCategoryList();
        renderBookmarks();
    }
}

function exportBookmarks() {
    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    document.getElementById('fabMenu').classList.remove('active');
}

function toggleImportExport() {
    document.getElementById('fabMenu').classList.toggle('active');
}

function triggerImport() {
    document.getElementById('importFile').click();
    document.getElementById('fabMenu').classList.remove('active');
}

function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        try {
            const importedData = JSON.parse(ev.target.result);
            if (!Array.isArray(importedData)) { alert('无效的书签数据格式'); return; }
            if (importedData.length === 0) { alert('导入的书签数据为空'); return; }
            const importMode = prompt('检测到 ' + importedData.length + ' 个书签，选择导入方式：\n1 - 追加到现有书签\n2 - 替换所有书签');
            if (importMode !== '1' && importMode !== '2') { alert('取消导入'); return; }
            let maxId = Math.max(...bookmarks.map(function(b) { return b.id; }), 0);
            if (importMode === '2') { bookmarks = []; maxId = 0; }
            const existingCategories = [...new Set(bookmarks.map(function(b) { return b.category; }))];
            const newCategories = new Set();
            importedData.forEach(function(item, index) {
                const bookmarkCategory = item.category || '其他';
                if (!existingCategories.includes(bookmarkCategory) && !bookmarks.some(function(b) { return b.category === bookmarkCategory; })) {
                    newCategories.add(bookmarkCategory);
                }
                bookmarks.push({
                    id: ++maxId, name: item.name || '未命名', url: item.url || '',
                    icon: item.icon || '🔗', category: bookmarkCategory,
                    order: bookmarks.length + index, description: item.description || ''
                });
            });
            saveBookmarks();
            updateCategories();
            renderBookmarks();
            let message = '成功导入 ' + importedData.length + ' 个书签！';
            if (newCategories.size > 0) message += '\n\n新增分类：' + [...newCategories].join('、');
            alert(message);
        } catch (error) {
            alert('导入失败：无效的JSON文件');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function loadBackgroundPreference() {
    return new Promise(function(resolve) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(BG_STORAGE_KEY, function(result) {
                currentBgStyle = result[BG_STORAGE_KEY] || null;
                resolve();
            });
        } else {
            currentBgStyle = localStorage.getItem(BG_STORAGE_KEY) || null;
            resolve();
        }
    });
}

function saveBackgroundPreference(style) {
    currentBgStyle = style;
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [BG_STORAGE_KEY]: style });
    } else {
        localStorage.setItem(BG_STORAGE_KEY, style);
    }
}

function loadBackgroundImage() {
    if (currentBgStyle && currentBgStyle.startsWith('custom:')) {
        var dataUrl = currentBgStyle.substring(7);
        document.body.style.background = 'url(' + dataUrl + ') center/cover fixed';
        document.body.classList.remove('loaded');
        return;
    }
    if (currentBgStyle && currentBgStyle.startsWith('linear-gradient')) {
        document.body.style.background = currentBgStyle;
        document.body.classList.remove('loaded');
        return;
    }
    if (currentBgStyle === 'Zoigê.JPG' || !currentBgStyle) {
        var imgUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL('Zoigê.JPG') : 'Zoigê.JPG';
        var img = new Image();
        img.onload = function() {
            document.body.style.background = 'url(' + imgUrl + ') center/cover fixed';
            document.body.classList.remove('loaded');
        };
        img.onerror = function() {
            document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            document.body.classList.remove('loaded');
        };
        img.src = imgUrl;
        return;
    }
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.classList.remove('loaded');
}

function showBgPicker() {
    let picker = document.getElementById('bgPickerOverlay');
    if (picker) { picker.remove(); return; }

    picker = document.createElement('div');
    picker.id = 'bgPickerOverlay';
    picker.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;';

    var panel = document.createElement('div');
    panel.style.cssText = 'background:white;border-radius:16px;padding:24px;max-width:360px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);';

    var title = document.createElement('h3');
    title.textContent = '🎨 选择背景';
    title.style.cssText = 'margin:0 0 16px 0;color:#333;font-size:1.1rem;';
    panel.appendChild(title);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;';

    bgPresets.forEach(function(preset) {
        var item = document.createElement('div');
        item.style.cssText = 'cursor:pointer;border-radius:10px;overflow:hidden;border:2px solid ' + (currentBgStyle === preset.css ? '#667eea' : 'transparent') + ';transition:all 0.2s;';
        item.dataset.bg = preset.css;

        var preview = document.createElement('div');
        if (preset.thumb) {
            var thumbUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL(preset.thumb) : preset.thumb;
            preview.style.cssText = 'height:50px;background:url(' + thumbUrl + ') center/cover;';
        } else if (preset.css.endsWith('.JPG') || preset.css.endsWith('.jpg')) {
            var imgUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL(preset.css) : preset.css;
            preview.style.cssText = 'height:50px;background:url(' + imgUrl + ') center/cover;';
        } else {
            preview.style.cssText = 'height:50px;background:' + preset.css + ';';
        }
        item.appendChild(preview);

        var label = document.createElement('div');
        label.textContent = preset.label;
        label.style.cssText = 'text-align:center;font-size:0.7rem;color:#666;padding:4px 0;';
        item.appendChild(label);

        item.addEventListener('click', function() {
            saveBackgroundPreference(preset.css);
            loadBackgroundImage();
            document.getElementById('bgPickerOverlay').remove();
        });

        item.addEventListener('mouseenter', function() { item.style.transform = 'scale(1.05)'; });
        item.addEventListener('mouseleave', function() { item.style.transform = 'scale(1)'; });

        grid.appendChild(item);
    });
    panel.appendChild(grid);

    var fileRow = document.createElement('div');
    fileRow.style.cssText = 'border-top:1px solid #eee;padding-top:12px;';

    var fileBtn = document.createElement('button');
    fileBtn.textContent = '📁 上传自定义背景';
    fileBtn.style.cssText = 'width:100%;padding:10px;border:2px dashed #ccc;border-radius:10px;background:transparent;color:#666;font-size:0.85rem;cursor:pointer;transition:all 0.2s;';
    fileBtn.addEventListener('mouseenter', function() { fileBtn.style.borderColor = '#667eea'; fileBtn.style.color = '#667eea'; });
    fileBtn.addEventListener('mouseleave', function() { fileBtn.style.borderColor = '#ccc'; fileBtn.style.color = '#666'; });

    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            var dataUrl = ev.target.result;
            saveBackgroundPreference('custom:' + dataUrl);
            document.body.style.background = 'url(' + dataUrl + ') center/cover fixed';
            document.body.classList.remove('loaded');
            document.getElementById('bgPickerOverlay').remove();
        };
        reader.readAsDataURL(file);
    });

    fileBtn.addEventListener('click', function() { fileInput.click(); });
    fileRow.appendChild(fileBtn);
    fileRow.appendChild(fileInput);
    panel.appendChild(fileRow);

    var closeRow = document.createElement('div');
    closeRow.style.cssText = 'text-align:center;margin-top:12px;';
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = 'padding:6px 20px;border:none;border-radius:8px;background:#f0f0f0;color:#666;cursor:pointer;font-size:0.85rem;';
    closeBtn.addEventListener('click', function() { document.getElementById('bgPickerOverlay').remove(); });
    closeRow.appendChild(closeBtn);
    panel.appendChild(closeRow);

    picker.appendChild(panel);
    picker.addEventListener('click', function(e) {
        if (e.target === picker) picker.remove();
    });
    document.body.appendChild(picker);
}

function setupCategoryScroll() {
    const filter = document.getElementById('categoryFilter');
    const bookmarkContent = document.getElementById('bookmarkContent');
    let isHoveringFilter = false;
    let isHoveringBookmarks = false;

    filter.addEventListener('mouseenter', function() { isHoveringFilter = true; });
    filter.addEventListener('mouseleave', function() { isHoveringFilter = false; });
    bookmarkContent.addEventListener('mouseenter', function() { isHoveringBookmarks = true; });
    bookmarkContent.addEventListener('mouseleave', function() { isHoveringBookmarks = false; });

    function handleWheel(e) {
        if (!isHoveringFilter && !isHoveringBookmarks) return;
        if (currentCategory === '全部') return;
        e.preventDefault();
        const nonAllCategories = categories.filter(function(c) { return c !== '全部'; });
        let currentIndex = nonAllCategories.indexOf(currentCategory);
        if (currentIndex === -1) currentIndex = 0;
        if (e.deltaX > 0 || e.deltaY > 0) {
            currentIndex = (currentIndex + 1) % nonAllCategories.length;
        } else if (e.deltaX < 0 || e.deltaY < 0) {
            currentIndex = (currentIndex - 1 + nonAllCategories.length) % nonAllCategories.length;
        }
        filterByCategory(nonAllCategories[currentIndex]);
    }

    filter.addEventListener('wheel', handleWheel);
    bookmarkContent.addEventListener('wheel', handleWheel);
}

function setupStaticEvents() {
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        performEnterSearch();
    });

    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') return;
        const query = e.target.value.trim();
        if (query && currentSearchEngine === 'bookmarks') {
            performSearch(query);
        } else {
            document.getElementById('searchResults').innerHTML = '';
        }
    });

    document.getElementById('searchEngineSelector').addEventListener('click', function() {
        toggleSearchEngineDropdown();
    });

    document.getElementById('searchEngineDropdown').addEventListener('click', function(e) {
        const item = e.target.closest('.search-dropdown-item');
        if (!item) return;
        selectSearchEngine(item.dataset.engine);
    });

    document.getElementById('searchResults').addEventListener('click', function(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        if (action === 'search-engine') {
            const url = searchEngines[target.dataset.engine].url + encodeURIComponent(target.dataset.query);
            window.open(url, '_blank');
            document.getElementById('searchResults').innerHTML = '';
            document.getElementById('searchInput').value = '';
        } else if (action === 'open-bookmark') {
            openBookmark(target.dataset.url);
            document.getElementById('searchResults').innerHTML = '';
            document.getElementById('searchInput').value = '';
        }
    });

    document.addEventListener('click', function(e) {
        var searchContainer = document.querySelector('.search-container');
        var dropdown = document.getElementById('searchEngineDropdown');
        var results = document.getElementById('searchResults');
        if (!searchContainer.contains(e.target)) {
            if (dropdown.classList.contains('active')) dropdown.classList.remove('active');
            if (results.innerHTML) {
                results.innerHTML = '';
                document.getElementById('searchInput').value = '';
            }
        }
        var fabPanel = document.getElementById('fabPanel');
        var fabMenu = document.getElementById('fabMenu');
        if (fabPanel && !fabPanel.contains(e.target)) {
            fabMenu.classList.remove('active');
        }
    });

    document.getElementById('addBookmarkBtn').addEventListener('click', function() {
        openAddModal();
    });

    document.getElementById('editCategoryBtn').addEventListener('click', function() {
        openCategoryModal();
    });

    document.getElementById('categoryFilter').addEventListener('click', function(e) {
        const btn = e.target.closest('.category-tag');
        if (!btn) return;
        filterByCategory(btn.dataset.category);
    });

    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });

    document.getElementById('categoryModalOverlay').addEventListener('click', function(e) {
        if (e.target === document.getElementById('categoryModalOverlay')) closeCategoryModal();
    });

    document.getElementById('cancelModalBtn').addEventListener('click', function() {
        closeModal();
    });

    document.getElementById('saveModalBtn').addEventListener('click', function() {
        saveBookmark();
    });

    document.getElementById('categoryInput').addEventListener('change', function() {
        const newCategoryGroup = document.getElementById('newCategoryGroup');
        if (this.value === '__new__') {
            newCategoryGroup.style.display = 'block';
        } else {
            newCategoryGroup.style.display = 'none';
        }
        setFormDirty();
    });

    document.getElementById('nameInput').addEventListener('input', setFormDirty);
    document.getElementById('urlInput').addEventListener('input', setFormDirty);
    document.getElementById('descriptionInput').addEventListener('input', setFormDirty);
    document.getElementById('newCategoryInput').addEventListener('input', setFormDirty);

    document.getElementById('addCategoryBtn').addEventListener('click', function() {
        addCategory();
    });

    document.getElementById('newCatName').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') addCategory();
    });

    document.getElementById('closeCategoryModalBtn').addEventListener('click', function() {
        closeCategoryModal();
    });

    document.getElementById('ieToggleBtn').addEventListener('click', function() {
        toggleImportExport();
    });

    document.getElementById('exportBtn').addEventListener('click', function() {
        exportBookmarks();
    });

    document.getElementById('importBtn').addEventListener('click', function() {
        triggerImport();
    });

    document.getElementById('changeBgBtn').addEventListener('click', function() {
        document.getElementById('fabMenu').classList.remove('active');
        showBgPicker();
    });

    document.getElementById('importFile').addEventListener('change', handleImportFile);
}

async function init() {
    await loadCategoryOrder();
    await loadBookmarks();
    await loadBackgroundPreference();
    updateCategories();
    renderBookmarks();
    setupCategoryScroll();
    setupStaticEvents();
    setupBookmarkEvents();
    setupCategoryModalEvents();
    loadBackgroundImage();
}

document.addEventListener('DOMContentLoaded', function() {
    init();
});
