const generateAvatarUrl = (width, height, fontSize, avatarId, username) => {
  if (avatarId) {
    return `http://localhost:3000/api/img/avatar/${avatarId}`
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = "#fff";
      ctx.font = `${fontSize}px monosapce`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const firstLetter = username.charAt(0);
      const measure = ctx.measureText(firstLetter);
      const h = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
      ctx.fillText(firstLetter, width / 2, width / 2 - h / 2);
      return canvas.toDataURL();
    }
  }
}

export default generateAvatarUrl;