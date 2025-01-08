'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CommandLine({ onSubmit }: { onSubmit: (command: string) => void }) {
  const [command, setCommand] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim()) {
      onSubmit(command)
      setCommand('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 p-4 bg-white shadow-lg">
      <Input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Enter command..."
        className="flex-grow"
      />
      <Button type="submit">Send</Button>
    </form>
  )
}

