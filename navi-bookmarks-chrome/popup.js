const STORAGE_KEY = 'bookmarks';
const CATEGORY_STORAGE_KEY = 'categoryOrder';
const LANG_STORAGE_KEY = 'languagePreference';
const DEFAULT_CATEGORIES = ['常用', '开发工具', '搜索引擎', '学习资源', '社区论坛', '其他'];

let langPacks = {};
let activeLocale = 'zh_CN';

function i18n(key, substitutions) {
    if (langPacks[activeLocale] && langPacks[activeLocale][key]) {
        var msg = langPacks[activeLocale][key].message;
        if (substitutions) {
            substitutions.forEach(function(val, idx) {
                msg = msg.replace('$' + (idx + 1), val);
            });
        }
        return msg;
    }
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
        return chrome.i18n.getMessage(key, substitutions);
    }
    return '';
}

function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var msg = i18n(el.dataset.i18n);
        if (msg) el.textContent = msg;
    });
    var titleEl = document.querySelector('[data-i18n="appName"]');
    if (titleEl) {
        var titleMsg = i18n('appName');
        if (titleMsg) document.title = titleMsg;
    }
}

function detectSystemLocale() {
    var lang = (typeof chrome !== 'undefined' && chrome.i18n) ? chrome.i18n.getUILanguage() : navigator.language;
    if (lang.startsWith('zh')) return 'zh_CN';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('ko')) return 'ko';
    return 'en';
}

function loadLangPacks() {
    return new Promise(function(resolve) {
        var locales = ['zh_CN', 'en', 'ja', 'ko'];
        var loaded = 0;
        locales.forEach(function(locale) {
            var url = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
                ? chrome.runtime.getURL('_locales/' + locale + '/messages.json')
                : '_locales/' + locale + '/messages.json';
            fetch(url).then(function(r) { return r.json(); }).then(function(data) {
                langPacks[locale] = data;
                loaded++;
                if (loaded === locales.length) resolve();
            }).catch(function() {
                loaded++;
                if (loaded === locales.length) resolve();
            });
        });
    });
}

function loadLanguagePreference() {
    return new Promise(function(resolve) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(LANG_STORAGE_KEY, function(result) {
                resolve(result[LANG_STORAGE_KEY] || 'system');
            });
        } else {
            resolve(localStorage.getItem(LANG_STORAGE_KEY) || 'system');
        }
    });
}

function categoryLabel(cat) {
    var map = {
        '常用': i18n('catFrequent') || '常用',
        '开发工具': i18n('catDevTools') || '开发工具',
        '搜索引擎': i18n('catSearchEngines') || '搜索引擎',
        '学习资源': i18n('catLearning') || '学习资源',
        '社区论坛': i18n('catCommunity') || '社区论坛',
        '其他': i18n('catOther') || '其他'
    };
    return map[cat] || cat;
}

async function getCurrentTab() {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        try {
            var tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0) return tabs[0];
        } catch (e) {}
    }
    return null;
}

function loadCategories() {
    return new Promise(function(resolve) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(CATEGORY_STORAGE_KEY, function(result) {
                resolve(result[CATEGORY_STORAGE_KEY] || DEFAULT_CATEGORIES);
            });
        } else {
            resolve(DEFAULT_CATEGORIES);
        }
    });
}

function loadBookmarks() {
    return new Promise(function(resolve) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(STORAGE_KEY, function(result) {
                resolve(result[STORAGE_KEY] || []);
            });
        } else {
            resolve([]);
        }
    });
}

function saveBookmarks(bookmarks) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [STORAGE_KEY]: bookmarks });
    }
}

function showToast(msg) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 1600);
}

async function init() {
    await loadLangPacks();
    var langPref = await loadLanguagePreference();
    activeLocale = langPref === 'system' ? detectSystemLocale() : langPref;
    applyI18n();

    var tab = await getCurrentTab();
    var titleEl = document.getElementById('tabTitle');
    var urlEl = document.getElementById('tabUrl');
    var addBtn = document.getElementById('addTabBtn');
    var categorySelect = document.getElementById('categorySelect');

    var categories = await loadCategories();
    categorySelect.innerHTML = categories
        .map(function(c) { return '<option value="' + c + '">' + categoryLabel(c) + '</option>'; })
        .join('');

    if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        titleEl.textContent = i18n('alertNoTab') || '无法获取当前标签页';
        urlEl.textContent = '';
        addBtn.classList.add('popup-disabled');
        addBtn.disabled = true;
        return;
    }

    titleEl.textContent = tab.title || '(untitled)';
    urlEl.textContent = tab.url;

    addBtn.addEventListener('click', async function() {
        if (addBtn.disabled) return;
        var category = categorySelect.value;
        var bookmarks = await loadBookmarks();
        var maxId = bookmarks.length > 0 ? Math.max.apply(null, bookmarks.map(function(b) { return b.id; })) : 0;
        var icons = ['🌟', '⭐', '🔥', '💎', '🎯', '🎨', '🚀', '💡', '⚡', '🌈'];
        var randomIcon = icons[Math.floor(Math.random() * icons.length)];
        bookmarks.push({
            id: maxId + 1,
            name: tab.title || '',
            url: tab.url,
            icon: randomIcon,
            category: category,
            order: bookmarks.length
        });
        saveBookmarks(bookmarks);
        showToast(i18n('alertImportSuccess') ? i18n('alertImportSuccess').replace('$1', '1') : '✓ 已添加');
        addBtn.disabled = true;
        addBtn.classList.add('popup-disabled');
        addBtn.textContent = '✓';
        setTimeout(function() { window.close(); }, 800);
    });

    document.getElementById('openNewTabBtn').addEventListener('click', function() {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: 'newtab.html' });
        } else {
            window.open('newtab.html', '_blank');
        }
        window.close();
    });
}

document.addEventListener('DOMContentLoaded', init);
