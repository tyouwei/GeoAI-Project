'use client'

import WorldMap from './components/WorldMap'
import CommandLine from './components/CommandLine'

export default function Home() {
  const handleCommand = (command: string) => {
    // Here you can implement the logic to handle the submitted command
    console.log('Command submitted:', command)
  }

  return (
    <main className="flex flex-col h-screen">
      <WorldMap />
      <CommandLine onSubmit={handleCommand} />
    </main>
  )
}

