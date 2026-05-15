// ============ TYPE: AUDIO ============
function makeAudioData() {
  return { url: '' };
}

function renderAudioBody(msg, body) {
  body.classList.add('msg-upload-body');

  if (!msg.data.url) {
    const zone = makeUploadEmptyZone({
      primaryText: '點擊上傳檔案 或選取檔案放入',
      secondaryText: '限 MP3, M4A, WAV',
      onClick: () => triggerUpload(msg, 'audio/*'),
      onDrop: (file) => {
        if (!file.type.startsWith('audio/')) return;
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
  const audioWrap = document.createElement('div');
  audioWrap.className = 'msg-upload-audio';
  const audio = document.createElement('audio');
  audio.src = msg.data.url;
  audio.controls = true;
  audioWrap.appendChild(audio);
  preview.appendChild(audioWrap);
  preview.appendChild(makeUploadControls({
    replaceLabel: '替換音訊',
    removeLabel: '移除音訊',
    onReplace: () => triggerUpload(msg, 'audio/*'),
    onRemove: () => { msg.data.url = ''; renderMessages(); },
  }));
  body.appendChild(preview);
}
