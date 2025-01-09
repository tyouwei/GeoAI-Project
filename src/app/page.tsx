'use client'

import WorldMap from './components/WorldMap'
import CommandLine from './components/CommandLine'
import { handleCommand } from './controller/controller'


export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <CommandLine onSubmit={handleCommand} />
      <WorldMap />
    </div>
  )
}

