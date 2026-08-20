import type { PixelCrop } from 'react-image-crop';

/**
 * 캔버스를 이용해 이미지를 크롭하고 File 객체로 반환합니다.
 */
export const getCroppedImg = async (
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  fileName: string = 'cropped.jpg'
): Promise<File | null> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // 화면 렌더링 크기와 실제 이미지 크기 간의 배율 계산
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // 디바이스 픽셀 비율 고려 (레티나 디스플레이 등 고해상도 대응)
  const pixelRatio = window.devicePixelRatio;

  // 캔버스의 실제 픽셀 크기를 디바이스 픽셀 비율과 배율에 맞게 설정
  canvas.width = Math.floor(pixelCrop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(pixelCrop.height * scaleY * pixelRatio);

  // 컨텍스트에 픽셀 비율 스케일 적용
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = pixelCrop.x * scaleX;
  const cropY = pixelCrop.y * scaleY;
  const cropWidth = pixelCrop.width * scaleX;
  const cropHeight = pixelCrop.height * scaleY;

  // 원본 이미지에서 배율이 적용된 크롭 영역만큼 잘라서 캔버스에 그리기
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg');
  });
};
