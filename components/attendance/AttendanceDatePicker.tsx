'use client'

interface Props {
  date: string
  today: string
}

export function AttendanceDatePicker({ date, today }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = new URL(window.location.href)
    url.searchParams.set('date', e.target.value)
    window.location.href = url.toString()
  }

  return (
    <form className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">Date:</label>
      <input
        type="date"
        name="date"
        defaultValue={date}
        max={today}
        className="h-9 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        onChange={handleChange}
      />
    </form>
  )
}
