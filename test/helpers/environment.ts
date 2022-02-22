export function setEnvVar(name: string, value: string): () => void {
  return () => {
    process.env[name] = value
  }
}

export function unsetEnvVar(name: string): () => void {
  return () => {
    delete process.env[name]
  }
}
