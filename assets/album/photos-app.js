(function () {
  var photos = Array.isArray(window.ALBUM_PHOTOS) ? window.ALBUM_PHOTOS.slice() : [];
  var grid = document.getElementById('albumGrid');
  var filters = document.getElementById('albumFilters');
  var searchInput = document.getElementById('albumSearch');
  var meta = document.getElementById('albumMeta');
  var tpl = document.getElementById('albumCardTpl');

  if (!grid || !filters || !searchInput || !meta || !tpl) return;

  var lightbox = document.getElementById('albumLightbox');
  var lightboxImg = document.getElementById('albumLightboxImg');
  var lightboxCaption = document.getElementById('albumLightboxCaption');
  var btnPrev = lightbox && lightbox.querySelector('.album-lightbox-prev');
  var btnNext = lightbox && lightbox.querySelector('.album-lightbox-next');
  var btnClose = lightbox && lightbox.querySelector('.album-lightbox-close');

  var state = {
    category: '全部',
    query: '',
    list: photos,
    activeIndex: -1
  };

  function getCategories() {
    var set = new Set(['全部']);
    photos.forEach(function (item) {
      if (item && item.category) set.add(item.category);
    });
    return Array.from(set);
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function matches(item, q) {
    if (!q) return true;
    var haystack = [item.title, item.description, item.category, (item.tags || []).join(' ')].join(' ');
    return normalize(haystack).indexOf(q) >= 0;
  }

  function filteredList() {
    var q = normalize(state.query.trim());
    return photos.filter(function (item) {
      var okCategory = state.category === '全部' || item.category === state.category;
      return okCategory && matches(item, q);
    });
  }

  function renderMeta(total, shown) {
    meta.textContent = '共 ' + total + ' 张，当前显示 ' + shown + ' 张';
  }

  function renderFilters() {
    var cats = getCategories();
    filters.innerHTML = '';
    cats.forEach(function (cat) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'album-filter' + (cat === state.category ? ' is-active' : '');
      btn.textContent = cat;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', cat === state.category ? 'true' : 'false');
      btn.addEventListener('click', function () {
        state.category = cat;
        render();
      });
      filters.appendChild(btn);
    });
  }

  function openLightbox(index) {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    state.activeIndex = index;
    var item = state.list[index];
    if (!item) return;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.title || 'photo';
    lightboxCaption.textContent = (item.title || '') + (item.description ? ' · ' + item.description : '');
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    state.activeIndex = -1;
  }

  function stepLightbox(offset) {
    if (state.activeIndex < 0 || state.list.length === 0) return;
    var next = (state.activeIndex + offset + state.list.length) % state.list.length;
    openLightbox(next);
  }

  function renderCards(list) {
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();

    list.forEach(function (item, index) {
      var node = tpl.content.cloneNode(true);
      var img = node.querySelector('.album-thumb');
      var btn = node.querySelector('.album-thumb-btn');
      var title = node.querySelector('.album-title');
      var desc = node.querySelector('.album-desc');
      var tags = node.querySelector('.album-tags');

      img.src = item.src;
      img.alt = item.title || 'photo';
      title.textContent = item.title || '未命名';
      desc.textContent = item.description || '';

      (item.tags || []).forEach(function (t) {
        var span = document.createElement('span');
        span.className = 'album-tag';
        span.textContent = t;
        tags.appendChild(span);
      });

      btn.addEventListener('click', function () {
        openLightbox(index);
      });

      frag.appendChild(node);
    });

    if (list.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'album-empty';
      empty.textContent = '没有匹配结果，试试更换分类或关键词。';
      frag.appendChild(empty);
    }

    grid.appendChild(frag);
  }

  function render() {
    state.list = filteredList();
    renderFilters();
    renderMeta(photos.length, state.list.length);
    renderCards(state.list);
  }

  searchInput.addEventListener('input', function (e) {
    state.query = e.target.value || '';
    render();
  });

  if (btnClose) btnClose.addEventListener('click', closeLightbox);
  if (btnPrev) btnPrev.addEventListener('click', function () { stepLightbox(-1); });
  if (btnNext) btnNext.addEventListener('click', function () { stepLightbox(1); });

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  render();
})();
