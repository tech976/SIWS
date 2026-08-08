/**
 * Shown on every page while draft mode is on.
 *
 * Draft mode is a session-long cookie, so without a visible marker a member of
 * staff who previewed one page would keep seeing unpublished content across the
 * whole site — and could easily report a draft as though it were live. The
 * banner says which it is and offers the way out.
 *
 * Rendered inside the live-preview iframe too, where it doubles as confirmation
 * that the preview is genuinely showing the draft.
 */
export const PreviewBanner = () => (
  <div
    // `status`, not `alert`: this is ambient context, and an assertive live
    // region would interrupt a screen-reader user on every page load.
    role="status"
    className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-brand px-4 py-2.5 text-center text-sm text-white"
  >
    <span className="font-semibold">
      Draft preview — this is how the page will look once published.
    </span>
    <span className="text-white/80">Visitors cannot see this yet.</span>
    <a
      href="/next/exit-preview"
      className="font-semibold text-accent underline underline-offset-4 hover:text-white"
    >
      Exit preview
    </a>
  </div>
)
