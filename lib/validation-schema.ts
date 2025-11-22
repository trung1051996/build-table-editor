interface FieldSchema {
  required: boolean
  type: string
  minLength?: number
  errorMessage: string
  enum?: string[]
  pattern?: RegExp
}

interface ValidationResult {
  valid: boolean
  error?: string
}

export const fieldValidation: Record<string, FieldSchema> = {
  id: {
    required: true,
    type: "string",
    minLength: 1,
    errorMessage: "ID is required",
  },
  name: {
    required: true,
    type: "string",
    minLength: 1,
    errorMessage: "Name is required",
  },
  language: {
    required: true,
    type: "string",
    minLength: 1,
    errorMessage: "Language is required",
  },
  version: {
    required: false,
    type: "string",
    pattern: /^\d+(\.\d+)*$/, // semver format
    errorMessage: "Version must be in semver format (e.g., 1.0.0)",
  },
  State: {
    required: false,
    type: "string",
    enum: ["new customer", "served", "to contact", "paused"],
    errorMessage: "State must be: new customer, served, to contact, or paused",
  },
  "Created Date": {
    required: false,
    type: "string",
    pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // YYYY-MM-DD HH:MM:SS format
    errorMessage: "Created Date must be in YYYY-MM-DD HH:MM:SS format (e.g., 2025-11-22 13:03:42)",
  },
}

export const validateField = (fieldName: string, value: any): ValidationResult => {
  const schema = fieldValidation[fieldName]
  if (!schema) return { valid: true }

  if (schema.required && (!value || String(value).trim() === "")) {
    if (fieldName === "language") {
      return { valid: false, error: "Language is required" }
    }
    return { valid: false, error: schema.errorMessage }
  }

  // Check if empty and not required
  if (!schema.required && (!value || String(value).trim() === "")) {
    return { valid: true }
  }

  if (schema.enum && fieldName !== "language") {
    const trimmedValue = String(value).trim()
    if (!schema.enum.includes(trimmedValue)) {
      return { valid: false, error: schema.errorMessage }
    }
  }

  // Check pattern
  if (schema.pattern && !schema.pattern.test(String(value))) {
    return { valid: false, error: schema.errorMessage }
  }

  // Check minLength
  if (schema.minLength && String(value).length < schema.minLength) {
    return { valid: false, error: `${fieldName} must be at least ${schema.minLength} characters` }
  }

  return { valid: true }
}
