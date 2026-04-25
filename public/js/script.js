const accordionCollapseElementList = document.querySelectorAll(
  "#myAccordion .collapse",
);
const accordionCollapseList = [...accordionCollapseElementList].map(
  (accordionCollapseEl) => new bootstrap.Collapse(accordionCollapseEl),
);
