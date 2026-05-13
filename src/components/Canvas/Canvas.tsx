import { useRef, useCallback, useState, useMemo } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useSortable, isSortable } from "@dnd-kit/react/sortable";
import {
  useDoc,
  useMenuActions,
  usePages,
  useSelectedAreaId,
  useSelectedSectionId,
  useTypography,
} from "../../store/menuStore";
import { resolvePageDimensions, MM_TO_PX } from "../../store/helpers";
import { SectionContent } from "./SectionContent";
import { SectionToolbar } from "./SectionToolbar";
import { CanvasToolbar } from "./CanvasToolbar";
import { PageTabs } from "./PageTabs";
import { MeasurementLayer } from "./MeasurementLayer";
import type { Area, Page, Section } from "../../store/types";
import {
  SECTION_FRAME,
  SECTION_FRAME_SELECTED,
  SECTION_FRAME_DRAGGING,
  SECTION_FRAME_LOCKED,
  SECTION_HEADER,
  DRAG_HANDLE,
  LOCK_BADGE,
  SECTION_TYPE_LABEL,
  cx,
} from "./styles";

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

  const { selectSection } = useMenuActions();
  const selectedSectionId = useSelectedSectionId();
  const isSelected = selectedSectionId === section.id;

  return (
    <div
      ref={ref}
      className={cx(
        SECTION_FRAME,
        isDragging && SECTION_FRAME_DRAGGING,
        section.locked && SECTION_FRAME_LOCKED,
        isSelected && SECTION_FRAME_SELECTED,
      )}
      style={{ width: "100%" }}
      onClick={(e) => {
        e.stopPropagation();
        selectSection(section.id);
      }}
    >
      <div className={SECTION_HEADER}>
        {!section.locked && (
          <div ref={handleRef} className={DRAG_HANDLE} title="Drag to reorder">
            ⠿
          </div>
        )}
        {section.locked && (
          <div className={LOCK_BADGE} title="Locked">
            🔒
          </div>
        )}
        <span className={SECTION_TYPE_LABEL}>
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

const AREA_FRAME_BASE =
  "border-2 rounded-[10px] p-0 relative flex flex-col transition-[border-color,box-shadow] duration-150";
const AREA_FRAME_FIXED = "border-amber-300 bg-[#fffef5]";
const AREA_FRAME_LIST = "border-blue-400 bg-[#f8fbff] flex-1 min-h-0";
const AREA_SELECTED = "shadow-[0_0_0_3px_rgba(59,130,246,0.2)]";

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
  const { selectArea } = useMenuActions();
  const selectedAreaId = useSelectedAreaId();
  const isSelected = selectedAreaId === area.id;

  const sections = sectionIds
    .map((id) => sectionById.get(id))
    .filter((s): s is Section => !!s);

  return (
    <div
      className={cx(
        AREA_FRAME_BASE,
        area.type === "fixed" ? AREA_FRAME_FIXED : AREA_FRAME_LIST,
        isSelected && AREA_SELECTED,
      )}
      style={{
        ...(area.height !== "auto" ? { height: `${area.height}px`, overflow: "hidden" } : {}),
        gap: `${gapPx}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectArea(area.id);
      }}
    >
      <div className="flex items-center gap-1.5 px-2 py-0.5 absolute -top-3 left-2 bg-inherit z-[1]">
        <span
          className={cx(
            "text-[9px] px-1.5 py-px rounded-[3px] uppercase font-semibold tracking-[0.04em]",
            area.type === "fixed"
              ? "bg-amber-100 text-amber-900"
              : "bg-blue-100 text-blue-900",
          )}
        >
          {area.type}
        </span>
        <span className="text-[11px] text-slate-500 font-medium">{area.name}</span>
      </div>
      <div className="flex flex-col flex-1 overflow-visible" style={{ gap: `${gapPx}px` }}>
        {sections.map((section, index) => (
          <SortableSection key={section.id} section={section} index={index} />
        ))}
        {sections.length === 0 && (
          <div className="flex items-center justify-center min-h-[50px] text-slate-300 text-xs">
            No sections — add one to this area
          </div>
        )}
      </div>
    </div>
  );
}

export function Canvas() {
  const doc = useDoc();
  const pages = usePages();
  const typography = useTypography();
  const { moveSection, selectSection, selectArea, recalculatePages } = useMenuActions();
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
            {activeDragId &&
              (() => {
                const s = sectionById.get(activeDragId);
                return s ? (
                  <div
                    className={cx(SECTION_FRAME, SECTION_FRAME_DRAGGING)}
                    style={{
                      width: `${dims.widthPx - (doc.page.padding.left + doc.page.padding.right) * MM_TO_PX}px`,
                    }}
                  >
                    <div className={SECTION_HEADER}>
                      <span className={SECTION_TYPE_LABEL}>
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
