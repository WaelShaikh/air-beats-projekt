function isMobile() {
  return (
    /Android/i.test(navigator.userAgent) ||
    /iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

class Camera {
  constructor() {
    this.video = document.getElementById("video");
    // this.video = video;
  }

  static async setupCamera(cameraParam) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }

    const { targetFPS, size } = cameraParam;
    const videoConfig = {
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: isMobile() ? 360 : size.width },
        height: { ideal: isMobile() ? 270 : size.height },
        frameRate: {
          ideal: targetFPS
        }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    const camera = new Camera();
    camera.video.srcObject = stream;

    await new Promise((resolve) => {
      camera.video.onloadedmetadata = (video) => {
        resolve(video);
      };
    });

    camera.video.play();

    const videoWidth = camera.video.videoWidth;
    const videoHeight = camera.video.videoHeight;
    camera.video.width = videoWidth;
    camera.video.height = videoHeight;

    return camera;
  }
}
