/* ============================================================
   图片：前端压缩 + 图床上传
   ============================================================ */
const IMGBB_KEY = 'REPLACE_WITH_IMGBB_KEY';   // ← 图床 key（拿到后替换）
const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';

/**
 * 压缩图片：最长边 720px，JPEG 0.72
 * @returns {Promise<string>} dataURL
 */
function compressImage(file, maxSide = 720, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) {
      reject(new Error('请选择图片文件'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w > h && w > maxSide) { h = Math.round(h * maxSide / w); w = maxSide; }
        else if (h >= w && h > maxSide) { w = Math.round(w * maxSide / h); h = maxSide; }
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('图片读取失败'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.readAsDataURL(file);
  });
}

/** 上传到 imgbb，返回图片 URL */
async function uploadImage(dataURL) {
  if (IMGBB_KEY === 'REPLACE_WITH_IMGBB_KEY') {
    throw new Error('图床还没配置，请联系管理员');
  }
  const base64 = dataURL.split(',')[1];
  const form = new FormData();
  form.append('image', base64);

  const res = await fetch(IMGBB_ENDPOINT + '?key=' + IMGBB_KEY, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  if (!data.success) throw new Error('图片上传失败，请重试');
  // 优先用中等尺寸，列表更轻
  return data.data.medium?.url || data.data.url;
}
