// src/utils/fileExport.js
export async function exportJson(data, filename = 'deliveryRequests.json') {
  try {
    const text = JSON.stringify(data, null, 2);
    const blob = new Blob([text], { type: 'application/json' });

    // 1) 모바일 공유(가능할 때만)
    let fileObj;
    try {
      fileObj = new File([blob], filename, { type: 'application/json' });
    } catch {
      fileObj = null; // 일부 브라우저는 File 생성 미지원
    }
    if (
      fileObj &&
      typeof navigator !== 'undefined' &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [fileObj] })
    ) {
      await navigator.share({ files: [fileObj], title: filename, text: 'Exported from DeliveryRequest' });
      return true;
    }

    // 2) 폴백: 다운로드
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  } catch (err) {
    console.error('[exportJson] 실패:', err);
    alert('파일 저장에 실패했습니다.');
    return false;
  }
}
