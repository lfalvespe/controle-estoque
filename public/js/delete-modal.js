(function () {
    const modal = document.getElementById('deleteConfirmModal');
    const message = document.getElementById('deleteConfirmMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');

    if (!modal || !confirmBtn || !cancelBtn) return;

    let pendingAction = null;

    function openModal(action, itemName, itemType) {
        pendingAction = action;
        if (itemName) {
            message.textContent = 'Tem certeza que deseja excluir ' + (itemType || 'o item') + ' "' + itemName + '"? Esta ação não pode ser desfeita.';
        } else {
            message.textContent = 'Tem certeza que deseja excluir ' + (itemType || 'este item') + '? Esta ação não pode ser desfeita.';
        }
        modal.style.display = 'flex';
    }

    function closeModal() {
        modal.style.display = 'none';
        pendingAction = null;
    }

    confirmBtn.addEventListener('click', function () {
        if (pendingAction) pendingAction();
        closeModal();
    });

    cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    document.querySelectorAll('.open-delete-modal').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var url = btn.dataset.deleteUrl;
            var formId = btn.dataset.deleteForm;
            var itemName = btn.dataset.itemName || '';
            var itemType = btn.dataset.itemType || '';

            var action;
            if (formId) {
                action = function () {
                    var form = document.getElementById(formId);
                    if (form) form.submit();
                };
            } else if (url) {
                action = function () {
                    window.location.href = url;
                };
            }

            openModal(action, itemName, itemType);
        });
    });
})();
