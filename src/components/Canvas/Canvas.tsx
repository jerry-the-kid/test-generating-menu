import { useRef, useCallback, useState, useMemo } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import {
  useDoc,
  useMenuActions,
  usePages,
  useTypography,
} from "../../store/menuStore";
import { resolvePageDimensions, MM_TO_PX } from "../../store/helpers";
import { AreaRenderer } from "./AreaRenderer";
import { SectionContent } from "./SectionContent";
import { SectionHeader } from "./SectionHeader";
import { CanvasToolbar } from "./CanvasToolbar";
import { PageTabs } from "./PageTabs";
import { MeasurementLayer } from "./MeasurementLayer";
import type { Page, Section } from "../../store/types";
import { SECTION_FRAME, SECTION_FRAME_DRAGGING, cx } from "./styles";

export function Canvas() {
  const doc = useDoc();
  const pages = usePages();
  const typography = useTypography();
  const { moveSection, selectSection, selectArea, selectBlock, recalculatePages } = useMenuActions();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const dims = resolvePageDimensions(doc.page);
  const paddingStyle = {
    paddingTop: `${doc.page.padding.top * MM_TO_PX}px`,
    paddingRight: `${doc.page.padding.right * MM_TO_PX}px`,
    paddingBottom: `${doc.page.padding.bottom * MM_TO_PX}px`,
    paddingLeft: `${doc.page.padding.left * MM_TO_PX}px`,
  };

  const stableHeights = useRef<Map<string, number>>(new Map());

  const handleHeightsChange = useCallback(
    (heights: Map<string, number>) => {
      stableHeights.current = heights;
      recalculatePages(heights);
    },
    [recalculatePages],
  );

  // useMemo critical: flatMap returns a new array each render — without this,
  // MeasurementLayer's effect fires every render → recalculatePages → infinite loop.
  const allSections = useMemo(
    () => doc.areas.flatMap((a) => a.sections),
    [doc.areas],
  );

  const contentWidthPx =
    dims.widthPx - (doc.page.padding.left + doc.page.padding.right) * MM_TO_PX;

  const sectionById = new Map<string, Section>();
  for (const area of doc.areas) {
    for (const section of area.sections) {
      sectionById.set(section.id, section);
    }
  }

  const areaById = new Map(doc.areas.map((a) => [a.id, a]));

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

  const activeDragSection = activeDragId ? sectionById.get(activeDragId) : null;

  return (
    <div className="flex flex-col h-full flex-1">
      <MeasurementLayer
        sections={allSections}
        pageContentWidthPx={contentWidthPx}
        onHeightsChange={handleHeightsChange}
        styles={
          {
            "--global-scale": typography.scaleFactor,
            "--global-line-height": typography.lineHeight,
          } as React.CSSProperties
        }
      />
      <CanvasToolbar />
      <PageTabs />
      <div
        className="flex-1 overflow-auto p-8 bg-gray-200 flex flex-col items-center gap-8"
        onClick={() => {
          selectBlock(null);
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
              className="flex-shrink-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)] rounded-sm relative overflow-hidden"
              style={
                {
                  width: `${dims.widthPx}px`,
                  height: `${dims.heightPx}px`,
                  "--global-scale": typography.scaleFactor,
                  "--global-line-height": typography.lineHeight,
                } as React.CSSProperties
              }
            >
              <div
                className="flex flex-col h-full box-border"
                style={{ ...paddingStyle, gap: `${doc.page.gap}px` }}
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
                      gapPx={doc.page.gap}
                    />
                  );
                })}
                {doc.areas.length === 0 && (
                  <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
                    <p>No areas yet — add an area to get started.</p>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-[22px] right-0 text-[11px] text-gray-400 select-none">
                Page {page.index + 1}
              </span>
            </div>
          ))}
          <DragOverlay>
            {activeDragSection && (
              <div
                className={cx(SECTION_FRAME, SECTION_FRAME_DRAGGING)}
                style={{ width: `${contentWidthPx}px` }}
              >
                <SectionHeader section={activeDragSection} />
                <SectionContent section={activeDragSection} />
              </div>
            )}
          </DragOverlay>
        </DragDropProvider>
      </div>
    </div>
  );
}
