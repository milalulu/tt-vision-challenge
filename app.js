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

const modules = {
 main: ['01','РАБОЧЕЕ МЕСТО ОПЕРАТОРА','Все камеры в одном окне','Разместите окна камер в удобном макете, наблюдайте за изображением и управляйте записью матча.',['Настраиваемое расположение окон','Выбор источников изображения','Запись REC и переход в Review']],
 review: ['02','ВНИМАНИЕ К ДЕТАЛЯМ','Рассмотрите момент по кадрам','Выберите камеру на карте, остановите изображение и сравните эпизод в двух ракурсах с помощью Split.',['Покадровые шаги и замедление','Маркеры для возврата к эпизоду','Сохранение 25 секунд от выбранного кадра']],
 controller: ['03','ОТДЕЛЬНОЕ УСТРОЙСТВО','Управляйте ходом матча','Работайте со счётом и составами с отдельного пульта, пока оператор занимается камерами и повторами.',['Подключение к основному компьютеру','Управление счётом и составами','Вывод информации матча на Broadcast']],
 broadcast: ['04','ДЛЯ ЗРИТЕЛЕЙ НА ПЛОЩАДКЕ','Информация на большом экране','Показывайте счёт и составы на выбранном дисплее. Во время пауз выводите подготовленные изображения и видеоролики.',['Вывод на отдельный монитор или LED','Оформление счёта и команд','Фото и видео для пауз']]
};
document.querySelectorAll('[data-module]').forEach(button => button.addEventListener('click', () => {
 const m = modules[button.dataset.module];
 document.querySelectorAll('[data-module]').forEach(item => {item.classList.toggle('selected',item===button);item.setAttribute('aria-pressed',String(item===button));});
 ['module-number','module-role','module-title','module-copy'].forEach((id,i)=>document.getElementById(id).textContent=m[i]);
 document.getElementById('module-features').replaceChildren(...m[4].map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
}));
const dialog=document.getElementById('image-dialog');
['full-image','image-link'].forEach(id=>document.getElementById(id).addEventListener('click',event=>{
 event.preventDefault();const source=document.getElementById('interface-image');const target=document.getElementById('dialog-image');target.src=source.src;target.alt=source.alt;dialog.showModal();
}));
document.getElementById('close-image').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.getElementById('config-form').addEventListener('submit',event=>{
 event.preventDefault();const data=new FormData(event.currentTarget);const text=['TT Vision Challenge — описание задачи','',`Вид спорта: ${String(data.get('sport')).trim()}`,`Камеры: ${data.get('cameras')}`,`Нужные функции: ${data.getAll('feature').join(', ') || 'Обсудить при подборе'}`,'','Совместимость и возможности конфигурации требуют уточнения.'].join('\r\n');
 const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='TT-Vision-Task.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('config-status').textContent='Описание подготовлено и передано браузеру для скачивания.';
});
