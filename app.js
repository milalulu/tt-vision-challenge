const views = {
  review: { title: 'Review · выбор ракурса на карте площадки', description: 'Карта справа переключает камеру. Под изображением находятся шкала истории, переход по кадрам, скорость, маркеры и сохранение 25 секунд.', alt: 'Настоящее окно Review с картой камер и управлением воспроизведением. Камеры не подключены.' },
  split: { title: 'Split · два ракурса рядом', description: 'Две области просмотра и общий таймлайн. В верхней строке выбираются камеры, а кнопка со стрелками меняет окна местами.', alt: 'Настоящее окно Review в режиме Split: два окна камер, общий таймлайн и карта площадки. Камеры не подключены.' }
};
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.view, view = views[key];
  document.querySelectorAll('[data-view]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  const image = document.getElementById('interface-image'); image.src = `assets/${key}.png`; image.alt = view.alt;
  document.getElementById('full-image').href = image.src; document.getElementById('image-link').href = image.src;
  document.getElementById('view-title').textContent = view.title; document.getElementById('view-description').textContent = view.description;
}));
