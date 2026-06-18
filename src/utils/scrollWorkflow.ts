const SCROLL_PADDING_PX = 8

type ScrollWorkflowOptions = {
  expandedSection: string | null
  expandedSectionEl?: HTMLElement | null
}

function scrollMainTo(mainEl: HTMLElement, top: number) {
  const maxScroll = Math.max(0, mainEl.scrollHeight - mainEl.clientHeight)

  mainEl.scrollTo({
    top: Math.min(maxScroll, Math.max(0, top)),
    behavior: 'smooth',
  })
}

function scrollMainToBottom(mainEl: HTMLElement) {
  mainEl.scrollTop = Math.max(0, mainEl.scrollHeight - mainEl.clientHeight)
}

function elementTopInScrollContainer(
  container: HTMLElement,
  element: HTMLElement,
) {
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  return elementRect.top - containerRect.top + container.scrollTop
}

function scrollElementToCenter(mainEl: HTMLElement, element: HTMLElement) {
  const elementTop = elementTopInScrollContainer(mainEl, element)
  const elementHeight = element.offsetHeight
  const viewportHeight = mainEl.clientHeight
  const elementCenter = elementTop + elementHeight / 2
  const centeredScrollTop = elementCenter - viewportHeight / 2

  scrollMainTo(mainEl, centeredScrollTop - SCROLL_PADDING_PX / 2)
}

export function applyWorkflowScroll(
  mainEl: HTMLElement,
  { expandedSection, expandedSectionEl }: ScrollWorkflowOptions,
) {
  if (!expandedSection) {
    scrollMainToBottom(mainEl)
    return
  }

  if (!expandedSectionEl) {
    scrollMainToBottom(mainEl)
    return
  }

  scrollElementToCenter(mainEl, expandedSectionEl)
}
