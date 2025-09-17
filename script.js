// Apple HIG準拠 ポートフォリオサイト JavaScript

(function() {
    'use strict';

    // DOM要素の取得
    const navigation = document.getElementById('navigation');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    // スクロール位置の管理
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;

    // ナビゲーションの状態管理
    function updateNavigationState() {
        const scrollY = window.scrollY;
        
        // スクロール時のコンパクト化
        if (scrollY > 20) {
            navigation.classList.add('scrolled');
        } else {
            navigation.classList.remove('scrolled');
        }
    }

    // アクティブリンクの更新
    function updateActiveLink() {
        let currentSection = '';
        const scrollY = window.scrollY + 100; // オフセット調整

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        // アクティブ状態の更新
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // スムーススクロール
    function smoothScrollToTarget(target) {
        const targetElement = document.querySelector(target);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // ナビゲーション高さを考慮
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // スクロールイベントハンドラー（パフォーマンス最適化）
    function handleScroll() {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = requestAnimationFrame(() => {
            updateNavigationState();
            updateActiveLink();
            lastScrollY = window.scrollY;
        });
    }

    // ナビゲーションリンクのクリックハンドラー
    function handleNavLinkClick(event) {
        const link = event.currentTarget;
        if (!link || !link.getAttribute) return;
        const href = link.getAttribute('href');
        if (!href) return;

        const isInPageHash = href.startsWith('#');

        // 同一ページ内のハッシュリンクのみデフォルト抑止してスムーススクロール
        if (isInPageHash) {
            event.preventDefault();

            // フォーカス管理
            link.blur();

            // スムーススクロール実行
            smoothScrollToTarget(href);

            // 履歴更新（スクロールはしない）
            if (history.pushState) {
                history.pushState(null, '', href);
            }
        }
        // それ以外（index.html#... や 他ページ）はブラウザに任せて遷移
    }

    // キーボードナビゲーション対応
    function handleKeyNavigation(event) {
        // Escapeキーでフォーカス解除
        if (event.key === 'Escape') {
            document.activeElement.blur();
        }
        
        // Tabキーでのフォーカス順序確認
        if (event.key === 'Tab') {
            // 必要に応じてフォーカストラップを実装
        }
    }

    // カードホバー効果の向上（タッチデバイス対応）
    function initializeCardInteractions() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            // タッチデバイスでのカード操作
            card.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            card.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
            
            // アクセシビリティ向上のためのフォーカス処理
            const cardButton = card.querySelector('.button');
            if (cardButton) {
                card.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        cardButton.click();
                    }
                });
            }
        });
    }

    // パフォーマンス監視（Core Web Vitals対応）
    function initializePerformanceMonitoring() {
        // Largest Contentful Paint (LCP) 監視
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                // 2.5秒を超える場合は警告（開発時のみ）
                if (lastEntry.startTime > 2500 && console.warn) {
                    console.warn(`LCP: ${lastEntry.startTime}ms - 最適化を検討してください`);
                }
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // エラーハンドリング
            }
        }
    }

    // レスポンシブ対応の改善
    function handleResize() {
        // ビューポート変更時の再計算
        updateActiveLink();
        
        // モバイルでのアドレスバー対応
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // フォーム送信の処理（将来の拡張用）
    function initializeFormHandlers() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(event) {
                // カスタム送信処理があればここに実装
            });
        });
    }

    // prefers-reduced-motion 対応
    function respectUserMotionPreferences() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        function handleMotionPreference(event) {
            if (event.matches) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
        }
        
        // 初期状態の設定
        handleMotionPreference(prefersReducedMotion);
        
        // 設定変更の監視
        prefersReducedMotion.addEventListener('change', handleMotionPreference);
    }

    // Intersection Observer による要素の表示アニメーション
    function initializeScrollAnimations() {
        const animatedElements = document.querySelectorAll('.card, .hero-title, .hero-subtitle');
        
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // prefers-reduced-motionが無効な場合のみアニメーションを適用
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            animatedElements.forEach(element => {
                observer.observe(element);
            });
        }
    }

    // エラーハンドリング
    function handleErrors() {
        window.addEventListener('error', function(event) {
            console.error('JavaScript エラー:', event.error);
            // 本番環境では適切なエラーレポーティングサービスに送信
        });
        
        window.addEventListener('unhandledrejection', function(event) {
            console.error('未処理のPromise拒否:', event.reason);
        });
    }

    // コンタクトドロップダウンの初期化
    function initializeContactDropdown() {
        const contactDropdowns = document.querySelectorAll('.contact-dropdown');
        
        contactDropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.contact-trigger');
            const options = dropdown.querySelector('.contact-options');
            const copyButtons = dropdown.querySelectorAll('.copy-email-btn');
            
            if (!trigger || !options) return;
            
            // ドロップダウンの開閉
            trigger.addEventListener('click', function(event) {
                event.stopPropagation();
                const isOpen = trigger.getAttribute('aria-expanded') === 'true';
                
                // 他のドロップダウンを閉じる
                closeAllDropdowns();
                
                if (!isOpen) {
                    trigger.setAttribute('aria-expanded', 'true');
                    options.setAttribute('aria-hidden', 'false');
                    dropdown.setAttribute('aria-expanded', 'true');
                } else {
                    closeDropdown(dropdown);
                }
            });
            
            // メールアドレスのコピー機能
            copyButtons.forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    const email = button.getAttribute('data-email');
                    
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(email).then(() => {
                            showCopySuccess('メールアドレスをコピーしました');
                            closeDropdown(dropdown);
                        }).catch(() => {
                            fallbackCopyToClipboard(email);
                        });
                    } else {
                        fallbackCopyToClipboard(email);
                    }
                });
            });
            
            // キーボード操作
            options.addEventListener('keydown', function(event) {
                const focusableElements = options.querySelectorAll('.contact-option');
                const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
                
                switch(event.key) {
                    case 'Escape':
                        closeDropdown(dropdown);
                        trigger.focus();
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                        focusableElements[nextIndex].focus();
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                        focusableElements[prevIndex].focus();
                        break;
                }
            });
        });
        
        // 外部クリックでドロップダウンを閉じる
        document.addEventListener('click', closeAllDropdowns);
        
        // メインページなどのスタンドアローンコピーボタンも初期化
        initializeStandaloneCopyButtons();
    }
    
    // スタンドアローンコピーボタンの初期化
    function initializeStandaloneCopyButtons() {
        const standaloneCopyButtons = document.querySelectorAll('.copy-email-btn:not(.contact-dropdown .copy-email-btn)');
        
        standaloneCopyButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const email = button.getAttribute('data-email');
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(email).then(() => {
                        showCopySuccess('メールアドレスをコピーしました');
                    }).catch(() => {
                        fallbackCopyToClipboard(email);
                    });
                } else {
                    fallbackCopyToClipboard(email);
                }
            });
        });
    }
    
    function closeAllDropdowns() {
        const allDropdowns = document.querySelectorAll('.contact-dropdown');
        allDropdowns.forEach(closeDropdown);
    }
    
    function closeDropdown(dropdown) {
        const trigger = dropdown.querySelector('.contact-trigger');
        const options = dropdown.querySelector('.contact-options');
        
        if (trigger && options) {
            trigger.setAttribute('aria-expanded', 'false');
            options.setAttribute('aria-hidden', 'true');
            dropdown.setAttribute('aria-expanded', 'false');
        }
    }
    
    // フォールバック用のコピー機能（古いブラウザ対応）
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopySuccess('メールアドレスをコピーしました');
        } catch (err) {
            console.error('コピーに失敗しました:', err);
            showCopySuccess('コピーに失敗しました。手動でコピーしてください。', false);
        }
        
        document.body.removeChild(textArea);
    }
    
    // コピー成功通知の表示
    function showCopySuccess(message, isSuccess = true) {
        // 既存の通知があれば削除
        const existingNotification = document.querySelector('.copy-success');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'copy-success';
        notification.textContent = message;
        notification.style.background = isSuccess ? 'var(--success)' : 'var(--warning)';
        
        document.body.appendChild(notification);
        
        // アニメーション開始
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // 3秒後に自動削除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // mailtoリンクの互換性向上（日本語の件名/本文をエンコードして設定）
    function buildMailtoHref(to, subject, body) {
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
    }

    function initializeMailtoLinks() {
        const subject = 'ポートフォリオサイトからのお問い合わせ';
        const body = 'はじめまして。\r\n\r\nお名前：\r\nご用件：\r\n\r\nよろしくお願いいたします。';
        const selectors = [
            '.contact-options a[href^="mailto:"]',
            '#contact a[href^="mailto:"]'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(link => {
                const href = link.getAttribute('href') || '';
                const match = href.match(/^mailto:([^?]+).*$/);
                const to = match && match[1] ? match[1] : 'minato2ban@icloud.com';
                link.setAttribute('href', buildMailtoHref(to, subject, body));
            });
        });
    }

    // 初期化処理
    function initialize() {
        try {
            // イベントリスナーの設定
            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', handleResize, { passive: true });
            window.addEventListener('keydown', handleKeyNavigation);
            
            // ナビゲーションリンクのイベント設定
            navLinks.forEach(link => {
                link.addEventListener('click', handleNavLinkClick);
            });
            
            // 各種初期化
            updateNavigationState();
            updateActiveLink();
            initializeCardInteractions();
            initializeFormHandlers();
            initializeContactDropdown(); // コンタクトドロップダウン初期化
            initializeMailtoLinks(); // mailtoリンクのエンコード設定
            respectUserMotionPreferences();
            handleResize(); // 初回実行
            
            // パフォーマンス監視（開発環境のみ）
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                initializePerformanceMonitoring();
            }
            
            // アニメーション（Intersection Observer対応）
            if ('IntersectionObserver' in window) {
                initializeScrollAnimations();
            }
            
            // エラーハンドリングの設定
            handleErrors();
            
        } catch (error) {
            console.error('初期化エラー:', error);
        }
    }

    // DOMコンテンツ読み込み完了時に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // モジュールとして外部から使用可能な関数をexport（必要に応じて）
    window.PortfolioSite = {
        smoothScrollToTarget,
        updateActiveLink,
        updateNavigationState
    };

})();

