// ============ TYPE: IMAGE ============
function makeImageData() {
  return { url: '' };
}

function renderImageBody(msg, body) {
  body.classList.add('msg-upload-body');

  if (!msg.data.url) {
    const zone = makeUploadEmptyZone({
      primaryText: '點擊上傳檔案 或選取檔案放入',
      secondaryText: '限 JPG, JPEG or PNG，檔案上限 1MB',
      onClick: () => triggerUpload(msg, 'image/*'),
      onDrop: (file) => {
        if (!file.type.startsWith('image/')) return;
        readFileAsDataUrl(file).then(url => {
          msg.data.url = url;
          renderMessages();
        });
      },
    });
    body.appendChild(zone);
    return;
  }

  const preview = document.createElement('div');
  preview.className = 'msg-upload-preview';
  const img = document.createElement('img');
  img.src = msg.data.url;
  img.alt = '';
  preview.appendChild(img);
  preview.appendChild(makeUploadControls({
    replaceLabel: '替換圖片',
    removeLabel: '移除圖片',
    onReplace: () => triggerUpload(msg, 'image/*'),
    onRemove: () => { msg.data.url = ''; renderMessages(); },
  }));
  body.appendChild(preview);
}
