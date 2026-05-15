// ============ TYPE: VIDEO ============
function makeVideoData() {
  return { url: '' };
}

function renderVideoBody(msg, body) {
  body.classList.add('msg-upload-body');

  if (!msg.data.url) {
    const zone = makeUploadEmptyZone({
      primaryText: '點擊上傳檔案 或選取檔案放入',
      secondaryText: '限 MP4, MOV, WEBM',
      onClick: () => triggerUpload(msg, 'video/*'),
      onDrop: (file) => {
        if (!file.type.startsWith('video/')) return;
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
  const video = document.createElement('video');
  video.src = msg.data.url;
  video.controls = true;
  preview.appendChild(video);
  preview.appendChild(makeUploadControls({
    replaceLabel: '替換影片',
    removeLabel: '移除影片',
    onReplace: () => triggerUpload(msg, 'video/*'),
    onRemove: () => { msg.data.url = ''; renderMessages(); },
  }));
  body.appendChild(preview);
}
