import { BlockPalette } from '../Palette/BlockPalette'
import { Canvas } from '../Canvas/Canvas'
import './MenuBuilder.css'
import { PropertyPanel } from '../PropertyPanel/PropertyPanel'

export function MenuBuilder() {
  return (
    <div className="menu-builder">
      <BlockPalette />
      <Canvas />
      <PropertyPanel/>  
    </div>
  )
}
