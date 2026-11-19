/* PAPER LINK: add the final paper URL on the next configuration line.
 * Example: const PAPER_URL = "https://arxiv.org/abs/YOUR_PAPER_ID";
 * Leave it empty until publication; the button stays visible but inactive.
 * Edit light_revision/paper-link.js, then run build_github_pages.py to sync
 * github_pages/ and the deployment ZIP. If editing an already uploaded
 * website directly, change paper-link.js in that website's root instead.
 */
const PAPER_URL = "https://arxiv.org/pdf/2611.24004";

(() => {
  const link = document.getElementById('paper-link');
  if (!link) return;
  let destination = null;
  try {
    const url = new URL(PAPER_URL.trim());
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
  link.title = 'Open the paper in a new tab';
  const status = link.querySelector('.paper-link-status');
  if (status) status.hidden = true;
})();
