document.getElementById('menu-toggle')?.addEventListener('click',function(){if(window.matchMedia('(min-width: 992px)').matches){const hidden=document.body.classList.toggle('sidebar-collapsed');this.setAttribute('aria-expanded',String(!hidden));}else{bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebar')).toggle();}});

let pendingConfirmation = null;
document.addEventListener('submit', function (event) {
    const form = event.target.closest('form[data-confirm]');
    if (!form || form.dataset.confirmed === 'true') return;
    event.preventDefault();
    pendingConfirmation = form;
    document.getElementById('confirmModalMessage').textContent = form.dataset.confirm;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmModal')).show();
});
document.getElementById('confirmModalAccept')?.addEventListener('click', function () {
    if (!pendingConfirmation) return;
    const form = pendingConfirmation;
    pendingConfirmation = null;
    form.dataset.confirmed = 'true';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmModal')).hide();
    form.requestSubmit();
});

let prerequisiteIndex = 1000;
document.getElementById('add-prerequisite')?.addEventListener('click', function () {
    const template = document.getElementById('prerequisite-template');
    const container = document.getElementById('prerequisite-rows');
    const fragment = template.content.cloneNode(true);
    const index = prerequisiteIndex++;
    fragment.querySelectorAll('[name]').forEach(function (field) {
        field.name = field.name.replace('[INDEX]', '[' + index + ']');
    });
    container.append(fragment);
});
document.addEventListener('click', function (event) {
    const button = event.target.closest('.remove-prerequisite');
    if (button) button.closest('.prerequisite-row').remove();
});
