window.addEventListener("load", () => {
  const stripes = document.getElementById("background-stripes");
  if (!stripes) return;

  // 初回 flow-in アニメ
  stripes.classList.add("flow-in");

  // スクロール連動
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const offset = scrollY * 0.2; // 調整可
    stripes.style.transform = `translate(${offset}px, ${offset}px)`;
    lastScrollY = scrollY;
  });
});