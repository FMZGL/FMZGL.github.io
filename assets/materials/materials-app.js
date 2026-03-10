(function () {
  var folders = Array.isArray(window.MATERIALS_DATA) ? window.MATERIALS_DATA.slice() : [];
  var folderGrid = document.getElementById('materialsFolderGrid');
  var fileList = document.getElementById('materialsFileList');
  var emptyBlock = document.getElementById('materialsEmpty');
  var breadcrumb = document.getElementById('materialsBreadcrumb');
  var currentFolder = document.getElementById('materialsCurrentFolder');
  var backBtn = document.getElementById('materialsBackBtn');

  if (!folderGrid || !fileList || !emptyBlock || !breadcrumb || !currentFolder || !backBtn) {
    return;
  }

  var state = {
    activeFolderId: null
  };

  function getActiveFolder() {
    return folders.find(function (folder) {
      return folder.id === state.activeFolderId;
    }) || null;
  }

  function getFileName(path) {
    return decodeURIComponent(String(path || '').split('/').pop() || '');
  }

  function renderFolderGrid() {
    folderGrid.innerHTML = '';

    if (state.activeFolderId) {
      folderGrid.classList.add('is-hidden');
      return;
    }

    folderGrid.classList.remove('is-hidden');

    folders.forEach(function (folder) {
      var article = document.createElement('article');
      var count = Array.isArray(folder.files) ? folder.files.length : 0;

      article.className = 'materials-folder-card';
      article.innerHTML =
        '<button class="materials-folder-open" type="button">' +
          '<span class="materials-folder-icon"></span>' +
          '<span class="materials-folder-title">' + folder.title + '</span>' +
          '<span class="materials-folder-count">' + count + ' 个文件</span>' +
        '</button>';

      article.querySelector('.materials-folder-open').addEventListener('click', function () {
        state.activeFolderId = folder.id;
        render();
      });

      folderGrid.appendChild(article);
    });
  }

  function renderFiles() {
    var folder = getActiveFolder();
    var files = folder && Array.isArray(folder.files) ? folder.files : [];

    fileList.innerHTML = '';

    if (!folder) {
      emptyBlock.textContent = '点击一个文件夹进入查看文件。';
      emptyBlock.style.display = 'block';
      return;
    }

    if (files.length === 0) {
      emptyBlock.textContent = '这个文件夹里还没有文件。';
      emptyBlock.style.display = 'block';
      return;
    }

    emptyBlock.style.display = 'none';

    files.forEach(function (filePath) {
      var item = document.createElement('li');
      item.className = 'materials-file-item';
      item.innerHTML =
        '<a class="materials-file-link" href="' + filePath + '" target="_blank" rel="noopener">' +
          '<span class="materials-file-name">' + getFileName(filePath) + '</span>' +
        '</a>';
      fileList.appendChild(item);
    });
  }

  function renderHeader() {
    var folder = getActiveFolder();
    currentFolder.textContent = folder ? folder.title : '全部文件夹';
    breadcrumb.textContent = folder ? '资料库 / ' + folder.title : '资料库';
    backBtn.disabled = !folder;
  }

  function render() {
    renderFolderGrid();
    renderFiles();
    renderHeader();
  }

  backBtn.addEventListener('click', function () {
    state.activeFolderId = null;
    render();
  });

  render();
})();
