// loader.js

export function showLoader(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const loader = document.createElement('div');
  loader.id = 'spinner';
  loader.style.textAlign = 'center';
  loader.innerHTML = `
    <img src="../img/coconut-02-svgrepo-com.svg" alt="Loading..." 
         style="width: 40px; animation: spin 1s linear infinite; margin-top: 1rem;" />
  `;
  container.appendChild(loader);
}

export function hideLoader() {
  const loader = document.getElementById('spinner');
  if (loader) loader.remove();
}
