import { useRef, useCallback, useState, useMemo } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import { useMenuStore } from "../../store/menuStore";
import { resolvePageDimensions, MM_TO_PX } from "../../store/helpers";
import { SectionContent } from "./SectionContent";
import { SectionToolbar } from "./SectionToolbar";
import { CanvasToolbar } from "./CanvasToolbar";
import { PageTabs } from "./PageTabs";
import { MeasurementLayer } from "./MeasurementLayer";
import type { Area, Page, Section } from "../../store/types";
import "./Canvas.css";

function SortableSection({
  section,
  index,
}: {
  section: Section;
  index: number;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: section.id,
    index,
    type: "section",
    accept: ["section"],
    disabled: section.locked,
  });

  const selectSection = useMenuStore((s) => s.selectSection);
  const selectedSectionId = useMenuStore((s) => s.selectedSectionId);
  const isSelected = selectedSectionId === section.id;

  return (
    <div
      ref={ref}
      className={[
        "section-frame",
        isDragging && "dragging",
        section.locked && "locked",
        isSelected && "selected",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: "100%" }}
      onClick={(e) => {
        e.stopPropagation();
        selectSection(section.id);
      }}
    >
      <div className="section-header">
        {!section.locked && (
          <div ref={handleRef} className="drag-handle" title="Drag to reorder">
            ⠿
          </div>
        )}
        {section.locked && (
          <div className="lock-badge" title="Locked">
            🔒
          </div>
        )}
        <span className="section-type-label">
          {section.type.replace(/_/g, " ")}
        </span>
      </div>
      <SectionContent section={section} />
      {isSelected && !section.locked && (
        <SectionToolbar sectionId={section.id} />
      )}
    </div>
  );
}

function AreaRenderer({
  area,
  sectionIds,
  sectionById,
  gapPx,
}: {
  area: Area;
  sectionIds: string[];
  sectionById: Map<string, Section>;
  gapPx: number;
}) {
  const selectArea = useMenuStore((s) => s.selectArea);
  const selectedAreaId = useMenuStore((s) => s.selectedAreaId);
  const isSelected = selectedAreaId === area.id;

  const sections = sectionIds
    .map((id) => sectionById.get(id))
    .filter((s): s is Section => !!s);

  return (
    <div
      className={[
        "area-frame",
        `area-type-${area.type}`,
        isSelected && "area-selected",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(area.height !== "auto" ? { height: `${area.height}px`, overflow: "hidden" } : {}),
        gap: `${gapPx}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectArea(area.id);
      }}
    >
      <div className="area-header">
        <span className={`area-type-badge area-badge-${area.type}`}>
          {area.type}
        </span>
        <span className="area-name">{area.name}</span>
      </div>
      <div className="area-content" style={{ gap: `${gapPx}px` }}>
        {sections.map((section, index) => (
          <SortableSection
            key={section.id}
            section={section}
            index={index}
          />
        ))}
        {sections.length === 0 && (
          <div className="area-empty">
            No sections — add one to this area
          </div>
        )}
      </div>
    </div>
  );
}

export function Canvas() {
  const doc = useMenuStore((s) => s.doc);
  const pages = useMenuStore((s) => s.doc.pages);
  const typography = useMenuStore((s) => s.doc.typography);
  const moveSection = useMenuStore((s) => s.moveSection);
  const selectSection = useMenuStore((s) => s.selectSection);
  const selectArea = useMenuStore((s) => s.selectArea);
  const recalculatePages = useMenuStore((s) => s.recalculatePages);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const dims = resolvePageDimensions(doc.page);
  const paddingStyle = {
    paddingTop: `${doc.page.padding.top * MM_TO_PX}px`,
    paddingRight: `${doc.page.padding.right * MM_TO_PX}px`,
    paddingBottom: `${doc.page.padding.bottom * MM_TO_PX}px`,
    paddingLeft: `${doc.page.padding.left * MM_TO_PX}px`,
  };

  // Stable heights ref — avoids setState re-render loop
  const stableHeights = useRef<Map<string, number>>(new Map());

  // Stable callback so MeasurementLayer's useEffect doesn't fire on every render
  const handleHeightsChange = useCallback(
    (heights: Map<string, number>) => {
      stableHeights.current = heights;
      recalculatePages(heights);
    },
    [recalculatePages],
  );

  // Collect all sections from all areas for the MeasurementLayer
  // useMemo is critical: flatMap always returns a new array, so without memoization
  // MeasurementLayer's useEffect fires every render → recalculatePages → infinite loop.
  // doc.areas keeps the same reference after recalculatePages (immer only replaces doc.pages),
  // so this stays stable unless areas actually change.
  const allSections = useMemo(
    () => doc.areas.flatMap((a) => a.sections),
    [doc.areas],
  );

  // Compute content width for measurement (same width used in page-content)
  const contentWidthPx =
    dims.widthPx - (doc.page.padding.left + doc.page.padding.right) * MM_TO_PX;

  // Build a flat section map for lookups
  const sectionById = new Map<string, Section>();
  for (const area of doc.areas) {
    for (const section of area.sections) {
      sectionById.set(section.id, section);
    }
  }

  // Build area map
  const areaById = new Map(doc.areas.map((a) => [a.id, a]));

  // Effective pages — if no computed pages yet, show one page with all content
  const effectivePages: Page[] =
    pages.length > 0
      ? pages
      : [
          {
            id: "init",
            index: 0,
            areaContents: doc.areas.map((area) => ({
              areaId: area.id,
              sectionIds: area.sections.map((s) => s.id),
            })),
          },
        ];

  return (
    <div className="canvas-wrapper">
      <MeasurementLayer
        sections={allSections}
        pageContentWidthPx={contentWidthPx}
        onHeightsChange={handleHeightsChange}
        styles={{  '--global-scale': typography.scaleFactor,
                '--global-line-height': typography.lineHeight,
               } as React.CSSProperties}
      />
      <CanvasToolbar />
      <PageTabs />
      <div
        className="canvas-viewport"
        onClick={() => {
          selectSection(null);
          selectArea(null);
        }}
      >
        <DragDropProvider
          onDragStart={(event) => {
            setActiveDragId(String(event.operation.source?.id ?? ""));
          }}
          onDragEnd={(event) => {
            setActiveDragId(null);
            if (event.canceled) return;
            const { source } = event.operation;
            if (isSortable(source)) {
              const { initialIndex, index } = source;
              if (initialIndex !== index) moveSection(String(source.id), index);
            }
          }}
        >
          {effectivePages.map((page) => (
            <div
              key={page.id}
              id={`page-${page.index}`}
              className="page"
              style={{
                width: `${dims.widthPx}px`,
                height: `${dims.heightPx}px`,
                '--global-scale': typography.scaleFactor,
                '--global-line-height': typography.lineHeight,
              } as React.CSSProperties}
            >
              <div
                className="page-content"
                style={{ ...paddingStyle, gap: `${doc.grid.gap}px` }}
              >
                {page.areaContents.map((ac) => {
                  const area = areaById.get(ac.areaId);
                  if (!area) return null;
                  return (
                    <AreaRenderer
                      key={`${page.id}-${ac.areaId}`}
                      area={area}
                      sectionIds={ac.sectionIds}
                      sectionById={sectionById}
                      gapPx={doc.grid.gap}
                    />
                  );
                })}
                {doc.areas.length === 0 && (
                  <div className="canvas-empty">
                    <p>No areas yet — add an area to get started.</p>
                  </div>
                )}
              </div>
              <span className="page-label">Page {page.index + 1}</span>
            </div>
          ))}
          <DragOverlay>
            {activeDragId &&
              (() => {
                const s = sectionById.get(activeDragId);
                return s ? (
                  <div
                    className="section-frame dragging"
                    style={{
                      width: `${dims.widthPx - (doc.page.padding.left + doc.page.padding.right) * MM_TO_PX}px`,
                    }}
                  >
                    <div className="section-header">
                      <span className="section-type-label">
                        {s.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <SectionContent section={s} />
                  </div>
                ) : null;
              })()}
          </DragOverlay>
        </DragDropProvider>
      </div>
    </div>
  );
}
