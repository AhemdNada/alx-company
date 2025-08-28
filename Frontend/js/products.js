// Products page interactions: tab groups for two sections
(function () {
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function initTabGroup(groupEl) {
        if (!groupEl) return;
        const buttons = Array.from(groupEl.querySelectorAll('.tab-buttons .tab-btn'));
        const panels = Array.from(groupEl.querySelectorAll('.tab-contents .tab-panel'));
        if (buttons.length === 0 || panels.length === 0) return;

        function setActive(targetId) {
            buttons.forEach(btn => {
                const isActive = btn.getAttribute('data-target') === targetId;
                btn.classList.toggle('active', isActive);
                // Toggle Tailwind-y active styles
                if (isActive) {
                    btn.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'ring-blue-200');
                    btn.classList.remove('bg-white', 'text-gray-800');
                    btn.setAttribute('aria-selected', 'true');
                } else {
                    btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'ring-blue-200');
                    btn.classList.add('bg-white', 'text-gray-800');
                    btn.setAttribute('aria-selected', 'false');
                }
            });

            panels.forEach(panel => {
                if (panel.id === targetId) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });
        }

        // Bind click
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                if (!targetId) return;
                setActive(targetId);
            });
        });

        // Initialize with the first button that has .active or default to first
        const defaultBtn = buttons.find(b => b.classList.contains('active')) || buttons[0];
        if (defaultBtn) setActive(defaultBtn.getAttribute('data-target'));
    }

    onReady(() => {
        document.querySelectorAll('.product-tabs').forEach(initTabGroup);

        // Hash-based deep linking: if URL hash matches a panel id, open it
        function openByHash() {
            const hash = window.location.hash.replace('#', '');
            if (!hash) return;
            const panel = document.getElementById(hash);
            if (!panel) return;
            const group = panel.closest('.product-tabs');
            if (!group) return;
            const btn = group.querySelector(`.tab-btn[data-target="${hash}"]`);
            if (btn) {
                btn.click();
                // Smooth scroll to the group container for better UX
                group.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        window.addEventListener('hashchange', openByHash);
        openByHash();
    });
})();


