import "./style.css";
import { Emerald, Scene, SceneManager, FPSCounter, Color, GameObject, Vector3, Vector2, Texture } from "emeraldengine";
import logo from "./assets/logo.png";
window.onload = () => {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  const getCanvasDimensions = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const { width: initialWidth, height: initialHeight } = getCanvasDimensions();
  canvas.width = initialWidth;
  canvas.height = initialHeight;

  const emerald = new Emerald(canvas);
  emerald.setBackgroundColor(new Color(1, 68, 44, 255));
  const fpsCounter = new FPSCounter();
  const scene = new Scene();
  SceneManager.setScene(scene);

  const logoGameObject = new GameObject(
    "Logo",
    new Vector3(0, 0, 0),
    0,
    new Vector2(128, 128)
  );
  logoGameObject.addComponent(
    new Texture(logo, 32, 32, 8, 8, 120, true, true, true)
  );
  scene.add(logoGameObject);

  let lastTime = 0;

  const handleResize = () => {
    const { width, height } = getCanvasDimensions();
    emerald.resize(width, height);
  };
  window.addEventListener("resize", handleResize);

  const animate = (currentTime) => {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    fpsCounter.update();
    emerald.drawScene(scene, deltaTime);
    requestAnimationFrame(animate);
  };
  animate(0);

  window.addEventListener("beforeunload", () => {
    window.removeEventListener("resize", handleResize);
  });
};
