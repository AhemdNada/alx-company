
// Tab interactions for Chemical Laboratories page
(function () {
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    onReady(() => {
        const tabButtons = Array.from(document.querySelectorAll('.chem-tab-btn'));
        const contents = Array.from(document.querySelectorAll('.chem-tab-content'));

        if (tabButtons.length === 0 || contents.length === 0) return;

        function showTab(key) {
            contents.forEach((c) => {
                const isTarget = c.id === `tab-${key}`;
                c.classList.toggle('hidden', !isTarget);
            });
            tabButtons.forEach((b) => {
                const isActive = b.getAttribute('data-target') === key;
                b.classList.toggle('active', isActive);
                if (isActive) {
                    b.classList.remove('bg-gray-200', 'text-gray-700');
                    b.classList.add('bg-blue-600', 'text-white');
                    b.setAttribute('aria-selected', 'true');
                } else {
                    b.classList.remove('bg-blue-600', 'text-white');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                    b.setAttribute('aria-selected', 'false');
                }
            });
        }

        tabButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-target');
                if (!key) return;
                showTab(key);
            });
        });

        // Hash-based deep linking (?tab=research or #research)
        const params = new URLSearchParams(window.location.search);
        const queryTab = params.get('tab');
        const hashTab = window.location.hash?.replace('#', '');
        const initial = queryTab || hashTab || 'gas';
        showTab(initial);
    });
})();

