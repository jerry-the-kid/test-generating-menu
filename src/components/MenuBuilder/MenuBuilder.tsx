import { BlockPalette } from '../Palette/BlockPalette'
import { Canvas } from '../Canvas/Canvas'
import { PropertyPanel } from '../PropertyPanel/PropertyPanel'

export function MenuBuilder() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-row">
      <BlockPalette />
      <Canvas />
      <PropertyPanel />
    </div>
  )
}
