document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.getElementById("customCursor");

  if (!cursor) return; // Exit if the element isn't found

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
});
