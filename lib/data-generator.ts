// Helper functions to generate fake data for missing fields

const stateOptions = ["new customer", "served", "to contact", "paused"]
const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
const days = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "15", "20", "25", "28"]
const years = ["2020", "2021", "2022", "2023", "2024"]

// Generate a random date with time in format YYYY-MM-DD HH:MM:SS
export function generateRandomDate(): string {
  const year = years[Math.floor(Math.random() * years.length)]
  const month = months[Math.floor(Math.random() * months.length)]
  const day = days[Math.floor(Math.random() * days.length)]
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, "0")
  const minute = String(Math.floor(Math.random() * 60)).padStart(2, "0")
  const second = String(Math.floor(Math.random() * 60)).padStart(2, "0")
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// Generate a random state value
export function generateRandomState(): string {
  return stateOptions[Math.floor(Math.random() * stateOptions.length)]
}

// Fill missing State and Created Date fields with fake data
export function fillMissingFields(data: any): any[] {
  return Array.isArray(data)
    ? data.map((row, idx) => ({
        ...row,
        State: row.State || generateRandomState(),
        "Created Date": row["Created Date"] || generateRandomDate(),
      }))
    : data
}
