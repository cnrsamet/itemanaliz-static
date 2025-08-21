const imageService = {
  getFullImageUrl(imagePath) {
    if (!imagePath) return null;

    // eğer zaten tam URL ise direkt döndür
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // /images/ ile başlıyorsa direkt döndür
    if (imagePath.startsWith("/images/")) {
      return imagePath;
    }

    // json'dan gelen görsel yolları için
    if (
      imagePath.startsWith("icon-") ||
      imagePath.includes(".png") ||
      imagePath.includes(".jpg") ||
      imagePath.includes(".jpeg")
    ) {
      return `/images/${imagePath}`;
    }

    // default durum
    return `/images/${imagePath}`;
  },
};

export default imageService;
