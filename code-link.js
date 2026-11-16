/* GITHUB CODE LINK: set the public repository URL below when code is released.
 * Example: const CODE_URL = "https://github.com/YOUR_NAME/YOUR_CODE_REPOSITORY";
 * Keep it empty to show Coming soon without navigating anywhere.
 * Edit light_revision/code-link.js and run build_github_pages.py to sync
 * github_pages/ and the deployment ZIP. For an already uploaded website,
 * edit code-link.js in that website's root and keep the local copy in sync.
 */
const CODE_URL = "";

(() => {
  const link = document.getElementById('code-link');
  if (!link) return;
  let destination = null;
  try {
    const url = new URL(CODE_URL.trim());
    if (url.protocol === 'https:' || url.protocol === 'http:') destination = url.href;
  } catch (_) {
    // An empty or incomplete URL keeps the placeholder inactive.
  }
  if (!destination) {
    link.addEventListener('click', event => event.preventDefault());
    return;
  }
  link.href = destination;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.removeAttribute('aria-disabled');
  link.removeAttribute('role');
  link.removeAttribute('tabindex');
  link.title = 'Open the GitHub code repository in a new tab';
  const status = link.querySelector('.code-link-status');
  if (status) status.hidden = true;
})();
